import React from 'react';
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers } from 'ethers'
import './App.css';

let primeSdk;

function App() {

  const [etherspotWalletAddress, setEtherspotWalletAddress] = React.useState('');
  const [privateKey, setPrivateKey] = React.useState('');
  const [eventLog, setEventLog] = React.useState('');

  const generateWallet = async () => {
    const randomWallet = ethers.Wallet.createRandom();
    setPrivateKey(randomWallet.privateKey);
    primeSdk = new PrimeSdk({ privateKey: randomWallet.privateKey}, { chainId: 5, projectKey: '' })
    const address = await primeSdk.getCounterFactualAddress();
    setEtherspotWalletAddress(address);
    setEventLog(`Generated new address: ${address}`);
  }

  const sendFunds = async () => {
    const toAddress = document.getElementById('send-address').value;
    const stringValue = document.getElementById('send-value').value;
    await primeSdk.addUserOpsToBatch({to: toAddress, value: ethers.parseEther(stringValue)});
    const op = await primeSdk.estimate();
    const uoHash = await primeSdk.send(op);
    setEventLog(`UserOpHash: ${uoHash}`);
    setEventLog(`Waiting for transaction...`);
    let userOpsReceipt = null;
    const timeout = Date.now() + 300000;
    while((userOpsReceipt == null) && (Date.now() < timeout)) {
      await new Promise(r => setTimeout(r, 2000));
      userOpsReceipt = await primeSdk.getUserOpReceipt(uoHash);
    }
    console.log(userOpsReceipt);
    setEventLog(`Transaction Confirmed: https://goerli.etherscan.io/tx/${userOpsReceipt.receipt.transactionHash}`);
  }


  return (
    <div className="App">
      <h1  className="App-title">Etherspot Test</h1>
      <p>This is a test dApp for Etherspot on Goerli Testnet</p>
      <div>
        <button className="App-button" onClick={() => generateWallet()}>Generate Wallet</button>
      </div>
      <div>
        <a href={"https://goerli.etherscan.io/address/" + etherspotWalletAddress} target="_blank">
          <p>Etherspot Address:</p>
          <p className="small-text">{etherspotWalletAddress}</p>
        </a>
      </div>
      <div>
        <p>Fund the wallet above (Goerli Testnet Only) and then send some funds using the bundler</p>
        <p><input type="text" id="send-address" placeholder="0xRecipient" /></p>
        <p><input type="text" id="send-value" placeholder="0.001 ETH" /></p>
        
        <button className="App-button" onClick={() => sendFunds()}>Send Funds</button>
      </div>
      <div className="event-log">
        <h4>Event Log</h4>
        <p className="green">{eventLog}</p>
      </div>
    </div>
  );
}

export default App;
