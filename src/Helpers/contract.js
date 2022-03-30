import { Contract } from '@ethersproject/contracts';
import { ethers } from "ethers";
export const contractAbi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

export const contractAddress = '0x6777eccdd48f9bfb4838a3941f3f3167cabfaa0c';

export const getContract = (library, account) => {
	const signer = library.getSigner(account).connectUnchecked();	
	var contract = new Contract(contractAddress, contractAbi, signer);
	return contract;
};

export const getContract2 = (library, account) => {
	const provider = new ethers.providers.Web3Provider(window.ethereum)
	// The Metamask plugin also allows signing transactions to
	// send ether and pay to change state within the blockchain.
	// For this, you need the account signer...
	const signer = provider.getSigner()
	//const signer = account;	
	var contract = new Contract(contractAddress, contractAbi, signer);

	//------Test signMessage
	// const hashMessage =await signer.signMessage("Test hello world").catch((e)=> console.log("WTF ERR::",e) );
	// console.log("The hash Msg = ::", hashMessage);

	return contract;
};

export const signMessage_PC = async () => {
	return new Promise(async (resolve,reject)=>{
		try {
			const provider = new ethers.providers.Web3Provider(window.ethereum)
			// const signer = provider.getSigner()

			// const hexMessage = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("BeatDayWallet0303"))

			// //------Test signMessage
			// const signature = await signer.signMessage(hexMessage);

			const data = ethers.utils.toUtf8Bytes('BeatDayWallet0303');
			const signer = provider.getSigner();
			const addr = await signer.getAddress();
			const signature = await provider.send('personal_sign', [ethers.utils.hexlify(data), addr.toLowerCase()]);

			console.log("The signature = ::", signature);			
			return resolve(signature);
		} catch (error) {
			return reject(error);
		}
	})
};

export const signMessage_Mobile = async (wallectConnectProvider) => {
	return new Promise(async (resolve,reject)=>{
		try {
			const provider = new ethers.providers.Web3Provider(wallectConnectProvider)
			// const signer = provider.getSigner()
			// const hexMessage = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("BeatDayWallet0303"))
			// //------Test signMessage
			// const signature = await signer.signMessage(hexMessage);

			const data = ethers.utils.toUtf8Bytes('BeatDayWallet0303');
			const signer = provider.getSigner();
			const addr = await signer.getAddress();
			const signature = await provider.send('personal_sign', [ethers.utils.hexlify(data), addr.toLowerCase()]);

			console.log("The signature = ::", signature);
			return resolve(signature);
		} catch (error) {
			return reject(error);
		}
	})
};