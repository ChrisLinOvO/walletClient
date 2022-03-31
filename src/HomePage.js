import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect, resetWalletConnector, walletlink } from './Helpers/connectors';
import { getContract, getContract2, signMessage_PC, signMessage_Mobile } from './Helpers/contract';
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
//import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
// import { Web3Provider } from '@ethersproject/providers';

//const G_NETWORK = 'http://localhost:7545' // use localhost Ganache
const G_NETWORK = 'rinkeby' // use rinkeby testnet, 'any', 'http://localhost:7545'
//const G_NETWORK = 'any';

const HomePage = () => {
	// const navigate = useNavigate(); 

	//connector, library, chainId, account, activate, deactivate
	const web3reactContext = useWeb3React(); //For walletConnect
    const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [walletUser, setWalletUser] = useState(null);
	const [walletBalance, setWalletBalance] = useState(0);

	const [isSignMsg, setIsSignMsg] = useState(false);

	const urlParams = new URLSearchParams(window.location.search);
	const myParamMobile = urlParams.get('type');
	const [isMobile, setIsMobile] = useState(myParamMobile === 'mobile' ? true : false);

    useEffect(()=>{
		console.log(window.location);
        console.log("web3reactContext Changed:", web3reactContext);
        if(web3reactContext.account){//- 錢包登入成功
			setIsLoggedIn(true);
			setWalletUser(web3reactContext.account);
			triggerGetBalance(web3reactContext.account);

			//- (WalletConnect 版本) [登入完成 && 未簽署] > 直接跳簽署
			if(isMobile && !isSignMsg){
				console.log("Rrr Sign: Mobile---");
				doSignMessage_Mobile();
			}
		}
        else { //- 錢包登出
			setIsLoggedIn(false);
			setWalletUser(null);
			setWalletBalance(0);
		}

		//--------connect to C#
		// if (window.vuplex) {
		// 	// The window.vuplex object already exists, so go ahead and send the message.
		// 	sendMessageToCSharp();
		// } else {
		// 	// The window.vuplex object hasn't been initialized yet because the page is still
		// 	// loading, so add an event listener to send the message once it's initialized.
		// 	window.addEventListener('vuplexready', sendMessageToCSharp('greeting', 'Hello from JavaScript!') );
		// }
		if (window.vuplex) { //- Init add Vuplex Listener
			addMessageListener();
		} else {
			window.addEventListener('vuplexready', addMessageListener);
		}

    }, [web3reactContext.account]);

	useEffect(()=>{
		

		if(walletUser !== null){
			if(!isMobile && !isSignMsg){ //- [PC版]MetaMask登入 & 未簽署時
				doSignMessage_PC(); //- 自動跳簽署
			}
			//window.location.href = window.location.href + "&msg=test";
			//window.location.assign(window.location.href + "&msg=test")			
			sendMessageToCSharp('walletLogin', walletUser); //- 傳送wallet Address to C#
		}
		// else {
		// 	sendMessageToCSharp('walletLogout', 'action'); //- 傳送wallet Address to C#
		// }
	}, [walletUser]);

	function addMessageListener() { //- Listener for received C# message
		window.vuplex.addEventListener('message', function(event) {
			let json = event.data;
			// > JSON received: { "type": "greeting", "message": "Hello from C#!" }
			console.log('JSON received: ' + json);
		});
	}

	function sendMessageToCSharp(msgType, msgContent) { //- send msg obj to C# webview

		if (window.vuplex){ //- (vuplex WebView溝通訊息方式)
			window.vuplex.postMessage(`${msgType}:${msgContent}`); //- For send msg obj to C# webview (PC)
		}
		const firtQ = myParamMobile === 'web' ? '?type=web' : '?type=mobile';

		//- (uniWebView溝通訊息方式 - JS不用載套件,只是網頁端下方觸發時會Log Error不影響後續)
		window.location.href = `uniwebview://action${firtQ}&msg=${msgType}&content=${msgContent}`; //- For For send msg obj to C# uniWebView (Mobile, Mac)
	}

	//web3react 送出 提交合約/產生NFT
	const writeToContractUsingWeb3React_old = async () => { // 送出 提交合約/產生NFT
		try {
			if(!walletUser)throw new Error("There is no wallet Address!");
			const randomNumber = Math.floor(Math.random() * 100);
			const myContract = getContract(web3reactContext.library, web3reactContext.account);
			const overrides = {
				gasLimit: 230000
			};
			const response = await myContract.store(randomNumber, overrides); // 呼叫 智能合約 method
			console.log(response);
			alert('write ' + randomNumber);
		} catch (ex) {
			console.log(ex);
			alert(ex);
		}
	};

	//web3react 送出 提交合約/產生NFT [OK]
	const writeToContractUsingWeb3React = async () => { // 送出 提交合約/產生NFT
		try {
			if(!walletUser)throw new Error("There is no wallet Address!");
			const randomNumber = Math.floor(Math.random() * 100);
			const myContract = getContract2(web3reactContext.library, walletUser);
			const overrides = {
				gasLimit: 3000000,
			
				value: ethers.BigNumber.from("300000000000000000") // 交易金額:單位使用wei (轉換器:https://eth-converter.com/)
			};
			const response = await myContract.mintNicMeta("1",overrides); // 呼叫 智能合約 method overrides
			console.log(response);
			alert('交易成功!');
		} catch (ex) {
			console.log(ex);
			alert(ex);
		}
	};

	//web3react 抓取合約參數
	const getContractByWeb3React = async () => { // 抓取合約參數NFT
		try {
			if(!walletUser)throw new Error("There is no wallet Address!");
			const myContract = getContract2(web3reactContext.library, walletUser);
			const overrides = {
				gasLimit: 3000000,
			
				value: ethers.BigNumber.from("300000000000000000") // 交易金額:單位使用wei (轉換器:https://eth-converter.com/)
			};
			// const response = await myContract.userOwns(); // 呼叫 智能合約 method
			//const response = myContract.address; // ABI address [OK]
			const response = await myContract.totalSupply(); // 呼叫 智能合約 method
			// const response = await myContract.mintNicMeta("1",overrides); // 呼叫 智能合約 method
			// console.log(response);
			// console.log(ethers.utils.formatUnits(response)); // 1 = 0.000000000000000001
			// console.log(ethers.utils.hexValue(response)); // 1 = 0x1
			alert('擁有:'+ethers.utils.hexValue(response).split('x')[1]+'個');
		} catch (ex) {
			console.log(ex);
			alert(ex);
		}
	};

	const disconnectMetamaskSimple = () => { // 登出
		try {
			if(!web3reactContext.account){//Vanilla metaMask Logout (登出)
				setIsLoggedIn(false);
				setWalletUser(null);
				setWalletBalance(0);
			}
			else { //WallectConnect Logout
				web3reactContext.deactivate();
			}
			
			setIsSignMsg(false);
			sendMessageToCSharp('walletLogout', 'action'); //- 傳送wallet Address to C#

		} catch (ex) {
			console.log(ex);
		}
	};

	//web3react context
	// const checkInfoSimple = async () => {
	// 	try {
	// 		console.log('web3reactContext');
	// 		console.log(web3reactContext);
	// 	} catch (ex) {
	// 		console.log(ex);
	// 	}
	// };

	//web3react metamask [CLOSE]
	const connectMetamaskSimple_XX = async () => {
		try {
			const resAccount = await web3reactContext.activate(injected);
            console.log("After MetaMask Login::", resAccount);
		} catch (ex) {
			console.log(ex);
		}
	};
	//vanilla metamask
	const connectMetamaskSimple = async () => {
		try {
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			const account = accounts[0];
			setIsLoggedIn(true);
			setWalletUser(account);
			triggerGetBalance(account);
			// const library = new Web3Provider(window.ethereum, G_NETWORK);
			setIsMobile(false);

		} catch (ex) {
			console.log(ex);
		}
	};

    const triggerGetBalance = (targetUser = null) => { //取得 wallet balance [OK]
		try {
			console.log(targetUser, walletUser);
			if(targetUser === null)targetUser = walletUser;
			if(targetUser === null)return;

			const theAddress = G_NETWORK === "any" ? 'http://localhost:7545' : G_NETWORK; // 如果是any Address用7545 localhost Ganache, 其他用var
			const providerE = ethers.getDefaultProvider(theAddress);

			//const providerE = ethers.getDefaultProvider(G_NETWORK);
			// const providerE = ethers.getDefaultProvider('http://localhost:7545');
			providerE.getBalance(targetUser).then((balance) => {
				// convert a currency unit from wei to ether
				const balanceInEth = ethers.utils.formatEther(balance);
				setWalletBalance(balanceInEth);
				//console.log(`balance: ${balanceInEth} ETH`);
			})
		} catch (error) {
			console.log("Money ERR::", error);
		}
    };

	//web3react walletconnect login
	const connectWalletConnectSimple = async () => {
		try {
			resetWalletConnector(walletconnect);
			await web3reactContext.activate(walletconnect);
			setIsMobile(true);
		} catch (ex) {
			console.log(ex);
		}
	};

	const doSignMessage_PC = async (passUser = null) =>{ //- 簽署signMessage (MetaMask [PC])
		try {
			if(!walletUser)throw new Error("Error on no wallet address!");			
			const response = await signMessage_PC();
			//console.log(response);
			sendMessageToCSharp("walletSignMsg", response);
			//await axios.post('/receiveSignature',{
			// await axios.post('/receiveSignature',{
			// 	"signature": response
			// });
			setIsSignMsg(true);
		} catch (error) {
			console.log("Sign PC Err:",error);
		}
	}

	const doSignMessage_Mobile = async () =>{ //- 簽署signMessage (wallectConnect [Mobile])
		try {
			if(!walletconnect || !walletconnect.walletConnectProvider)return;
			const response = await signMessage_Mobile(walletconnect.walletConnectProvider);
			//console.log(response);
			sendMessageToCSharp("walletSignMsg", response);
			// await axios.post('/receiveSignature',{
			// await axios.post('/receiveSignature',{
			// 	"signature": response
			// });
			setIsSignMsg(true);
		} catch (error) {
			console.log("Sign PC Err:",error);
		}
	}

	//web3react coinbase
	// const connectCoinbaseSimple = async () => {
	// 	try {
	// 		await web3reactContext.activate(walletlink);
	// 	} catch (ex) {
	// 		console.log(ex);
	// 	}
	// };

	return (
		<div
			style={{ 
				'textAlign':'center',
				'position':'relative',
				'width':'100vw',
				'height':'100vh',
				'padding':'50px 20px',
				'background':'#FFE4E1',
			
			}}
		>
			<h1 style={{
				'fontSize':'28px',
				'fontWeight':'bold',
				"marginBottom":'15px'
			}}
			>
				錢包登入
			</h1>

			{/* <Button
				type="primary"
				danger
				style={{
					position:'absolute',
					right:'25px',
					top:'25px'
				}}
				size="large"
				onClick={()=>{ //-- Call Unity 關閉webView
					sendMessageToCSharp('closeWebView', 'active'); //- 傳送wallet Address to C#
				}}
				shape="circle" icon={<CloseOutlined />}
			/> */}

			<p style={{
				'fontSize':'15px',
				'fontWeight':'bold',
				"marginBottom":'15px'
			}} >
				{walletUser ? `${walletUser}` : "未登入"}
			</p>

			{
				walletUser?
				<p style={{
					"marginBottom":'15px'
				}} >
					$:{walletBalance}(ETH)
				</p>
				:
				""
			}
			
            {
                isLoggedIn ?
                <>
					{/* 
                    <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        onClick={writeToContractUsingWeb3React}
                    >
                        寫交易合約
                    </button>
					*/}

					{
						!isSignMsg ?
						<>
						<span
						style={{fontSize:'14px', color:'red', display:'block', margin:'0 auto'}}
						>
							(請使用登入的錢包進行簽屬)
						</span>
						{
							!isMobile ?
							//---------PC版
							<Button
								type='primary'
								size='large'
								style={{ display:'block' , margin:'0 auto 15px auto', 'minWidth':'150px'}}
								onClick={doSignMessage_PC}
							>
								簽署
							</Button>
							:
							//---------Mobile版
							<Button
								type='primary'
								size='large'
								style={{ display:'block' , margin:'0 auto 15px auto', 'minWidth':'150px'}}
								onClick={doSignMessage_Mobile}
							>
								簽署
							</Button>
						}
						</>
						:
						<span
						style={{fontSize:'20px', color:'red', display:'block', margin:'0 auto 15px auto'}}
						>
							簽署成功
						</span>
					}

					<Button
						type='primary'
						size='large'
						style={{ display:'block' , margin:'0 auto 15px auto', 'minWidth':'150px'}}
                        onClick={getContractByWeb3React}
                    >
                        {/* GET交易合約 Varable data */}
                        擁有合約NFT數
                    </Button>

                    {/* <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        onClick={checkInfoSimple}
                    >
                        列印WebReact Log
                    </button> */}
                    <Button
						type='primary'
						size='large'
						style={{ display:'block' , margin:'0 auto 15px auto', 'minWidth':'150px'}}
                        onClick={()=>{ triggerGetBalance(null) }}
                    >
                        刷新錢包
                    </Button>
                    {/* <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        onClick={disconnectMetamaskSimple}
                    >
                        Disconnect Web3React
                    </button> */}
					<Button
						type='primary'
						size='large'
						style={{ display:'block' , margin:'0 auto 15px auto', 'minWidth':'150px'}}
						danger
						onClick={disconnectMetamaskSimple}
					>
					登出
				</Button>
                </>
                :
                <>	
				{
					myParamMobile === "web" ?
					//---------PC版
					<Button
						style={{
							'display':'block',
							'margin':'0 auto 15px auto',
							'width':'280px'
						}}
						type='primary'
						size='large'
						onClick={connectMetamaskSimple}
					>
						使用Metamask登入
					</Button>
					:
					""
				}

				{/* //---------Mobile版 */}
				{/* <Button
					style={{
						'display':'block',
						'margin':'0 auto 15px auto',
						'width':'280px'
					}}
					type='primary'
					size='large'
					onClick={connectWalletConnectSimple}
				>
					使用Walletconnect登入(Mobile)
				</Button> */}

                    {/* <div className="flex space-x-3">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={connectCoinbaseSimple}
                        >
                            Connect coinbase Via Web3-React
                        </button>
                    </div> */}
                </>
            }
		</div>
	);
};
export default HomePage;
