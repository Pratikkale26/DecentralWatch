import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { saveWalletToKeytar, getWalletFromKeytar } from "./secureWallet.js";
import nacl from "tweetnacl";

// Generate wallet and store
export const createAndStoreWallet = async () => {
  const keypair = Keypair.generate();
  const privateKey = bs58.encode(keypair.secretKey); // encode as string

  await saveWalletToKeytar(privateKey);
  return keypair.publicKey.toBase58();
};

// Load wallet
export const loadWallet = async () => {
  const stored = await getWalletFromKeytar();
  if (!stored) return null;

  const keypair = Keypair.fromSecretKey(bs58.decode(stored));
  return keypair;
};

// Sign message
export const signMessage = async (message: string): Promise<string | null> => {
  const keypair = await loadWallet();
  if (!keypair) return null;

  const messageBytes = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
  return bs58.encode(signature);
};