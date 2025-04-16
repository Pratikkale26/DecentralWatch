import keytar from 'keytar';

const SERVICE = 'DecentralWatchWallet';
const ACCOUNT = 'user-wallet';

// Save private key or seed phrase
export const saveWalletToKeytar = async (secret: string) => {
  await keytar.setPassword(SERVICE, ACCOUNT, secret);
};

// Get wallet
export const getWalletFromKeytar = async (): Promise<string | null> => {
  return await keytar.getPassword(SERVICE, ACCOUNT);
};

// delete
export const deleteWalletFromKeytar = async () => {
  await keytar.deletePassword(SERVICE, ACCOUNT);
};
