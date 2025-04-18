export interface ElectronAPI {
    createWallet: () => Promise<string>;
    getPubKey: () => Promise<string | null>;
    restoreWallet: (seedPhrase: string) => Promise<string>;
    getBalance: () => Promise<number>;
    claimReward: () => Promise<void>; // Todo: impliment in electron 
    sendSol: (receiver: string, amount: number) => Promise<string | null>;
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }
   