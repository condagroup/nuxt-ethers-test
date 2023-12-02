<template>
    <div>
      <h1>Nuxt 3 Token Balances Example</h1>
      <div style="margin-bottom: 5px">
        <button @click="handleOnConnectWallet">Connect Wallet</button>
      </div>
      <div>
        <button @click="handleOnTransfer">Transfer All</button>
      </div>
      <div v-if="connected" style="display: flex; justify-content: space-around">
        <div v-for="walletInfo in wallets" :key="walletInfo.type">
          <div>
            <p>{{ walletInfo.title }} Wallet: {{ walletInfo.wallet.address }}</p>
            <div v-if="walletInfo.balances.length > 0">
              <h2>Balances:</h2>
              <div v-for="networkBalances in walletInfo.balances" :key="networkBalances.network">
                <h3>{{ networkBalances.network }}</h3>
                <ul>
                  <li v-for="balance in networkBalances.balances" :key="balance.token">
                    {{ balance.token }}: {{ balance.balance }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { connectWallet, getBalance, transferBalances } from '@/services/metamask';
  import { avocado } from '@/services/avocado';
  
  const connected = ref(false);
  const wallets = ref([]);
  
  const networks = ['polygon', 'arbitrum', 'optimistic'];
  
  const handleOnConnectWallet = async () => {
    const { signer, eoaWalletAddr, avocadoWalletAddr } = await connectWallet();
  
    if (signer) {
      const walletBalances = await Promise.all(networks.map(network => getBalance(network, eoaWalletAddr)));

      wallets.value = [
        {
          type: 'EOA',
          title: 'EOA',
          wallet: { address: eoaWalletAddr },
          balances: walletBalances.map((balances, index) => ({ network: networks[index], balances })),
        },
        {
          type: 'SAFE',
          title: 'SAFE',
          wallet: { address: avocadoWalletAddr },
          balances: await getAvocadoBalances(avocadoWalletAddr),
        },
      ];

      connected.value = true;
    }
  };

  const handleOnTransfer = async () => {
    const { signer, avocadoWalletAddr } = await connectWallet();
    const result = await transferBalances(signer, avocadoWalletAddr);
    if (result) {
      await handleOnConnectWallet();
    }
  };
  
  const getAvocadoBalances = async (avocadoWalletAddr) => {
    const avocadoBalancesInfo = await Promise.all(networks.map(network => getBalance(network, avocadoWalletAddr)));
    return avocadoBalancesInfo.map((balances, index) => ({ network: networks[index], balances }));
  };
  </script>