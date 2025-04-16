export interface ElectronAPI {
    createWallet: () => Promise<string>;
    loadWallet: () => Promise<string | null>;
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }
   