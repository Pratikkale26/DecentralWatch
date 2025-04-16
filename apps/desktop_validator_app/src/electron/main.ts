import { app, BrowserWindow } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { getPreloadPath } from './pathResolver.js';
import { createAndStoreWallet } from './controller/wallet/wallet.js';
import { ipcMain } from 'electron';
import { getWalletFromKeytar } from './controller/wallet/secureWallet.js';

type test = string;

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
    const pubKey = await getWalletFromKeytar();
    event.reply('getPubKey', pubKey);
  });

});