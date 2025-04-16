import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  createWallet: () => {
    ipcRenderer.send('create-wallet');
    return new Promise<string>((resolve) => {
      ipcRenderer.once('wallet-created', (_event, pubKey) => resolve(pubKey));
    });
  },
  getPubKey: () => console.log("public Key")
});