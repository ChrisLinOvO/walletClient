import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import VanillaConnectionComponent from './VanillaConnectionComponent';
import Web3ReactConnectionComponent from './Web3ReactConnectionComponent';
import HomePage from './HomePage';

import {
	BrowserRouter,
	Routes,
	Route
  } from "react-router-dom";

//const G_NETWORK = 'http://localhost:7545' // use localhost Ganache
const G_NETWORK = 'rinkeby' // use rinkeby testnet, 'any', 'http://localhost:7545'
//const G_NETWORK = 'any';

window.onload = function() {
	localStorage.clear();
};

function App() {
	const getLibrary = (provider) => {
		const library = new Web3Provider(provider, G_NETWORK);
		library.pollingInterval = 15000;
		return library;
	};

	return (
		// <Web3ReactProvider getLibrary={getLibrary}>
		// 	<div className="flex space-x-3">
		// 		{/* <Web3ReactConnectionComponent />				
		// 		<VanillaConnectionComponent /> */}
		// 		<HomePage />
		// 	</div>
		// </Web3ReactProvider>

		<div className="App">
      
		<BrowserRouter>
			<Routes>          
			
			<Route path="/" 
				element={
					<>
					<Web3ReactProvider getLibrary={getLibrary}>
						<div className="flex space-x-3" >
							{/* <Web3ReactConnectionComponent />				
							<VanillaConnectionComponent /> */}
							<HomePage />
						</div>
					</Web3ReactProvider>
					</>
				} 
			/>

			</Routes>
		</BrowserRouter>

		</div>

	);
}

export default App;
