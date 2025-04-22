import express from "express";
import { authMiddleware } from "./middleware";
import { prismaClient } from "db/client";
import cors from "cors";
import nacl from "tweetnacl";
import { Connection, PublicKey } from "@solana/web3.js";


const app = express();
app.use(express.json());

app.use(cors());
const connection = new Connection("https://api.devnet.solana.com");

const PARENT_WALLET_ADDRESS = "7m6ah1RGoYzLD65FHGbyXJffP9hPEZzh6e6HmAzGpVt9";

// create website
app.post("/api/v1/website", authMiddleware, async (req, res) => {
    const userId = req.userId!;
    const {url, signature: txSignature} = req.body;

    const user = await prismaClient.user.findFirst({
        where: {
            id: userId
        }
    })

    const transaction = await connection.getTransaction(txSignature, {
        maxSupportedTransactionVersion: 1
    });

    console.log(transaction);    

    // // check if the transaction is valid
    if ((transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0) !== 100000000) {
        res.status(411).json({
            message: "Transaction signature/amount incorrect"
        })
        return
    }

    // // check if the transaction is sent to the correct address
    if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== PARENT_WALLET_ADDRESS) {
        res.status(411).json({
            message: "Transaction sent to wrong address"
        })
        return
    }

    // // check if the transaction is sent from the correct address
    if (transaction?.transaction.message.getAccountKeys().get(0)?.toString() !== user?.address) {
        res.status(411).json({
            message: "Transaction sent from wrong address"
        })
        return
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const data = await prismaClient.website.create({
        data: {
            userId,
            url,
            expiry: expiryDate
        }
    })

    res.json({
        id: data.id
    })
});

// get website status
app.get("/api/v1/website/status", authMiddleware, async (req, res) => {
    const websiteId = req.query.websiteId! as string;
    const userId = req.userId;

    const data = await prismaClient.website.findFirst({
        where:{
            id: websiteId,
            userId,   // it will make sure that the website belongs to the user
            disabled: false,
            expiry: {
                gt: new Date()
            }
        },
        include:{
            websiteTicks: true
        }
    })
    if (!data) {
        res.status(404).json({ error: "Website not found or expired." });
        return
      }      

    res.json(data)
});

// get all websites
app.get("/api/v1/websites", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const now = new Date();


    const websites = await prismaClient.website.findMany({
        where:{
            userId: userId,
            disabled: false,
            expiry: {
                gt: now
            }
        },
        include:{
            websiteTicks: true
        }
    })

    res.json({
        websites
    })
});

// disable website
app.delete("/api/v1/website/:websiteId", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const websiteId = req.params.websiteId;

  await prismaClient.website.update({
    where:{
        userId,
        id: websiteId
    },
    data: {
      disabled: true
    }
  })

  res.json({
    message: "Website disabled successfully"
  })
});

// auto disable website after 30 days
app.use(async (req, res, next) => {
    const now = new Date();
    const websites = await prismaClient.website.findMany({
        where: {
            disabled: false,
            expiry: {
                lte: now
            }
        }
    })

    for (const website of websites) {
        await prismaClient.website.update({
            where: {
                id: website.id
            },
            data: {
                disabled: true
            }
        })
    }
    next();
})


// link wallet
app.post("/api/v1/link-wallet", authMiddleware, async (req, res) => {
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
  
      // Link wallet address to the Clerk user
      await prismaClient.user.upsert({
        where: { id: userId },
        update: { address: publicKey, name: name, email: email },
        create: {
          id: userId,
          address: publicKey,
          name: name,
          email: email
        },
      });
  
      res.status(200).json({ message: "Wallet linked successfully!" });
      return
    } catch (err) {
      console.error("Link wallet error:", err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  });

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
