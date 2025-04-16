import { randomUUIDv7, type ServerWebSocket } from "bun";
import type { IncomingMessage, SignupIncomingMessage } from "common/types";
import { prismaClient } from "db/client";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";

// Logger helper function to format logs with timestamps
function log(message: string, data: Record<string, any> = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [HUB] ${message}`, data);
}

const availableValidators: { validatorId: string, socket: ServerWebSocket<unknown>, publicKey: string }[] = [];

const CALLBACKS : { [callbackId: string]: (data: IncomingMessage) => void } = {}
const COST_PER_VALIDATION = 100; // in lamports

Bun.serve({
    fetch(req, server) {
      if (server.upgrade(req)) {
        return;
      }
      return new Response("Upgrade failed", { status: 500 });
    },
    port: 8081,
    error(error) {
      log(`Server error: ${error.message}`, { stack: error.stack });
      return new Response(`Server error: ${error.message}`, { status: 500 });
    },
    websocket: {
        open(ws: ServerWebSocket<unknown>) {
            log("New connection established", { clientAddress: ws.remoteAddress });
        },
        async message(ws: ServerWebSocket<unknown>, message: string) {
            const data: IncomingMessage = JSON.parse(message);

            if (data.type === 'signup') {
                const verified = await verifyMessage(
                    `Signed message for ${data.data.callbackId}, ${data.data.publicKey}`,
                    data.data.publicKey,
                    data.data.signedMessage
                );
                if (verified) {
                    await signupHandler(ws, data.data);
                } else {
                }
            } else if (data.type === 'validate') {
                CALLBACKS[data.data.callbackId](data);
                delete CALLBACKS[data.data.callbackId];
            }
        },
        async close(ws: ServerWebSocket<unknown>) {
            const validator = availableValidators.find(v => v.socket === ws);
            if (validator) {
                log("Validator disconnected", { validatorId: validator.validatorId, publicKey: validator.publicKey });
                availableValidators.splice(availableValidators.findIndex(v => v.socket === ws), 1);
            } else {
                log("Unknown connection closed", { clientAddress: ws.remoteAddress });
            }
        }
    },
});

async function signupHandler(ws: ServerWebSocket<unknown>, { ip, publicKey, signedMessage, callbackId }: SignupIncomingMessage) {
    const validatorDb = await prismaClient.validator.findFirst({
        where: {
            publicKey,
        },
    });

    if (validatorDb) {
        log("Existing validator reconnected", { validatorId: validatorDb.id, publicKey, ip });
        ws.send(JSON.stringify({
            type: 'signup',
            data: {
                validatorId: validatorDb.id,
                callbackId,
            },
        }));

        availableValidators.push({
            validatorId: validatorDb.id,
            socket: ws,
            publicKey: validatorDb.publicKey,
        });
        return;
    }
    
    //TODO: Given the ip, return the location
    const validator = await prismaClient.validator.create({
        data: {
            ip,
            publicKey,
            location: 'unknown',
        },
    });

    log("New validator registered successfully", { validatorId: validator.id, publicKey, ip });
    ws.send(JSON.stringify({
        type: 'signup',
        data: {
            validatorId: validator.id,
            callbackId,
        },
    }));

    availableValidators.push({
        validatorId: validator.id,
        socket: ws,
        publicKey: validator.publicKey,
    });
}

async function verifyMessage(message: string, publicKey: string, signature: string) {
    const messageBytes = nacl_util.decodeUTF8(message);
    const result = nacl.sign.detached.verify(
        messageBytes,
        new Uint8Array(JSON.parse(signature)),
        new PublicKey(publicKey).toBytes(),
    );

    return result;
}

// Log server startup information
log("Hub server started", { port: 8081, availableValidators: 0, costPerValidation: COST_PER_VALIDATION });

setInterval(async () => {
    const websitesToMonitor = await prismaClient.website.findMany({
        where: {
            disabled: false,
        },
    });

    for (const website of websitesToMonitor) {
        availableValidators.forEach(validator => {
            const callbackId = randomUUIDv7();
            log("Sending validation request", { 
                validatorId: validator.validatorId, 
                websiteUrl: website.url, 
                websiteId: website.id,
                callbackId
            });
            
            validator.socket.send(JSON.stringify({
                type: 'validate',
                data: {
                    url: website.url,
                    callbackId
                },
            }));

            CALLBACKS[callbackId] = async (data: IncomingMessage) => {
                if (data.type === 'validate') {
                    const { validatorId, status, latency, signedMessage } = data.data;
                    log("Received validation response", { 
                        validatorId, 
                        websiteUrl: website.url, 
                        websiteId: website.id,
                        status, 
                        latency, 
                        callbackId 
                    });
                    
                    const verified = await verifyMessage(
                        `Replying to ${callbackId}`,
                        validator.publicKey,
                        signedMessage
                    );
                    
                    if (!verified) {
                        log("Validation response signature verification failed", { 
                            validatorId, 
                            callbackId,
                            websiteUrl: website.url
                        });
                        return;
                    }

                    await prismaClient.$transaction(async (tx) => {
                        await tx.websiteTick.create({
                            data: {
                                websiteId: website.id,
                                validatorId,
                                status,
                                latency,
                                createdAt: new Date(),
                            },
                        });

                        await tx.validator.update({
                            where: { id: validatorId },
                            data: {
                                pendingPayouts: { increment: COST_PER_VALIDATION },
                            },
                        });
                        
                        log("Validation recorded and payment incremented", { 
                            validatorId, 
                            websiteId: website.id, 
                            payment: COST_PER_VALIDATION 
                        });
                    });
                }
            };
        });
    }
}, 60 * 1000);