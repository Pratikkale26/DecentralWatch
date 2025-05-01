import type { Request, Response } from "express";
import { prismaClient } from "db/client";
import { connection, PARENT_WALLET_ADDRESS } from "../utils/solana";

// create website
export const createWebsite = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { url, signature: txSignature } = req.body;

  const user = await prismaClient.user.findFirst({
    where: {
        id: userId
    }
})

  const transaction = await connection.getTransaction(txSignature, {
    maxSupportedTransactionVersion: 1,
    commitment: "confirmed"
  });

  // check if the transaction is valid
  if ((transaction?.meta?.postBalances[1] ?? 0) -
      (transaction?.meta?.preBalances[1] ?? 0) !== 100000000 ) {
    res.status(411).json({ message: "Incorrect transaction amount" });
    return;
  }

  // check if the transaction is sent to the correct address
  if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== PARENT_WALLET_ADDRESS ) {
    res.status(411).json({ message: "Sent to wrong address" });
    return;
  }

  // check if the transaction is sent from the correct address
  if (transaction?.transaction.message.getAccountKeys().get(0)?.toString() !== user?.address ) {
    res.status(411).json({ message: "Sent from wrong address"});
    return;
  }

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  const data = await prismaClient.website.create({
    data: {
      userId,
      url,
      expiry: expiryDate,
      signature: txSignature
    }
  });

  res.json({ id: data.id });
};

// get website status
export const getWebsiteStatus = async (req: Request, res: Response) => {
  const websiteId = req.query.websiteId as string;
  const userId = req.userId!;

  const data = await prismaClient.website.findFirst({
    where: {
      id: websiteId,
      userId,
      disabled: false,
      expiry: { gt: new Date() }
    },
    include: { websiteTicks: true }
  });

  if (!data) {
    res.status(404).json({ error: "Website not found or expired." });
    return;
  }

  res.json(data);
};

// get all websites
export const getAllWebsites = async (req: Request, res: Response) => {
  const userId = req.userId;

  const websites = await prismaClient.website.findMany({
    where: {
      userId,
      disabled: false,
      expiry: { gt: new Date() }
    },
    include: {
        websiteTicks: true
    }
  });

  res.json({ websites });
};

// disable website
export const disableWebsite = async (req: Request, res: Response) => {
  const userId = req.userId;
  const websiteId = req.params.websiteId;

  if (!websiteId) {
    res.status(400).json({ error: "Missing websiteId in URL" });
    return;
  }

  try {
    await prismaClient.website.update({
      where: {
        id: websiteId,
        userId,
      },
      data: {
        disabled: true,
      },
    });

    res.json({ message: "Website disabled successfully" });
  } catch (error) {
    console.error("Failed to disable website:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// auto disable website after 30 days
export const autoDisableWebsite = async (req: Request, res: Response) => {
  const now = new Date();
  const websites = await prismaClient.website.findMany({
    where: { disabled: false, expiry: { lte: now } }
  });

  for (const website of websites) {
    await prismaClient.website.update({
      where: { id: website.id },
      data: { disabled: true }    
    });
  }

  if (websites.length > 0) {
    const users = await prismaClient.user.findMany({
      where: {
        id: {
          in: websites.map((w) => w.userId)
        }
      }
    });
  
    for (const user of users) {
      await prismaClient.notification.create({
        data: {
          userId: user.id,
          message: "Your website has been disabled. Please add a new one."
        }    
      });
    }
}
  }