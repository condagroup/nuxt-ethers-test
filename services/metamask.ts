import * as ether from "ethers";
const { ethers } = ether;

import { avocado } from "./avocado";

const networkTokens: any = {
  polygon: {
    USDC: {
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      abi: ["function balanceOf(address) view returns (uint256)", "function transfer(address to, uint256 amount) returns (bool)"],
      provider: "https://polygon-rpc.com/",
      chainId: 137,
    },
  },
  arbitrum: {
    DAI: {
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      abi: ["function balanceOf(address) view returns (uint256)", "function transfer(address to, uint256 amount) returns (bool)"],
      provider: "https://arb1.arbitrum.io/rpc",
      chainId: 42161,
    },
  },
  optimistic: {
    USDT: {
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      abi: ["function balanceOf(address) view returns (uint256)", "function transfer(address to, uint256 amount) returns (bool)"],
      provider: "https://mainnet.optimism.io",
      chainId: 10,
    },
  },
};

export async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const avocadoWalletAddr = await avocado(signer.address);
      return { signer, avocadoWalletAddr };
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
    const balances = getBalance(network, address);
    return balances;
  } catch (error) {
    console.error("Error getting token balances:", error);
    return null;
  }
}

export async function getBalance(network: any, address: any) {
  const tokenData = networkTokens[network];
  if (!tokenData) {
    console.error("Unsupported network:", network);
    return null;
  }

  const balances = await Promise.all(
    Object.entries(tokenData).map(
      async ([
        token,
        { address: tokenAddress, abi, provider: networkProvider },
      ]) => {
        return new Promise(async (resolve, reject) => {
          const provider = new ethers.JsonRpcProvider(networkProvider);
          const contract = new ethers.Contract(tokenAddress, abi, provider);
          const balance = formatString(
            (await contract.balanceOf(address)).toString()
          );
          resolve({
            token,
            balance: balance,
          });
        });
      }
    )
  );
  return balances;
}

export async function transferBalances(signer: ether.Signer, toAddress: string) {
  const fromAddress = signer.getAddress();
  let oldSigner = signer;
  const allPromises = await Promise.all(
    Object.entries(networkTokens).map(async ([networkName, item]) => {
      const promises = Object.keys(item).map(async (key) => {
        const { createdSigner: newSigner, createdProvider: newProvider } = await switchNetwork(oldSigner, item[key].chainId);
        const contract = new ethers.Contract(item[key].address, item[key].abi, newProvider);
        const balance = await contract.balanceOf(fromAddress);
        oldSigner = newSigner;
        return transfer(newSigner, toAddress, balance);
      });

      return Promise.all(promises);
    })
  );

  return allPromises.flat();
}

async function switchNetwork(oldSigner: ether.Signer, chainId: number) {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: `0x${chainId.toString(16)}` }],
  });
  const createdProvider = oldSigner.provider;
  const createdSigner = oldSigner.connect(createdProvider);
  return {createdSigner, createdProvider}; 
}
export async function transfer(signer: ether.Signer, to: string, amount: number): Promise<boolean> {
  try {
    const tx = await signer.sendTransaction({
      to,
      value: ethers.parseUnits(amount.toString(), 6),
    });

    await tx.wait();
    console.log('Transfer successful');
    return true;
  } catch (error) {
    console.error('Error transferring funds:', error);
    return false;
  }
}

function formatString(originString: string) {
  console.log(originString);
  const numericValue = parseFloat(originString);

  // Check if the conversion was successful
  if (isNaN(numericValue)) {
    return "Invalid input";
  }

  // Format the number with two decimal places
  const formattedValue = (numericValue / 1000000).toFixed(6);

  // Remove trailing zeros
  const trimmedValue = formattedValue.replace(/\.?0+$/, "");

  return trimmedValue;
}
