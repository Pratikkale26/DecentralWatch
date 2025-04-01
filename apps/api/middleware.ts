import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PUBLIC_KEY } from "./config";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send("Unauthorized");
        return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_PUBLIC_KEY);
    // console.log(decoded);
    if (!decoded || !decoded.sub) {
        res.status(401).send("Unauthorized");
        return;
    }
    
    req.userId = decoded.sub as string;
    next();
}