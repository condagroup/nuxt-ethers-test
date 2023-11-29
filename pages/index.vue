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
            <div>
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
            <div>
                <p>SAFE Wallet: {{ aocadoWallet.address }}</p>
                <div v-if="avocadoBalances.length > 0">
                    <h2>Balances:</h2>
                    <div v-for="networkBalances in avocadoBalances" :key="networkBalances.network">
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
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { connectWallet, getTokenBalances, getBalance, transferBalances } from '@/services/metamask';
  import { avocado } from '@/services/avocado';
  
  const connected = ref(false);
  const wallet = ref({});
  const aocadoWallet = ref({});
  const balances = ref([]);
  const avocadoBalances = ref([]);
  
  const handleOnConnectWallet = async () => {
    const { signer, avocadoWalletAddr } = await connectWallet();
    console.log(avocadoWalletAddr, "avocadoWalletAddr");
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
            aocadoWallet.value = { address: avocadoWalletAddr };
            balances.value = [
                { network: 'Polygon', balances: balancesInfo[0] },
                { network: 'Arbitrum', balances: balancesInfo[1] },
                { network: 'Optimistic', balances: balancesInfo[2] },
            ];
        }

        const polygonAvocadoBalancesInfo = await getBalance('polygon', avocadoWalletAddr);
        const arbitrumAvocadoBalancesInfo = await getBalance('arbitrum', avocadoWalletAddr);
        const optimisticAvocadoBalancesInfo = await getBalance('optimistic', avocadoWalletAddr);
        const avocadoBalancesInfo = await Promise.all([
            polygonAvocadoBalancesInfo,
            arbitrumAvocadoBalancesInfo,
            optimisticAvocadoBalancesInfo,
        ]);
        if (avocadoBalancesInfo.every((info) => info !== null)) {
            avocadoBalances.value = [
                { network: 'Polygon', balances: avocadoBalancesInfo[0] },
                { network: 'Arbitrum', balances: avocadoBalancesInfo[1] },
                { network: 'Optimistic', balances: avocadoBalancesInfo[2] },
            ];
        }
    }
  };

  const handleOnTransfer = async () => {
    const { signer, avocadoWalletAddr } = await connectWallet();
    const result = await transferBalances(signer, avocadoWalletAddr);
    if(result) {
        await handleOnConnectWallet();
    }
  }
</script>