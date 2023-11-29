<template>
    <div>
      <h1>Nuxt 3 Token Balances Example</h1>
      <button @click="handleOnConnectWallet">Connect Wallet</button>
      <div v-if="connected">
        <p>EOA Wallet: {{ wallet.address }}</p>
        <div v-if="balances.length > 0">
          <h2>Balances:</h2>
          <div v-for="networkBalances in balances" :key="networkBalances.network">
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
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { connectWallet, getTokenBalances } from '@/services/metamask';
  
  const connected = ref(false);
  const wallet = ref({});
  const balances = ref([]);
  
  const handleOnConnectWallet = async () => {
    const signer = await connectWallet();
    if (signer) {
        connected.value = true;
        const polygonBalancesInfo = await getTokenBalances(signer, 'polygon');
        const arbitrumBalancesInfo = await getTokenBalances(signer, 'arbitrum');
        const optimisticBalancesInfo = await getTokenBalances(signer, 'optimistic');
        const balancesInfo = await Promise.all([
            polygonBalancesInfo,
            arbitrumBalancesInfo,
            optimisticBalancesInfo,
        ]);
        if (balancesInfo.every((info) => info !== null)) {
            wallet.value = { address: await signer.getAddress() };
            balances.value = [
                { network: 'Polygon', balances: balancesInfo[0] },
                { network: 'Arbitrum', balances: balancesInfo[1] },
                { network: 'Optimistic', balances: balancesInfo[2] },
            ];
        }
    }
};
</script>