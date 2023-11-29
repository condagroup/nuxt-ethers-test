import { ethers } from 'ethers';

const tokenAddresses = {
  polygon: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  },
  arbitrum: {
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  },
  optimistic: {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
};

export async function getTokenBalances(signer) {
  try {
    const address = await signer.getAddress();
    const network = await signer.getChainId();
    
    const balances = await Promise.all(
      Object.entries(tokenAddresses[network] || {}).map(async ([token, address]) => {
        const tokenContract = new ethers.Contract(address, ['function balanceOf(address) returns (uint256)'], signer);
        const balance = await tokenContract.balanceOf(address);
        return {
          token,
          balance: ethers.utils.formatUnits(balance),
        };
      })
    );

    return balances;
  } catch (error) {
    console.error('Error getting token balances:', error);
    return null;
  }
}