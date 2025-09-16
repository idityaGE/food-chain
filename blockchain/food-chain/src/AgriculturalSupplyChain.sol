// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AgriculturalSupplyChain {
    
    // Enums for better code readability
    enum StakeholderRole { Farmer, Distributor, Retailer, Consumer }
    enum ProductStatus { Produced, InTransit, Delivered, Sold }
    enum QualityGrade { A, B, C, Rejected }
    
    // Events for transparency and tracking
    event StakeholderRegistered(address indexed stakeholder, StakeholderRole role);
    event ProductBatchCreated(uint256 indexed batchId, address indexed farmer, string productType);
    event ProductTransferred(uint256 indexed batchId, address indexed from, address indexed to, uint256 price);
    event QualityVerified(uint256 indexed batchId, QualityGrade grade, address indexed verifier);
    event ProductStatusUpdated(uint256 indexed batchId, ProductStatus status);
    
    // Structs to store on-chain data
    struct Stakeholder {
        address stakeholderAddress;
        StakeholderRole role;
        string name;
        bool isVerified;
        uint256 registrationTime;
        string dataHash; // Hash of off-chain detailed profile data
    }
    
    struct ProductBatch {
        uint256 batchId;
        address currentOwner;
        address farmer;
        string productType;
        uint256 quantity; // in kg
        uint256 harvestDate;
        uint256 expiryDate;
        ProductStatus status;
        QualityGrade qualityGrade;
        uint256 basePrice; // price per kg in wei
        string originHash; // Hash of detailed origin data (GPS, soil info, etc.)
        string qualityHash; // Hash of detailed quality reports
        bool exists;
    }
    
    struct Transaction {
        address from;
        address to;
        uint256 timestamp;
        uint256 price;
        string transactionHash; // Hash of detailed transaction data
    }
    
    // State variables
    address public admin;
    uint256 public nextBatchId;
    
    // Mappings
    mapping(address => Stakeholder) public stakeholders;
    mapping(uint256 => ProductBatch) public productBatches;
    mapping(uint256 => Transaction[]) public batchTransactions;
    mapping(address => uint256[]) public stakeholderBatches;
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyVerifiedStakeholder() {
        require(stakeholders[msg.sender].isVerified, "Stakeholder not verified");
        _;
    }
    
    modifier onlyBatchOwner(uint256 _batchId) {
        require(productBatches[_batchId].currentOwner == msg.sender, "Not the batch owner");
        _;
    }
    
    modifier batchExists(uint256 _batchId) {
        require(productBatches[_batchId].exists, "Batch does not exist");
        _;
    }
    
    // Constructor
    constructor() {
        admin = msg.sender;
        nextBatchId = 1;
    }
    
    // Register stakeholders
    function registerStakeholder(
        address _stakeholderAddress,
        StakeholderRole _role,
        string memory _name,
        string memory _dataHash
    ) external onlyAdmin {
        require(_stakeholderAddress != address(0), "Invalid address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        stakeholders[_stakeholderAddress] = Stakeholder({
            stakeholderAddress: _stakeholderAddress,
            role: _role,
            name: _name,
            isVerified: true,
            registrationTime: block.timestamp,
            dataHash: _dataHash
        });
        
        emit StakeholderRegistered(_stakeholderAddress, _role);
    }
    
    // Create new product batch (only farmers)
    function createProductBatch(
        string memory _productType,
        uint256 _quantity,
        uint256 _harvestDate,
        uint256 _expiryDate,
        uint256 _basePrice,
        string memory _originHash,
        string memory _qualityHash
    ) external onlyVerifiedStakeholder returns (uint256) {
        require(stakeholders[msg.sender].role == StakeholderRole.Farmer, "Only farmers can create batches");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(_expiryDate > _harvestDate, "Expiry date must be after harvest date");
        require(_basePrice > 0, "Price must be greater than 0");
        
        uint256 batchId = nextBatchId++;
        
        productBatches[batchId] = ProductBatch({
            batchId: batchId,
            currentOwner: msg.sender,
            farmer: msg.sender,
            productType: _productType,
            quantity: _quantity,
            harvestDate: _harvestDate,
            expiryDate: _expiryDate,
            status: ProductStatus.Produced,
            qualityGrade: QualityGrade.A, // Default grade
            basePrice: _basePrice,
            originHash: _originHash,
            qualityHash: _qualityHash,
            exists: true
        });
        
        stakeholderBatches[msg.sender].push(batchId);
        
        emit ProductBatchCreated(batchId, msg.sender, _productType);
        return batchId;
    }
    
    // Transfer product batch to another stakeholder
    function transferBatch(
        uint256 _batchId,
        address _to,
        uint256 _price,
        string memory _transactionHash
    ) external payable onlyBatchOwner(_batchId) batchExists(_batchId) {
        require(stakeholders[_to].isVerified, "Receiver not verified");
        require(msg.value >= _price, "Insufficient payment");
        require(_price > 0, "Price must be greater than 0");
        
        ProductBatch storage batch = productBatches[_batchId];
        address previousOwner = batch.currentOwner;
        
        // Update batch ownership
        batch.currentOwner = _to;
        batch.status = ProductStatus.InTransit;
        
        // Add to new owner's batches
        stakeholderBatches[_to].push(_batchId);
        
        // Record transaction
        batchTransactions[_batchId].push(Transaction({
            from: previousOwner,
            to: _to,
            timestamp: block.timestamp,
            price: _price,
            transactionHash: _transactionHash
        }));
        
        // Transfer payment to previous owner
        payable(previousOwner).transfer(_price);
        
        // Refund excess payment
        if (msg.value > _price) {
            payable(msg.sender).transfer(msg.value - _price);
        }
        
        emit ProductTransferred(_batchId, previousOwner, _to, _price);
    }
    
    // Update product status
    function updateProductStatus(
        uint256 _batchId,
        ProductStatus _status
    ) external onlyBatchOwner(_batchId) batchExists(_batchId) {
        productBatches[_batchId].status = _status;
        emit ProductStatusUpdated(_batchId, _status);
    }
    
    // Verify quality (can be done by certified inspectors)
    function verifyQuality(
        uint256 _batchId,
        QualityGrade _grade,
        string memory _newQualityHash
    ) external onlyVerifiedStakeholder batchExists(_batchId) {
        // In a real implementation, you'd have specific quality inspector roles
        productBatches[_batchId].qualityGrade = _grade;
        if (bytes(_newQualityHash).length > 0) {
            productBatches[_batchId].qualityHash = _newQualityHash;
        }
        
        emit QualityVerified(_batchId, _grade, msg.sender);
    }
    
    // Get batch transaction history
    function getBatchTransactions(uint256 _batchId) external view batchExists(_batchId) returns (Transaction[] memory) {
        return batchTransactions[_batchId];
    }
    
    // Get stakeholder's batches
    function getStakeholderBatches(address _stakeholder) external view returns (uint256[] memory) {
        return stakeholderBatches[_stakeholder];
    }
    
    // Get batch details
    function getBatchDetails(uint256 _batchId) external view batchExists(_batchId) returns (
        address currentOwner,
        address farmer,
        string memory productType,
        uint256 quantity,
        uint256 harvestDate,
        uint256 expiryDate,
        ProductStatus status,
        QualityGrade qualityGrade,
        uint256 basePrice,
        string memory originHash,
        string memory qualityHash
    ) {
        ProductBatch storage batch = productBatches[_batchId];
        return (
            batch.currentOwner,
            batch.farmer,
            batch.productType,
            batch.quantity,
            batch.harvestDate,
            batch.expiryDate,
            batch.status,
            batch.qualityGrade,
            batch.basePrice,
            batch.originHash,
            batch.qualityHash
        );
    }
    
    // Emergency functions
    function updateAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin address");
        admin = _newAdmin;
    }
    
    // Function to verify stakeholder status
    function isVerifiedStakeholder(address _stakeholder) external view returns (bool) {
        return stakeholders[_stakeholder].isVerified;
    }
    
    // Get stakeholder details
    function getStakeholderDetails(address _stakeholder) external view returns (
        StakeholderRole role,
        string memory name,
        bool isVerified,
        uint256 registrationTime,
        string memory dataHash
    ) {
        Stakeholder storage stakeholder = stakeholders[_stakeholder];
        return (
            stakeholder.role,
            stakeholder.name,
            stakeholder.isVerified,
            stakeholder.registrationTime,
            stakeholder.dataHash
        );
    }
}