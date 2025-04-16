import type { NextFunction, Request, Response } from "express";
import { prismaClient } from "db/client";
import createError from "http-errors";

// POST /website
export const createWebsite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { url } = req.body;

    if (!url) throw createError(400, "Missing URL");

    const website = await prismaClient.website.create({
      data: { userId, url }
    });

    res.status(201).json({ id: website.id });
  } catch (err) {
    next(err);
  }
};

// GET /websites
export const getWebsites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;

    const websites = await prismaClient.website.findMany({
      where: { userId, disabled: false },
      include: { websiteTicks: true }
    });

    res.json({ websites });
  } catch (err) {
    next(err);
  }
};

// GET /website/status
export const getWebsiteStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const websiteId = req.query.websiteId as string;

    if (!websiteId) throw createError(400, "Missing websiteId");

    const website = await prismaClient.website.findFirst({
      where: { id: websiteId, userId, disabled: false },
      include: { websiteTicks: true }
    });

    if (!website) throw createError(404, "Website not found");

    res.json(website);
  } catch (err) {
    next(err);
  }
};

// DELETE /website/:websiteId
export const disableWebsite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const websiteId = req.params.websiteId;

    const website = await prismaClient.website.findUnique({
      where: { id: websiteId }
    });

    if (!website || website.userId !== userId) {
      throw createError(403, "Not authorized or website doesn't exist");
    }

    await prismaClient.website.update({
      where: { id: websiteId },
      data: { disabled: true }
    });

    res.json({ message: "Website disabled successfully" });
  } catch (err) {
    next(err);
  }
};
