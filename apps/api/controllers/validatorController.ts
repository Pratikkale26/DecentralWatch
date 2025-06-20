import type { Request, Response } from "express";
import { prismaClient } from "db/client";

// Get all validators
export const getAllValidators = async (req: Request, res: Response) => {
  try {
    const validators = await prismaClient.validator.findMany();
    res.json({ validators });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch validators" });
  }
};

// Check if a public key is a validator
export const isValidator = async (req: Request, res: Response) => {
  const { publicKey } = req.query;
  if (!publicKey || typeof publicKey !== "string") {
    res.status(400).json({ error: "Missing or invalid publicKey" });
    return
  }
  const validator = await prismaClient.validator.findFirst({ where: { publicKey } });
  res.json({ isValidator: !!validator });
};
