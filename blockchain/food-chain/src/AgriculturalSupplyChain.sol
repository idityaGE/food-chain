// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AgriculturalSupplyChain {
    enum StakeholderRole {
        Farmer,
        Distributor,
        Retailer,
        Consumer
    }
    enum ProductStatus {
        Produced,
        InTransit,
        Delivered,
        Sold
    }
    enum QualityGrade {
        A,
        B,
        C,
        Rejected
    }

    // Events
    event StakeholderRegistered(
        address indexed stakeholder,
        StakeholderRole role
    );
    event ProductBatchCreated(
        uint256 indexed batchId,
        address indexed farmer,
        string productType
    );
    event BatchSplit(
        uint256 indexed parentBatchId,
        uint256[] childBatchIds,
        uint256[] quantities
    );
    event PartialTransfer(
        uint256 indexed fromBatchId,
        uint256 indexed toBatchId,
        uint256 quantity,
        address indexed to
    );
    event FullTransfer(
        uint256 indexed batchId,
        address indexed from,
        address indexed to,
        uint256 price
    );
    event QualityVerified(
        uint256 indexed batchId,
        QualityGrade grade,
        address indexed verifier
    );
    event ProductStatusUpdated(uint256 indexed batchId, ProductStatus status);

    struct Stakeholder {
        address stakeholderAddress;
        StakeholderRole role;
        string name;
        bool isVerified;
        uint256 registrationTime;
        string dataHash;
    }

    struct ProductBatch {
        uint256 batchId;
        address currentOwner;
        address originalFarmer; // Always points to the original farmer
        string productType;
        uint256 totalQuantity; // Original total quantity
        uint256 availableQuantity; // Current available quantity
        uint256 harvestDate;
        uint256 expiryDate;
        ProductStatus status;
        QualityGrade qualityGrade;
        uint256 basePrice;
        string originHash;
        string qualityHash;
        bool exists;
        // Batch hierarchy for tracking splits
        uint256 parentBatchId; // 0 if original batch, parent ID if split
        uint256[] childBatchIds; // Array of child batch IDs if this batch was split
        bool isActive; // false if fully transferred/split
    }

    struct PartialTransferRecord {
        uint256 fromBatchId;
        uint256 toBatchId;
        address from;
        address to;
        uint256 quantity;
        uint256 pricePerUnit;
        uint256 timestamp;
        string transactionHash;
    }

    // State variables
    address public admin;
    uint256 public nextBatchId;

    mapping(address => Stakeholder) public stakeholders;
    mapping(uint256 => ProductBatch) public productBatches;
    mapping(uint256 => PartialTransferRecord[]) public batchTransferHistory;
    mapping(address => uint256[]) public stakeholderBatches;

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyVerifiedStakeholder() {
        require(
            stakeholders[msg.sender].isVerified,
            "Stakeholder not verified"
        );
        _;
    }

    modifier onlyBatchOwner(uint256 _batchId) {
        require(
            productBatches[_batchId].currentOwner == msg.sender,
            "Not the batch owner"
        );
        _;
    }

    modifier batchExists(uint256 _batchId) {
        require(productBatches[_batchId].exists, "Batch does not exist");
        _;
    }

    modifier batchActive(uint256 _batchId) {
        require(productBatches[_batchId].isActive, "Batch is not active");
        _;
    }

    constructor() {
        admin = msg.sender;
        nextBatchId = 1;
    }

    // Register stakeholders (same as before)
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

    // Create new product batch
    function createProductBatch(
        string memory _productType,
        uint256 _quantity,
        uint256 _harvestDate,
        uint256 _expiryDate,
        uint256 _basePrice,
        string memory _originHash,
        string memory _qualityHash
    ) external onlyVerifiedStakeholder returns (uint256) {
        require(
            stakeholders[msg.sender].role == StakeholderRole.Farmer,
            "Only farmers can create batches"
        );
        require(_quantity > 0, "Quantity must be greater than 0");
        require(
            _expiryDate > _harvestDate,
            "Expiry date must be after harvest date"
        );
        require(_basePrice > 0, "Price must be greater than 0");

        uint256 batchId = nextBatchId++;

        productBatches[batchId] = ProductBatch({
            batchId: batchId,
            currentOwner: msg.sender,
            originalFarmer: msg.sender,
            productType: _productType,
            totalQuantity: _quantity,
            availableQuantity: _quantity,
            harvestDate: _harvestDate,
            expiryDate: _expiryDate,
            status: ProductStatus.Produced,
            qualityGrade: QualityGrade.A,
            basePrice: _basePrice,
            originHash: _originHash,
            qualityHash: _qualityHash,
            exists: true,
            parentBatchId: 0, // This is an original batch
            childBatchIds: new uint256[](0),
            isActive: true
        });

        stakeholderBatches[msg.sender].push(batchId);

        emit ProductBatchCreated(batchId, msg.sender, _productType);
        return batchId;
    }

    // Transfer partial quantity to another stakeholder
    function transferPartialBatch(
        uint256 _batchId,
        address _to,
        uint256 _quantity,
        uint256 _pricePerUnit,
        string memory _transactionHash
    )
        external
        payable
        onlyBatchOwner(_batchId)
        batchExists(_batchId)
        batchActive(_batchId)
        returns (uint256)
    {
        require(stakeholders[_to].isVerified, "Receiver not verified");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(
            _quantity <= productBatches[_batchId].availableQuantity,
            "Insufficient quantity available"
        );

        uint256 totalPrice = _quantity * _pricePerUnit;
        require(msg.value >= totalPrice, "Insufficient payment");

        ProductBatch storage sourceBatch = productBatches[_batchId];

        // Create new batch for the transferred portion
        uint256 newBatchId = nextBatchId++;

        // Create the new batch with transferred quantity
        productBatches[newBatchId] = ProductBatch({
            batchId: newBatchId,
            currentOwner: _to,
            originalFarmer: sourceBatch.originalFarmer, // Keep original farmer reference
            productType: sourceBatch.productType,
            totalQuantity: _quantity, // New batch has only the transferred quantity
            availableQuantity: _quantity,
            harvestDate: sourceBatch.harvestDate,
            expiryDate: sourceBatch.expiryDate,
            status: ProductStatus.InTransit,
            qualityGrade: sourceBatch.qualityGrade,
            basePrice: sourceBatch.basePrice,
            originHash: sourceBatch.originHash,
            qualityHash: sourceBatch.qualityHash,
            exists: true,
            parentBatchId: _batchId, // Link to parent batch
            childBatchIds: new uint256[](0),
            isActive: true
        });

        // Update source batch
        sourceBatch.availableQuantity -= _quantity;
        sourceBatch.childBatchIds.push(newBatchId);

        // If source batch is fully transferred, mark as inactive
        if (sourceBatch.availableQuantity == 0) {
            sourceBatch.isActive = false;
        }

        // Add new batch to receiver's batches
        stakeholderBatches[_to].push(newBatchId);

        // Record the transfer
        batchTransferHistory[_batchId].push(
            PartialTransferRecord({
                fromBatchId: _batchId,
                toBatchId: newBatchId,
                from: msg.sender,
                to: _to,
                quantity: _quantity,
                pricePerUnit: _pricePerUnit,
                timestamp: block.timestamp,
                transactionHash: _transactionHash
            })
        );

        // Also record in the new batch's history
        batchTransferHistory[newBatchId].push(
            PartialTransferRecord({
                fromBatchId: _batchId,
                toBatchId: newBatchId,
                from: msg.sender,
                to: _to,
                quantity: _quantity,
                pricePerUnit: _pricePerUnit,
                timestamp: block.timestamp,
                transactionHash: _transactionHash
            })
        );

        // Transfer payment
        payable(msg.sender).transfer(totalPrice);

        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit PartialTransfer(_batchId, newBatchId, _quantity, _to);
        return newBatchId;
    }

    // Transfer entire batch (for backward compatibility)
    function transferFullBatch(
        uint256 _batchId,
        address _to,
        uint256 _totalPrice,
        string memory _transactionHash
    )
        external
        payable
        onlyBatchOwner(_batchId)
        batchExists(_batchId)
        batchActive(_batchId)
    {
        require(stakeholders[_to].isVerified, "Receiver not verified");
        require(msg.value >= _totalPrice, "Insufficient payment");
        require(_totalPrice > 0, "Price must be greater than 0");

        ProductBatch storage batch = productBatches[_batchId];
        address previousOwner = batch.currentOwner;

        // Update batch ownership
        batch.currentOwner = _to;
        batch.status = ProductStatus.InTransit;

        // Add to new owner's batches
        stakeholderBatches[_to].push(_batchId);

        // Record transaction
        batchTransferHistory[_batchId].push(
            PartialTransferRecord({
                fromBatchId: _batchId,
                toBatchId: _batchId, // Same batch ID for full transfer
                from: previousOwner,
                to: _to,
                quantity: batch.availableQuantity,
                pricePerUnit: _totalPrice / batch.availableQuantity,
                timestamp: block.timestamp,
                transactionHash: _transactionHash
            })
        );

        // Transfer payment
        payable(previousOwner).transfer(_totalPrice);

        // Refund excess payment
        if (msg.value > _totalPrice) {
            payable(msg.sender).transfer(msg.value - _totalPrice);
        }

        emit FullTransfer(_batchId, previousOwner, _to, _totalPrice);
    }

    // Get batch genealogy (parent and children)
    function getBatchGenealogy(
        uint256 _batchId
    )
        external
        view
        batchExists(_batchId)
        returns (
            uint256 parentBatchId,
            uint256[] memory childBatchIds,
            uint256 originalBatchId
        )
    {
        ProductBatch storage batch = productBatches[_batchId];

        // Find the original batch by going up the parent chain
        uint256 originalId = _batchId;
        while (productBatches[originalId].parentBatchId != 0) {
            originalId = productBatches[originalId].parentBatchId;
        }

        return (batch.parentBatchId, batch.childBatchIds, originalId);
    }

    // Get all batches derived from an original batch (including splits)
    function getAllDerivedBatches(
        uint256 _originalBatchId
    ) external view returns (uint256[] memory) {
        require(
            productBatches[_originalBatchId].parentBatchId == 0,
            "Not an original batch"
        );

        uint256[] memory allBatches = new uint256[](100); // Temporary array
        uint256 count = 0;

        // Add the original batch
        allBatches[count++] = _originalBatchId;

        // Recursively add all child batches
        count = _addChildBatches(_originalBatchId, allBatches, count, 10);

        // Create properly sized array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = allBatches[i];
        }

        return result;
    }

    // Helper function for recursive child batch addition
    function _addChildBatches(
        uint256 _batchId,
        uint256[] memory _allBatches,
        uint256 _count,
        uint8 _depthLimit
    ) internal view returns (uint256) {
        if (_depthLimit == 0) return count;
        ProductBatch storage batch = productBatches[_batchId];

        for (uint256 i = 0; i < batch.childBatchIds.length; i++) {
            uint256 childId = batch.childBatchIds[i];
            _allBatches[_count++] = childId;
            _count = _addChildBatches(
                childId,
                _allBatches,
                _count,
                _depthLimit - 1
            );
        }

        return _count;
    }

    // Update product status
    function updateProductStatus(
        uint256 _batchId,
        ProductStatus _status
    ) external onlyBatchOwner(_batchId) batchExists(_batchId) {
        productBatches[_batchId].status = _status;
        emit ProductStatusUpdated(_batchId, _status);
    }

    // Verify quality
    function verifyQuality(
        uint256 _batchId,
        QualityGrade _grade,
        string memory _newQualityHash
    ) external onlyVerifiedStakeholder batchExists(_batchId) {
        productBatches[_batchId].qualityGrade = _grade;
        if (bytes(_newQualityHash).length > 0) {
            productBatches[_batchId].qualityHash = _newQualityHash;
        }

        emit QualityVerified(_batchId, _grade, msg.sender);
    }

    // Get batch transfer history
    function getBatchTransferHistory(
        uint256 _batchId
    )
        external
        view
        batchExists(_batchId)
        returns (PartialTransferRecord[] memory)
    {
        return batchTransferHistory[_batchId];
    }

    // Get stakeholder's batches
    function getStakeholderBatches(
        address _stakeholder
    ) external view returns (uint256[] memory) {
        return stakeholderBatches[_stakeholder];
    }

    // Get batch details with quantity information
    function getBatchDetails(
        uint256 _batchId
    )
        external
        view
        batchExists(_batchId)
        returns (
            address currentOwner,
            address originalFarmer,
            string memory productType,
            uint256 totalQuantity,
            uint256 availableQuantity,
            uint256 harvestDate,
            uint256 expiryDate,
            ProductStatus status,
            QualityGrade qualityGrade,
            uint256 basePrice,
            string memory originHash,
            string memory qualityHash,
            uint256 parentBatchId,
            bool isActive
        )
    {
        ProductBatch storage batch = productBatches[_batchId];
        return (
            batch.currentOwner,
            batch.originalFarmer,
            batch.productType,
            batch.totalQuantity,
            batch.availableQuantity,
            batch.harvestDate,
            batch.expiryDate,
            batch.status,
            batch.qualityGrade,
            batch.basePrice,
            batch.originHash,
            batch.qualityHash,
            batch.parentBatchId,
            batch.isActive
        );
    }

    // Check if partial transfer is possible
    function canTransferPartial(
        uint256 _batchId,
        uint256 _quantity
    ) external view returns (bool) {
        if (
            !productBatches[_batchId].exists ||
            !productBatches[_batchId].isActive
        ) {
            return false;
        }
        return productBatches[_batchId].availableQuantity >= _quantity;
    }

    // Emergency functions
    function updateAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin address");
        admin = _newAdmin;
    }

    // Get stakeholder details (same as before)
    function getStakeholderDetails(
        address _stakeholder
    )
        external
        view
        returns (
            StakeholderRole role,
            string memory name,
            bool isVerified,
            uint256 registrationTime,
            string memory dataHash
        )
    {
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
