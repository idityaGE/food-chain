// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./ParticipantRegistry.sol";

contract ProduceTracker is Ownable {
    ParticipantRegistry public participantRegistry;

    enum BatchStatus {
        Registered,
        InTransit,
        AtDistributor,
        AtRetailer,
        Sold,
        Spoiled,
        Disputed
    }

    struct ProduceBatch {
        string batchId;
        address farmer;
        string produceType; // e.g., "Organic Tomatoes", "Basmati Rice"
        uint256 quantity; // Quantity (e.g., in kg, dozens)
        string quantityUnit; // e.g., "kg", "dozens", "pieces"
        uint256 registrationTimestamp; // When the batch was first registered
        string originLocation; // GPS coordinates or detailed farm address
        string currentOwnerName; // Caching owner name for easy display
        address currentOwner; // Address of the current owner
        BatchStatus status; // Current status of the batch
        string currentPrice; // Current price (could be more complex, e.g., struct with currency)
        string imageHash; // IPFS hash of initial produce image
        string detailsHash; // IPFS hash for additional batch details (e.g., certifications)
    }

    // Struct for a supply chain event (transfer, quality check, pricing update)
    struct SupplyChainEvent {
        uint256 eventId;
        address participant; // Who performed the action
        uint256 timestamp;
        string eventType; // e.g., "Registered", "Transferred", "QualityCheck", "PriceUpdate"
        string location; // Location where event occurred
        string details; // Specific details for the event
        string documentHash; // IPFS hash of any supporting documents (e.g., quality report, invoice)
    }

    // Mapping from batchId to ProduceBatch struct
    mapping(string => ProduceBatch) public produceBatches;

    // Mapping from batchId to an array of SupplyChainEvents
    mapping(string => SupplyChainEvent[]) public batchEvents;

    // Counter for unique event IDs
    uint256 private _eventCounter;

    // Events to log important actions
    event BatchRegistered(
        string indexed batchId,
        address indexed farmer,
        string produceType,
        uint256 quantity,
        string originLocation
    );
    event BatchTransferred(
        string indexed batchId,
        address indexed from,
        address indexed to,
        string location,
        string price,
        BatchStatus newStatus
    );
    event QualityCheckRecorded(
        string indexed batchId,
        address indexed checker,
        string result,
        string location,
        string documentHash
    );
    event BatchStatusUpdated(
        string indexed batchId,
        BatchStatus oldStatus,
        BatchStatus newStatus,
        string reason
    );
    event PriceUpdated(
        string indexed batchId,
        address indexed updater,
        string newPrice
    );
    event DisputeRaised(
        string indexed batchId,
        address indexed disputer,
        string reason,
        string detailsHash
    );
    event DisputeResolved(
        string indexed batchId,
        address indexed resolver,
        string resolution,
        string resolutionHash
    );

    constructor(address _participantRegistryAddress) Ownable(msg.sender) {
        require(
            _participantRegistryAddress != address(0),
            "Invalid ParticipantRegistry address"
        );
        participantRegistry = ParticipantRegistry(_participantRegistryAddress);
    }

    // --- Internal / Helper Functions ---

    /**
     * @dev Increments the event counter and returns the new ID.
     */
    function _getNextEventId() internal returns (uint256) {
        _eventCounter++;
        return _eventCounter;
    }

    /**
     * @dev Internal function to add a new event to a batch's history.
     */
    function _addEvent(
        string memory _batchId,
        string memory _eventType,
        string memory _location,
        string memory _details,
        string memory _documentHash
    ) internal {
        batchEvents[_batchId].push(
            SupplyChainEvent({
                eventId: _getNextEventId(),
                participant: msg.sender,
                timestamp: block.timestamp,
                eventType: _eventType,
                location: _location,
                details: _details,
                documentHash: _documentHash
            })
        );
    }

    /**
     * @dev Checks if a batch exists and is not sold or spoiled.
     */
    modifier validBatch(string memory _batchId) {
        require(
            bytes(produceBatches[_batchId].batchId).length > 0,
            "Batch does not exist"
        );
        require(
            produceBatches[_batchId].status != BatchStatus.Sold,
            "Batch is already sold"
        );
        require(
            produceBatches[_batchId].status != BatchStatus.Spoiled,
            "Batch is spoiled"
        );
        _;
    }

    modifier onlyBatchOwner(string memory _batchId) {
        require(
            produceBatches[_batchId].currentOwner == msg.sender,
            "Not the current owner of the batch"
        );
        _;
    }

    // --- External Functions ---

    function registerProduceBatch(
        string memory _batchId,
        string memory _produceType,
        uint256 _quantity,
        string memory _quantityUnit,
        string memory _originLocation,
        string memory _initialPrice,
        string memory _imageHash,
        string memory _detailsHash
    ) public {
        require(
            participantRegistry.isParticipantActive(msg.sender),
            "Not a registered and active participant"
        );
        require(
            participantRegistry.isParticipantType(
                msg.sender,
                ParticipantRegistry.ParticipantType.Farmer
            ),
            "Caller is not a Farmer"
        );
        require(bytes(_batchId).length > 0, "Batch ID cannot be empty");
        require(
            bytes(produceBatches[_batchId].batchId).length == 0,
            "Batch ID already exists"
        );
        require(_quantity > 0, "Quantity must be greater than zero");

        (string memory farmerName, , , , , ) = participantRegistry
            .getParticipant(msg.sender);

        produceBatches[_batchId] = ProduceBatch({
            batchId: _batchId,
            farmer: msg.sender,
            produceType: _produceType,
            quantity: _quantity,
            quantityUnit: _quantityUnit,
            registrationTimestamp: block.timestamp,
            originLocation: _originLocation,
            currentOwnerName: farmerName,
            currentOwner: msg.sender,
            status: BatchStatus.Registered,
            currentPrice: _initialPrice,
            imageHash: _imageHash,
            detailsHash: _detailsHash
        });

        _addEvent(
            _batchId,
            "Registered",
            _originLocation,
            string(
                abi.encodePacked(
                    "Initial quantity: ",
                    _quantityUnit,
                    " ",
                    Strings.toString(_quantity),
                    " - Price: ",
                    _initialPrice
                )
            ),
            _detailsHash // Use detailsHash for initial documents
        );

        emit BatchRegistered(
            _batchId,
            msg.sender,
            _produceType,
            _quantity,
            _originLocation
        );
    }

    function transferProduce(
        string memory _batchId,
        address _newOwner,
        string memory _transferLocation,
        string memory _transferPrice,
        string memory _deliveryNoteHash
    ) public validBatch(_batchId) onlyBatchOwner(_batchId) {
        require(
            participantRegistry.isParticipantActive(msg.sender),
            "Not a registered and active participant"
        );
        require(_newOwner != address(0), "New owner address cannot be zero");
        require(_newOwner != msg.sender, "Cannot transfer to self");
        require(
            participantRegistry.isParticipantActive(_newOwner),
            "New owner is not a registered participant"
        );

        ProduceBatch storage batch = produceBatches[_batchId];
        address oldOwner = batch.currentOwner;
        BatchStatus oldStatus = batch.status;

        // Determine new status based on new owner type
        (
            string memory newOwnerName,
            ,
            ,
            ParticipantRegistry.ParticipantType newOwnerType,
            ,

        ) = participantRegistry.getParticipant(_newOwner);

        BatchStatus newStatus;
        if (newOwnerType == ParticipantRegistry.ParticipantType.Distributor) {
            newStatus = BatchStatus.AtDistributor;
        } else if (
            newOwnerType == ParticipantRegistry.ParticipantType.Retailer
        ) {
            newStatus = BatchStatus.AtRetailer;
        } else {
            revert("Invalid recipient type for transfer"); // Only transfer to Distributor or Retailer
        }

        batch.currentOwner = _newOwner;
        batch.currentOwnerName = newOwnerName;
        batch.currentPrice = _transferPrice;
        batch.status = newStatus;

        (string memory name, , , , , ) = participantRegistry.participants(
            oldOwner
        );

        _addEvent(
            _batchId,
            "Transferred",
            _transferLocation,
            string(
                abi.encodePacked(
                    "Transferred from ",
                    name,
                    " to ",
                    newOwnerName,
                    " for price ",
                    _transferPrice
                )
            ),
            _deliveryNoteHash
        );

        emit BatchTransferred(
            _batchId,
            oldOwner,
            _newOwner,
            _transferLocation,
            _transferPrice,
            newStatus
        );
    }

    /**
     * @dev Records a quality check for a specific batch.
     *      Can be called by Farmer, Distributor, or Retailer if they are the current owner.
     * @param _batchId The ID of the produce batch.
     * @param _checkLocation The location where the quality check was performed.
     * @param _results A summary of the quality check (e.g., "Good condition", "Minor bruising").
     * @param _documentHash IPFS hash of a detailed quality report or images.
     */
    function recordQualityCheck(
        string memory _batchId,
        string memory _checkLocation,
        string memory _results,
        string memory _documentHash
    ) public validBatch(_batchId) onlyBatchOwner(_batchId) {
        require(
            participantRegistry.isParticipantActive(msg.sender),
            "Not a registered and active participant"
        );
        // No status change, just adds an event
        _addEvent(
            _batchId,
            "QualityCheck",
            _checkLocation,
            _results,
            _documentHash
        );

        emit QualityCheckRecorded(
            _batchId,
            msg.sender,
            _results,
            _checkLocation,
            _documentHash
        );
    }

    /**
     * @dev Allows the current owner (Retailer) to mark a batch as sold to a consumer.
     *      This is the final state in the blockchain lifecycle for a batch.
     * @param _batchId The ID of the produce batch.
     * @param _saleLocation The location where the sale occurred (e.g., retail store address).
     * @param _finalPrice The final retail price.
     */
    function markAsSold(
        string memory _batchId,
        string memory _saleLocation,
        string memory _finalPrice
    ) public validBatch(_batchId) onlyBatchOwner(_batchId) {
        require(
            participantRegistry.isParticipantType(
                msg.sender,
                ParticipantRegistry.ParticipantType.Retailer
            ),
            "Caller is not a Retailer"
        );
        ProduceBatch storage batch = produceBatches[_batchId];
        batch.status = BatchStatus.Sold;
        batch.currentPrice = _finalPrice;

        _addEvent(
            _batchId,
            "Sold",
            _saleLocation,
            string(
                abi.encodePacked("Sold to consumer for price ", _finalPrice)
            ),
            "" // No specific document for a consumer sale often, can be empty
        );

        emit BatchStatusUpdated(
            _batchId,
            BatchStatus.AtRetailer,
            BatchStatus.Sold,
            "Sold to consumer"
        );
    }

    /**
     * @dev Allows the current owner to mark a batch as spoiled.
     * @param _batchId The ID of the produce batch.
     * @param _reason The reason for spoilage.
     * @param _detailsHash IPFS hash of any supporting documents (e.g., disposal report, images).
     */
    function markAsSpoiled(
        string memory _batchId,
        string memory _reason,
        string memory _detailsHash
    ) public validBatch(_batchId) onlyBatchOwner(_batchId) {
        require(
            participantRegistry.isParticipantActive(msg.sender),
            "Not a registered and active participant"
        );
        ProduceBatch storage batch = produceBatches[_batchId];
        BatchStatus oldStatus = batch.status;
        batch.status = BatchStatus.Spoiled;

        (, , string memory location, , , ) = participantRegistry.participants(
            msg.sender
        );

        _addEvent(_batchId, "Spoiled", location, _reason, _detailsHash);

        emit BatchStatusUpdated(
            _batchId,
            oldStatus,
            BatchStatus.Spoiled,
            _reason
        );
    }

    /**
     * @dev Allows any registered participant to raise a dispute against a batch.
     * @param _batchId The ID of the produce batch.
     * @param _reason A description of the dispute (e.g., "Quantity discrepancy").
     * @param _detailsHash IPFS hash of supporting evidence for the dispute.
     */
    function raiseDispute(
        string memory _batchId,
        string memory _reason,
        string memory _detailsHash
    )
        public
        validBatch(_batchId) // Allow dispute even if owner is not current sender.
    {
        require(
            participantRegistry.isParticipantActive(msg.sender),
            "Not a registered and active participant"
        );
        ProduceBatch storage batch = produceBatches[_batchId];
        BatchStatus oldStatus = batch.status;
        batch.status = BatchStatus.Disputed;

        (
            string memory name,
            ,
            string memory location,
            ,
            ,

        ) = participantRegistry.participants(msg.sender);

        _addEvent(_batchId, "DisputeRaised", location, _reason, _detailsHash);

        emit DisputeRaised(_batchId, msg.sender, _reason, _detailsHash);
        emit BatchStatusUpdated(
            _batchId,
            oldStatus,
            BatchStatus.Disputed,
            string(abi.encodePacked("Dispute raised by ", name))
        );
    }

    /**
     * @dev Allows the contract owner (or a designated Regulator) to resolve a dispute.
     *      Changes the batch status back to its previous state or to a resolved state.
     * @param _batchId The ID of the produce batch.
     * @param _resolution The outcome of the dispute (e.g., "Resolved in favor of farmer").
     * @param _resolutionHash IPFS hash of the official dispute resolution document.
     * @param _finalStatus The status the batch should be set to after resolution.
     */
    function resolveDispute(
        string memory _batchId,
        string memory _resolution,
        string memory _resolutionHash,
        BatchStatus _finalStatus
    ) public onlyOwner {
        // Or add a modifier for a Regulator role
        require(
            bytes(produceBatches[_batchId].batchId).length > 0,
            "Batch does not exist"
        );
        require(
            produceBatches[_batchId].status == BatchStatus.Disputed,
            "Batch is not currently under dispute"
        );
        require(
            _finalStatus != BatchStatus.Disputed,
            "Cannot resolve to a disputed state"
        );
        require(
            _finalStatus != BatchStatus.Registered,
            "Cannot resolve to a registered state, use InTransit or AtDistributor/Retailer"
        );

        ProduceBatch storage batch = produceBatches[_batchId];
        BatchStatus oldStatus = batch.status;
        batch.status = _finalStatus; // Set back to previous or new appropriate status

        (, , string memory location, , , ) = participantRegistry.participants(
            msg.sender
        );

        _addEvent(
            _batchId,
            "DisputeResolved",
            location,
            _resolution,
            _resolutionHash
        );

        emit DisputeResolved(
            _batchId,
            msg.sender,
            _resolution,
            _resolutionHash
        );
        emit BatchStatusUpdated(
            _batchId,
            oldStatus,
            _finalStatus,
            "Dispute resolved"
        );
    }

    /**
     * @dev Updates the current price of a batch.
     *      Can be called by the current owner.
     * @param _batchId The ID of the produce batch.
     * @param _newPrice The new price for the batch.
     */
    function updateBatchPrice(
        string memory _batchId,
        string memory _newPrice
    ) public validBatch(_batchId) onlyBatchOwner(_batchId) {
        require(
            participantRegistry.isParticipantActive(msg.sender),
            "Not a registered and active participant"
        );
        ProduceBatch storage batch = produceBatches[_batchId];
        batch.currentPrice = _newPrice;

        (, , string memory location, , , ) = participantRegistry.participants(
            msg.sender
        );

        _addEvent(
            _batchId,
            "PriceUpdate",
            location,
            string(abi.encodePacked("Price updated to ", _newPrice)),
            ""
        );

        emit PriceUpdated(_batchId, msg.sender, _newPrice);
    }

    // --- View Functions (for retrieving data) ---

    function getProduceBatch(
        string memory _batchId
    )
        public
        view
        returns (
            string memory batchId,
            address farmer,
            string memory produceType,
            uint256 quantity,
            string memory quantityUnit,
            uint256 registrationTimestamp,
            string memory originLocation,
            string memory currentOwnerName,
            address currentOwner,
            BatchStatus status,
            string memory currentPrice,
            string memory imageHash,
            string memory detailsHash
        )
    {
        require(
            bytes(produceBatches[_batchId].batchId).length > 0,
            "Batch does not exist"
        );
        ProduceBatch storage batch = produceBatches[_batchId];
        return (
            batch.batchId,
            batch.farmer,
            batch.produceType,
            batch.quantity,
            batch.quantityUnit,
            batch.registrationTimestamp,
            batch.originLocation,
            batch.currentOwnerName,
            batch.currentOwner,
            batch.status,
            batch.currentPrice,
            batch.imageHash,
            batch.detailsHash
        );
    }

    /**
     * @dev Retrieves the full event history for a specific produce batch.
     * @param _batchId The ID of the produce batch.
     * @return An array of SupplyChainEvent structs.
     */
    function getBatchHistory(
        string memory _batchId
    ) public view returns (SupplyChainEvent[] memory) {
        require(
            bytes(produceBatches[_batchId].batchId).length > 0,
            "Batch does not exist"
        );
        return batchEvents[_batchId];
    }
}

// Utility library to convert uint to string, required by some functions
library Strings {
    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by Oraclize's uint-to-string conversion implementation
        // https://github.com/oraclize/ethereum-api/blob/master/contracts/usingOraclize.sol
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
