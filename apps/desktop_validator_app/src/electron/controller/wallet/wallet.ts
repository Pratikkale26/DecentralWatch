import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { saveWalletToKeytar, getWalletFromKeytar } from "./secureWallet.js";
import { BrowserWindow } from "electron";

// Generate wallet and store
export const createAndStoreWallet = async (mainWindow: BrowserWindow) => {
  const keypair = Keypair.generate();
  const privateKey = bs58.encode(keypair.secretKey); // encode as string

  await saveWalletToKeytar(privateKey);
  mainWindow.webContents.send('wallet-created', keypair.publicKey.toBase58());
  return keypair.publicKey.toBase58();
};

// Load wallet
export const loadWallet = async () => {
  const stored = await getWalletFromKeytar();
  if (!stored) return null;

  const keypair = Keypair.fromSecretKey(bs58.decode(stored));
  return keypair;
};

// get PubKey
export const getPubKey = async () => {
  const keypair = await loadWallet();
  if (!keypair) return null;
  return keypair.publicKey.toBase58();
};
