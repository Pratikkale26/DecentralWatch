export interface ElectronAPI {
    createWallet: () => Promise<string>;
    getPubKey: () => Promise<string | null>;
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }
   