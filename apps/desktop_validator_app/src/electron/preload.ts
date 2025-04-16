import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  createWallet: () => ipcRenderer.invoke('wallet:create'),
  loadWallet: () => ipcRenderer.invoke('wallet:load'),
});
