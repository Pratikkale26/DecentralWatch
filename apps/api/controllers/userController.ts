import type { Request, Response } from "express";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import { prismaClient } from "db/client";

export const linkWallet = async (req: Request, res: Response) => {
  try {
    const { publicKey, signature, name, email } = req.body;

    if (!publicKey || !signature) {
      res.status(400).json({ message: "Missing publicKey or signature" });
      return;
    }

    const message = new TextEncoder().encode("Sign in into DecentralWatch");

    const isVerified = nacl.sign.detached.verify(
      message,
      new Uint8Array(signature.data),
      new PublicKey(publicKey).toBytes()
    );

    if (!isVerified) {
      res.status(401).json({ message: "Signature verification failed" });
      return;
    }

    const userId = req.userId; // Comes from your Clerk-auth middleware

    if (!userId) {
      res.status(403).json({ message: "Unauthorized. User not found in request." });
      return;
    }

    // link wallet address to the Clerk user
    await prismaClient.user.upsert({
      where: { id: userId },
      update: { address: publicKey, name, email },
      create: {
        id: userId,
        address: publicKey,
        name,
        email
      }
    });

    res.status(200).json({ message: "Wallet linked successfully!" });
    return;

  } catch (err) {
    console.error("Link wallet error:", err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
