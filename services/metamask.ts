import * as ether from "ethers";
const { ethers } = ether;

import { avocado } from "./avocado";

const networkTokens: any = {
  polygon: {
    USDC: {
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      abi: ["function balanceOf(address) view returns (uint256)"],
    },
  },
  arbitrum: {
    DAI: {
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      abi: ["function balanceOf(address) view returns (uint256)"],
    },
  },
  optimistic: {
    USDT: {
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      abi: ['function balanceOf(address) view returns (uint256)'],
    },
  },
};

export async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // const walletAddr = await avocado(signer.address);
      return signer;
    } catch (error) {
      console.error("Error connecting to Metamask:", error);
      return null;
    }
  } else {
    console.error("Metamask not found");
    return null;
  }
}

export async function getTokenBalances(signer: ether.Signer, network: string) {
  try {
    const address = await signer.getAddress();
    const tokenData = networkTokens[network];
    if (!tokenData) {
      console.error("Unsupported network:", network);
      return null;
    }
    const balances = await Promise.all(
      Object.entries(tokenData).map(async ([token, { address: tokenAddress, abi }]) => {
        return new Promise(async (resolve, reject) => {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contract = new ethers.Contract(tokenAddress, abi, provider);
          const balance = await contract.balanceOf(address);
          // const tx = signer.sendTransaction({
          //   to: walletAddr,
          //   value: ethers.parseEther("0.0001")
          // })
          // const balance = await contract.balanceOf(address);
          resolve({
            token,
            balance: balance,
          });
        });
      })
    );
    console.log(balances, "balances");
    return balances;
  } catch (error) {
    console.error("Error getting token balances:", error);
    return null;
  }
}
