import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY as string;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Authorization header missing or malformed");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_PUBLIC_KEY);

    if (!decoded || typeof decoded !== "object" || !("sub" in decoded)) {
      throw new Error("Invalid JWT payload");
    }

    req.userId = decoded.sub as string;
    next();
  } catch (err) {
    next({
      status: 401,
      message: "Unauthorized",
      details: err instanceof Error ? err.message : err
    });
  }
}
