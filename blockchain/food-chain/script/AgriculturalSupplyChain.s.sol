// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {AgriculturalSupplyChain} from "../src/AgriculturalSupplyChain.sol";

contract AgriculturalSupplyChainScript is Script {
    AgriculturalSupplyChain public agriculturalSupplyChain;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        agriculturalSupplyChain = new AgriculturalSupplyChain();

        vm.stopBroadcast();
    }
}
