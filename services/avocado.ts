
import { ethers } from 'ethers'

const forwarderABI = [
{
        "inputs": [
            {
                "internalType": "address",
                "name": "owner_",
                "type": "address"
            },
            {
                "internalType": "uint32",
                "name": "index_",
                "type": "uint32"
            }
        ],
        "name": "computeAvocado",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

export async function avocado(address: string) {
    const provider = new ethers.JsonRpcProvider("https://polygon.llamarpc.com")
    const avoProvider = new ethers.JsonRpcProvider("https://rpc.avocado.instadapp.io")
    
    const forwarderContractAddress = '0x46978CD477A496028A18c02F07ab7F35EDBa5A54'
    const eoaAddress = address;
    
    const contract = new ethers.Contract(forwarderContractAddress, forwarderABI, provider)
    
    const walletAddr = await contract.computeAvocado(eoaAddress, 0)
    
    console.log(await avoProvider.send('api_getSafes', [{address: eoaAddress}]), "All deployed >>>>") // All deployed safes
    return walletAddr;
}




