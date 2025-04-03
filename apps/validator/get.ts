import bs58 from "bs58";
import dotenv from "dotenv";
dotenv.config();

// Get the Base58-encoded private key from the environment
const base58Key = process.env.PRIVATE_KEY!;
if (!base58Key) {
    throw new Error("PRIVATE_KEY is not set in the environment");
}

// Decode the Base58 key to Uint8Array
const secretKey = bs58.decode(base58Key);

// Convert Uint8Array to JSON format
const jsonKey = JSON.stringify(Array.from(secretKey));

console.log("Decoded JSON Array:", jsonKey);
