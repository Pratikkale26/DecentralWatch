import { randomUUIDv7 } from "bun";
import type { OutgoingMessage, SignupOutgoingMessage, ValidateOutgoingMessage } from "common/types";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";
import 'dotenv/config';

const CALLBACKS: { [callbackId: string]: (data: SignupOutgoingMessage) => void } = {}

let validatorId: string | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 3000; // 3 seconds

async function main() {
    try {
        const keypair = Keypair.fromSecretKey(
            Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY ?? '[]'))
        );

        if (!process.env.PRIVATE_KEY) {
            throw new Error("PRIVATE_KEY environment variable is not set");
        }

        connectWebSocket(keypair);
    } catch (error) {
        console.error("Failed to initialize client:", error);
        process.exit(1);
    }
}

function connectWebSocket(keypair: Keypair) {
    try {
        const ws = new WebSocket("ws://localhost:8081");

        ws.onmessage = async (event) => {
            try {
                const data: OutgoingMessage = JSON.parse(event.data);
                if (data.type === 'signup') {
                    try {
                        if (CALLBACKS[data.data.callbackId]) {
                            CALLBACKS[data.data.callbackId](data.data);
                            delete CALLBACKS[data.data.callbackId];
                        }
                    } catch (callbackError) {
                        console.error("Error executing signup callback:", callbackError);
                    }
                } else if (data.type === 'validate') {
                    await validateHandler(ws, data.data, keypair);
                }
            } catch (parseError) {
                console.error("Error parsing message:", parseError);
            }
        };

        ws.onopen = async () => {
            try {
                console.log("Connected to server");
                reconnectAttempts = 0;

                const callbackId = randomUUIDv7();
                CALLBACKS[callbackId] = (data: SignupOutgoingMessage) => {
                    validatorId = data.validatorId;
                    console.log(`Registered as validator: ${validatorId}`);
                };

                const signedMessage = await signMessage(`Signed message for ${callbackId}, ${keypair.publicKey}`, keypair);

                ws.send(JSON.stringify({
                    type: 'signup',
                    data: {
                        callbackId,
                        ip: '127.0.0.1',
                        publicKey: keypair.publicKey,
                        signedMessage,
                    },
                }));
            } catch (error) {
                console.error("Error during WebSocket open handler:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log("Connection closed");
            validatorId = null;

            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
                setTimeout(() => connectWebSocket(keypair), RECONNECT_DELAY);
            } else {
                console.error("Max reconnection attempts reached. Giving up.");
            }
        };
    } catch (error) {
        console.error("Error establishing WebSocket connection:", error);
    }
}

async function validateHandler(ws: WebSocket, { url, callbackId, websiteId }: ValidateOutgoingMessage, keypair: Keypair) {
    console.log(`Validating ${url}`);
    const startTime = Date.now();

    try {
        const signature = await signMessage(`Replying to ${callbackId}`, keypair);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(url, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const endTime = Date.now();
            const latency = endTime - startTime;
            const status = response.status;

            console.log(`${url} - Status: ${status}, Latency: ${latency}ms`);
            ws.send(JSON.stringify({
                type: 'validate',
                data: {
                    callbackId,
                    status: status === 200 ? 'UP' : 'DOWN',
                    latency,
                    websiteId,
                    validatorId,
                    signedMessage: signature,
                },
            }));
        } catch (fetchError) {
            console.error(`Error fetching ${url}:`, fetchError);
            ws.send(JSON.stringify({
                type: 'validate',
                data: {
                    callbackId,
                    status: 'DOWN',
                    latency: 1000,
                    websiteId,
                    validatorId,
                    signedMessage: signature,
                },
            }));
        }
    } catch (signError) {
        console.error("Error signing validation message:", signError);
    }
}

async function signMessage(message: string, keypair: Keypair) {
    try {
        const messageBytes = nacl_util.decodeUTF8(message);
        const signature = nacl.sign.detached(messageBytes, keypair.secretKey);

        return JSON.stringify(Array.from(signature));
    } catch (error) {
        console.error("Error signing message:", error);
        throw error;
    }
}

// Start the client
main();

// Keep the process alive
setInterval(() => {
    // Heartbeat to keep process running
}, 10000);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log("Shutting down client...");
    process.exit(0);
});