import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  createWallet: () => {
    ipcRenderer.send('create-wallet');
    return new Promise<string>((resolve) => {
      ipcRenderer.once('wallet-created', (_event, pubKey) => resolve(pubKey));
    });
  },

  getPubKey: () => {
    ipcRenderer.send("getPubKey")
    return new Promise<string>((resolve) => {
      ipcRenderer.once('getPubKey', (_event, pubKey) => resolve(pubKey));
    });
}


});