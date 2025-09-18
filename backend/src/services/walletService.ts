import { ethers } from 'ethers';

export const getRandomWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
}

export const getAddressFromPrivateKey = (privateKey: string) => {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
}