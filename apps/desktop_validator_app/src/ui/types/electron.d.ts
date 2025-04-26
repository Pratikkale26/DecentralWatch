export interface ElectronAPI {
    createWallet: () => Promise<string>;
    getPubKey: () => Promise<string | null>;
    restoreWallet: (seedPhrase: string) => Promise<string>;
    getBalance: () => Promise<number>;
    sendSol: (receiver: string, amount: number) => Promise<string | null>;
    getPrivateKey: () => Promise<string | null>;
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }
   