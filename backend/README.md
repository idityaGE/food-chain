# regenerate the ABI and copy to backend

forge build
cp ~/experiments/sih-project/blockchain/food-chain/out/AgriculturalSupplyChain.sol/AgriculturalSupplyChain.json ~/experiments/sih-project/backend/abi/

### run this inside the backend directory

bunx typechain --target ethers-v6 --out-dir generated/typechain './abi/\*.json'
