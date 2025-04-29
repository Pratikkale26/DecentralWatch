import { randomUUID } from 'crypto';
import type { OutgoingMessage, SignupOutgoingMessage, ValidateOutgoingMessage } from "common/types";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";
import { loadWallet } from "./wallet/wallet.js";


const CALLBACKS: {[callbackId: string]: (data: SignupOutgoingMessage) => void} = {}

let validatorId: string | null = null;

const getIPAndLocation = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
  
      const locationStr = `${data.city}, ${data.region}, ${data.country_name}`;
      return {
        ip: data.ip,
        location: locationStr,
      };
    } catch (err) {
      console.error('Failed to fetch IP and location:', err);
      return {
        ip: '0.0.0.0',
        location: 'Unknown',
      };
    }
  };
   

export async function startValidator() {
    const keypair = await loadWallet();
    if (!keypair) {
        throw new Error('Failed to load wallet');
    }

    const ws = new WebSocket("ws://localhost:8081");

    ws.onmessage = async (event) => {
        const data: OutgoingMessage = JSON.parse(event.data);
        if (data.type === 'signup') {
            CALLBACKS[data.data.callbackId]?.(data.data)
            delete CALLBACKS[data.data.callbackId];
        } else if (data.type === 'validate') {
            await validateHandler(ws, data.data, keypair);
        }
    }

    ws.onopen = async () => {
        const { ip, location } = await getIPAndLocation();
        const callbackId = randomUUID();
        CALLBACKS[callbackId] = (data: SignupOutgoingMessage) => {
            validatorId = data.validatorId;
        }
        const signedMessage = await signMessage(`Signed message for ${callbackId}, ${keypair.publicKey}`, keypair);

        ws.send(JSON.stringify({
            type: 'signup',
            data: {
                callbackId,
                ip: ip as string,
                location: location,
                publicKey: keypair.publicKey,
                signedMessage,
            },
        }));
    }
}

async function validateHandler(ws: WebSocket, { url, callbackId, websiteId }: ValidateOutgoingMessage, keypair: Keypair) {
    console.log(`Validating ${url}`);
    const startTime = Date.now();
    const signature = await signMessage(`Replying to ${callbackId}`, keypair);

    try {
        const response = await fetch(url);
        const endTime = Date.now();
        const latency = endTime - startTime;
        const status = response.status;

        console.log(url);
        console.log(status);
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
    } catch (error) {
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
        console.error(error);
    }
}

async function signMessage(message: string, keypair: Keypair) {
    const messageBytes = nacl_util.decodeUTF8(message);
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);

    return JSON.stringify(Array.from(signature));
}

startValidator();

setInterval(async () => {

}, 10000);