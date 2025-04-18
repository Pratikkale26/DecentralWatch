export interface ElectronAPI {
    createWallet: () => Promise<string>;
    getPubKey: () => Promise<string | null>;
    restoreWallet: (seedPhrase: string) => Promise<string>;
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }
   