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
  },

  restoreWallet: (seedPhrase: string) => {
    ipcRenderer.send('restore-wallet', seedPhrase);
    return new Promise<string>((resolve) => {
      ipcRenderer.once('wallet-restored', (_event, pubKey) => resolve(pubKey));
    });
  },

  getBalance: () => {
    ipcRenderer.send('getBalance');
    return new Promise<number>((resolve) => {
      ipcRenderer.once('gotBalance', (_event, balance) => resolve(balance));
    });
  },

  sendSol: (receiver: string, amount: number) => {
    ipcRenderer.send('sendSol', receiver, amount);
    return new Promise<string>((resolve) => {
      ipcRenderer.once('sendSol', (_event, res) => resolve(res));
    })
    
  }

});