import { ethers } from 'ethers';
import { type AgriculturalSupplyChain } from './typechain'
import fs from 'fs'

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545")

  const wallet = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider)

  const abi = JSON.parse(fs.readFileSync('./abi/AgriculturalSupplyChain.json', 'utf-8'));

  const factory = new ethers.ContractFactory(abi.abi, abi.bytecode, wallet);

  console.log("Deploying contract...");

  const contract = await factory.deploy() as AgriculturalSupplyChain;
  await contract.waitForDeployment();

  console.log("Contract deployed to:", contract.target);

  const result = await contract.nextBatchId()
  console.log("Next Batch ID:", result.toString());

  const farmerAddress = ethers.Wallet.createRandom().address;
  console.log("Registering stakeholder with address:", farmerAddress);

  const tx = await contract.registerStakeholder(
    farmerAddress,
    1,
    "Aditya",
    "QmHashExample12345",
    { nonce: await provider.getTransactionCount(wallet.address) }
  )

  await tx.wait()

  console.log("Stakeholder registered.");

  const user = await contract.getStakeholderDetails(farmerAddress)
  console.log("Stakeholder Details:", user);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});