import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
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

// restore wallet
export const restoreWallet = async (seedPhrase: string) => {
  const keypair = Keypair.fromSeed(bs58.decode(seedPhrase));
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

// get private key
export const getPrivateKey = async () => {
  const keypair = await loadWallet();
  if (!keypair) return null;
  const secretKeyArray = Array.from(keypair.secretKey);  // Full 64 bytes
  return JSON.stringify(secretKeyArray);
};

// get PubKey
export const getPubKey = async () => {
  const keypair = await loadWallet();
  if (!keypair) return null;
  return keypair.publicKey.toBase58();
};

// get balance
export const getBalance = async () => {
  const keypair = await loadWallet();
  if (!keypair) return null;

  const connection = new Connection(clusterApiUrl('devnet'), "confirmed");

  try {
    const balance = await connection.getBalance(keypair.publicKey);
    return balance / LAMPORTS_PER_SOL; // convert lamports to SOL
  } catch (error) {
    console.error("Error getting balance:", error);
    return null;
  }
};

// send sol
export const sendSol = async (receiver: string, amount: number) => {
  const keypair = await loadWallet();
  if (!keypair) return null;

  const connection = new Connection(clusterApiUrl('devnet'), "confirmed");

  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(receiver),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );
    const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
    return signature;
  } catch (error) {
    console.error("Error sending SOL:", error);
    return null;
  }
};

