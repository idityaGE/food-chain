import { ethers } from 'ethers'
import { type AgriculturalSupplyChain, AgriculturalSupplyChain__factory } from '../../generated/typechain'
import fs from 'fs'

async function intializeContract() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)

  let contract: AgriculturalSupplyChain;

  if (process.env.NODE_ENV === 'dev') {
    const abi = JSON.parse(fs.readFileSync('../abi/AgriculturalSupplyChain.json', 'utf-8'))
    const factory = new ethers.ContractFactory(abi.abi, abi.bytecode, wallet)
    contract = await factory.deploy() as AgriculturalSupplyChain
    await contract.waitForDeployment()
  } else {
    contract = AgriculturalSupplyChain__factory.connect(process.env.CONTRACT_ADDRESS!, wallet)
  }

  return contract
}

const contract = intializeContract().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

export default contract