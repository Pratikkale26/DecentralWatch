import { app, BrowserWindow } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { getPreloadPath } from './pathResolver.js';
import { createAndStoreWallet, getBalance, getPrivateKey, getPubKey, loadWallet, restoreWallet, sendSol } from './controller/wallet/wallet.js';
import { ipcMain } from 'electron';
import { startValidator } from './controller/validator.js';

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    }
  });
  if(isDev()) {
    mainWindow.loadURL('http://localhost:7661');
  }else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'))
  }


  ipcMain.on('create-wallet', async (event) => {
    const pubKey = await createAndStoreWallet(mainWindow); // should return pubKey
    event.sender.send('wallet-created', pubKey);
  });

  ipcMain.on('getPubKey', async (event) => {
    const pubKey = await getPubKey();
    event.reply('getPubKey', pubKey);
  });

  // restore wallet
  ipcMain.on('restore-wallet', async (event, seedPhrase) => {
    const pubKey = await restoreWallet(seedPhrase);
    event.reply('wallet-restored', pubKey);
  });

  // get balance
  ipcMain.on('getBalance', async (event) => {
    const balance = await getBalance();
    event.reply('gotBalance', balance);
  })

  // send sol
  ipcMain.on('sendSol', async (event, receiver, amount) => {
    const res = await sendSol(receiver, amount);
    event.reply('sendSol', res);
  })

  // get private key
  ipcMain.on('getPrivateKey', async (event) => {
    const privateKey = await getPrivateKey();
    event.reply('gotPrivateKey', privateKey);
  })


  // get wallet from keytar
  const getwallet = async () => {
    const loadedWallet = await loadWallet()
    console.log(loadedWallet?.publicKey.toBase58())
  }
  getwallet()

  // start validator
  startValidator();


});