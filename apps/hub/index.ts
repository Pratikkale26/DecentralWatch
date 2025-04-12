import { randomUUIDv7, type ServerWebSocket } from "bun";
import type { IncomingMessage, SignupIncomingMessage } from "common/types";
import { prismaClient } from "db/client";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";

const availableValidators: { validatorId: string, socket: ServerWebSocket<unknown>, publicKey: string }[] = [];

const CALLBACKS: { [callbackId: string]: (data: IncomingMessage) => void } = {}
const COST_PER_VALIDATION = 100; // in lamports

Bun.serve({
    fetch(req, server) {
        try {
            if (server.upgrade(req)) {
                return;
            }
            return new Response("Upgrade failed", { status: 500 });
        } catch (error) {
            console.error("Error upgrading connection:", error);
            return new Response("Server error", { status: 500 });
        }
    },
    port: 8081,
    websocket: {
        async message(ws: ServerWebSocket<unknown>, message: string) {
            try {
                const data: IncomingMessage = JSON.parse(message);

                if (data.type === 'signup') {
                    try {
                        const verified = await verifyMessage(
                            `Signed message for ${data.data.callbackId}, ${data.data.publicKey}`,
                            data.data.publicKey,
                            data.data.signedMessage
                        );
                        if (verified) {
                            await signupHandler(ws, data.data);
                        }
                    } catch (error) {
                        console.error("Error in signup process:", error);
                    }
                } else if (data.type === 'validate') {
                    try {
                        CALLBACKS[data.data.callbackId](data);
                        delete CALLBACKS[data.data.callbackId];
                    } catch (error) {
                        console.error("Error processing validation:", error);
                    }
                }
            } catch (error) {
                console.error("Error parsing message:", error);
            }
        },
        async close(ws: ServerWebSocket<unknown>) {
            try {
                availableValidators.splice(availableValidators.findIndex(v => v.socket === ws), 1);
            } catch (error) {
                console.error("Error removing validator on disconnect:", error);
            }
        }
    },
});

async function signupHandler(ws: ServerWebSocket<unknown>, { ip, publicKey, signedMessage, callbackId }: SignupIncomingMessage) {
    try {
        const validatorDb = await prismaClient.validator.findFirst({
            where: {
                publicKey,
            },
        });

        if (validatorDb) {
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
    } catch (error) {
        console.error("Error in signup handler:", error);
    }
}

async function verifyMessage(message: string, publicKey: string, signature: string) {
    try {
        const messageBytes = nacl_util.decodeUTF8(message);
        const result = nacl.sign.detached.verify(
            messageBytes,
            new Uint8Array(JSON.parse(signature)),
            new PublicKey(publicKey).toBytes(),
        );

        return result;
    } catch (error) {
        console.error("Error verifying message:", error);
        return false;
    }
}

setInterval(async () => {
    try {
        const websitesToMonitor = await prismaClient.website.findMany({
            where: {
                disabled: false,
            },
        });

        for (const website of websitesToMonitor) {
            availableValidators.forEach(validator => {
                try {
                    const callbackId = randomUUIDv7();
                    console.log(`Sending validate to ${validator.validatorId} ${website.url}`);
                    validator.socket.send(JSON.stringify({
                        type: 'validate',
                        data: {
                            url: website.url,
                            callbackId
                        },
                    }));

                    CALLBACKS[callbackId] = async (data: IncomingMessage) => {
                        if (data.type === 'validate') {
                            try {
                                const { validatorId, status, latency, signedMessage } = data.data;
                                const verified = await verifyMessage(
                                    `Replying to ${callbackId}`,
                                    validator.publicKey,
                                    signedMessage
                                );
                                if (!verified) {
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
                                });
                            } catch (error) {
                                console.error("Error processing validation result:", error);
                            }
                        }
                    };
                } catch (error) {
                    console.error(`Error sending validation request:`, error);
                }
            });
        }
    } catch (error) {
        console.error("Error in monitoring interval:", error);
    }
}, 60 * 1000);