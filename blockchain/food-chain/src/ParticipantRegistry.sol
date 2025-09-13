// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ParticipantRegistry is Ownable {
    enum ParticipantType {
        None,
        Farmer,
        Distributor,
        Retailer,
        Regulator
    }

    struct Participant {
        string name;
        string contactInfo;
        ParticipantType participantType;
        bool isActive;
        string detailsHash; // web2 data -> hash of additional details
    }

    mapping(address => Participant) public participants;
    mapping(address => bool) public isRegistered;

    event ParticipantRegistered(
        address indexed participantAddress,
        ParticipantType participantType,
        string name
    );
    event ParticipantUpdated(
        address indexed participantAddress,
        string newName,
        string newContactInfo,
        bool newIsActive
    );
    event ParticipantTypeUpdated(
        address indexed participantAddress,
        ParticipantType oldType,
        ParticipantType newType
    );

    modifier onlyRegisteredParticipant() {
        require(isRegistered[msg.sender], "Participant is not registered");
        _;
    }

    modifier onlyParticipantType(ParticipantType _type) {
        require(
            participants[msg.sender].participantType == _type,
            "Incorrect participant type"
        );
        _;
    }

    modifier onlyActiveParticipant() {
        require(participants[msg.sender].isActive, "Participant is not active");
        _;
    }

    constructor() Ownable(msg.sender) {}

    function registerParticipant(
        address _participantAddress,
        string memory _name,
        string memory _contactInfo,
        ParticipantType _type,
        string memory _detailsHash
    ) public onlyOwner {
        require(
            _participantAddress != address(0),
            "Invalid participant address"
        );
        require(
            _type != ParticipantType.None,
            "Invalid participant type for registration"
        );
        require(
            !isRegistered[_participantAddress],
            "Participant already registered"
        );

        participants[_participantAddress] = Participant({
            name: _name,
            contactInfo: _contactInfo,
            participantType: _type,
            isActive: true,
            detailsHash: _detailsHash
        });

        isRegistered[_participantAddress] = true;

        emit ParticipantRegistered(_participantAddress, _type, _name);
    }

    function updateParticipant(
        address _participantAddress,
        string memory _name,
        string memory _contactInfo,
        bool _isActive
    ) public onlyRegisteredParticipant {
        require(
            msg.sender == _participantAddress || msg.sender == owner(),
            "Unauthorized to update participant"
        );

        Participant storage p = participants[_participantAddress];
        p.name = _name;
        p.contactInfo = _contactInfo;
        p.isActive = _isActive;

        emit ParticipantUpdated(
            _participantAddress,
            _name,
            _contactInfo,
            _isActive
        );
    }

    function updateParticipantType(
        address _participantAddress,
        ParticipantType _newType
    ) public onlyOwner onlyRegisteredParticipant {
        require(_newType != ParticipantType.None, "Invalid participant type");

        ParticipantType oldType = participants[_participantAddress]
            .participantType;
        require(oldType != _newType, "New type cannot be the same as old type");

        participants[_participantAddress].participantType = _newType;
        emit ParticipantTypeUpdated(_participantAddress, oldType, _newType);
    }

    function getParticipant(
        address _participantAddress
    )
        public
        view
        onlyRegisteredParticipant
        returns (
            string memory name,
            string memory contactInfo,
            ParticipantType participantType,
            bool isActive,
            string memory detailsHash
        )
    {
        Participant storage p = participants[_participantAddress];
        return (
            p.name,
            p.contactInfo,
            p.participantType,
            p.isActive,
            p.detailsHash
        );
    }

    function getMyParticipantType()
        public
        view
        onlyRegisteredParticipant
        returns (ParticipantType)
    {
        return participants[msg.sender].participantType;
    }

    function isParticipantActive(
        address participant
    ) public view onlyRegisteredParticipant returns (bool) {
        return participants[participant].isActive;
    }

    function isParticipantType(
        address participant,
        ParticipantType _type
    ) public view onlyRegisteredParticipant returns (bool) {
        return participants[participant].participantType == _type;
    }

    function verifyMyDetailsHash(
        string memory _detailsHash
    ) public view onlyRegisteredParticipant returns (bool) {
        return keccak256(abi.encodePacked(participants[msg.sender].detailsHash)) == keccak256(abi.encodePacked(_detailsHash));
    }
}
