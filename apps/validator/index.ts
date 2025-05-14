import { randomUUID } from 'crypto';
import type { OutgoingMessage, SignupOutgoingMessage, ValidateOutgoingMessage } from "common/types";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";
import 'dotenv/config';

// Logger helper function to format logs with timestamps
function log(message: string, data: Record<string, any> = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [VALIDATOR] ${message}`, data);
}

const CALLBACKS: {[callbackId: string]: (data: SignupOutgoingMessage) => void} = {}

let validatorId: string | null = null;

async function main() {
    try {
        const keypair = Keypair.fromSecretKey(
            Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY!))
        );
        log("Using public key", { publicKey: keypair.publicKey.toString() });
        
        const hubUrl = process.env.HUB_URL;
        if (!hubUrl) {
            throw new Error("HUB_URL is not set");
        }
        const ws = new WebSocket(hubUrl);

        ws.onmessage = async (event) => {
            try {
                const data: OutgoingMessage = JSON.parse(event.data);
                log("Received message from hub", { messageType: data.type });
                
                if (data.type === 'signup') {
                    CALLBACKS[data.data.callbackId]?.(data.data);
                    delete CALLBACKS[data.data.callbackId];
                } else if (data.type === 'validate') {
                    log("Received validation request", { url: data.data.url, callbackId: data.data.callbackId });
                    await validateHandler(ws, data.data, keypair);
                }
            } catch (error) {
                log("Error processing message", { error: error instanceof Error ? error.message : String(error) });
            }
        };

        ws.onopen = async () => {
            log("Connection established with hub", { hubUrl });
        
            const callbackId = randomUUID();
        
            CALLBACKS[callbackId] = (data: SignupOutgoingMessage) => {
                validatorId = data.validatorId;
                log("Validator registered with hub", { validatorId: data.validatorId });
            };
        
            const { ip, location } = await getIPAndLocation();
            const signedMessage = await signMessage(`Signed message for ${callbackId}, ${keypair.publicKey}`, keypair);
            log("Sending signup request", { callbackId, publicKey: keypair.publicKey.toString(), ip, location });
        
            ws.send(JSON.stringify({
                type: 'signup',
                data: {
                    callbackId,
                    ip,
                    location,
                    publicKey: keypair.publicKey,
                    signedMessage,
                },
            }));
        };
        

        ws.onerror = (error) => {
            log("WebSocket error", { error: String(error) });
        };

        ws.onclose = (event) => {
            log("Connection to hub closed", { 
                code: event.code, 
                reason: event.reason, 
                wasClean: event.wasClean 
            });
            // Attempt to reconnect after a delay
            setTimeout(() => {
                log("Attempting to reconnect to hub");
                main();
            }, 5000);
        };
    } catch (error) {
        log("Fatal error in validator main function", { error: error instanceof Error ? error.message : String(error) });
    }
}

async function validateHandler(ws: WebSocket, { url, callbackId, websiteId }: ValidateOutgoingMessage, keypair: Keypair) {
    log("Starting website validation", { url, callbackId, websiteId });
    const startTime = Date.now();
    const signature = await signMessage(`Replying to ${callbackId}`, keypair);

    try {
        const response = await fetch(url);
        const endTime = Date.now();
        const latency = endTime - startTime;
        const status = response.status;
        const statusText = status === 200 ? 'UP' : 'DOWN';

        log("Website validation completed", { 
            url, 
            status, 
            statusText,
            latency: `${latency}ms`
        });
        
        ws.send(JSON.stringify({
            type: 'validate',
            data: {
                callbackId,
                status: statusText,
                latency,
                websiteId,
                validatorId,
                signedMessage: signature,
            },
        }));
        
    } catch (error) {
        log("Error validating website", { 
            url, 
            error: error instanceof Error ? error.message : String(error) 
        });
        
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
        
        log("Sent DOWN status to hub due to error", { callbackId, url });
    }
}

async function signMessage(message: string, keypair: Keypair) {
    log("Signing message", { messagePreview: message.substring(0, 30) + (message.length > 30 ? '...' : '') });
    const messageBytes = nacl_util.decodeUTF8(message);
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
    log("Message signed successfully");
    
    return JSON.stringify(Array.from(signature));
}

async function getIPAndLocation() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const locationStr = `${data.city}, ${data.region}, ${data.country_name}`;
        return {
            ip: data.ip || '0.0.0.0',
            location: locationStr || 'Unknown',
        };
    } catch (err) {
        log("Failed to fetch IP and location", { error: err instanceof Error ? err.message : String(err) });
        return {
            ip: '0.0.0.0',
            location: 'Unknown',
        };
    }
}


// Start the validator
log("Starting validator process");
main().catch(error => {
    log("Unhandled error in main function", { error: error instanceof Error ? error.message : String(error) });
});

// Health check interval
setInterval(async () => {
    if (validatorId) {
        log("Validator is running", { validatorId, uptime: process.uptime().toFixed(2) + 's' });
    }
}, 60000);