import type { NextFunction, Request, Response } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send("Unauthorized");
        return;
    }
    
    req.userId = "1";
    next();
}