import { ipcMain } from "electron";
import { createAndStoreWallet, loadWallet } from "./controller/wallet/wallet.js";

ipcMain.handle("wallet:create", async () => {
  const pubKey = await createAndStoreWallet();
  return pubKey;
});

ipcMain.handle("wallet:load", async () => {
  const keypair = await loadWallet();
  return keypair?.publicKey.toBase58();
});
