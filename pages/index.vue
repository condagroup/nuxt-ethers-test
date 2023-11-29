<template>
    <div>
      <h1>Nuxt 3 Metamask Example</h1>
      <button @click="connectWallet">Connect Wallet</button>
      <div v-if="connected">
        <p>Address: {{ wallet.address }}</p>
        <div>
          <h2>Balances:</h2>
          <ul>
            <li v-for="balance in balances" :key="balance.token">
              {{ balance.token }}: {{ balance.balance }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { connectWallet, getTokenBalances } from '@/services/metamask';
  
  const connected = ref(false);
  const wallet = ref({});
  const balances = ref([]);
  
  const connectWallet = async () => {
    const signer = await connectWallet();
    if (signer) {
      connected.value = true;
      const balancesInfo = await getTokenBalances(signer);
      if (balancesInfo) {
        wallet.value = { address: await signer.getAddress() };
        balances.value = balancesInfo;
      }
    }
  };
  </script>