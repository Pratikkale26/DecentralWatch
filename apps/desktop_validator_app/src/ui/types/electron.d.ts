export interface ElectronAPI {
    createWallet: () => Promise<string>;
    loadWallet: () => Promise<string | null>;
    getPubKey: () => Promise<string | null>;
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }
   