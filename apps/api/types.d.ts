
declare namespace Express {
    interface Request {
        userId?: string;
    }
}

declare module 'node-cron';
declare module 'nodemailer';