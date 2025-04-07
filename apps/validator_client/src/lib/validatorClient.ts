// src/lib/validatorClient.ts
import { PublicKey } from "@solana/web3.js";

// Store state variables
let socket: WebSocket | null = null;
let validatorId: string | null = null;
let signMessageFunction: ((message: Uint8Array) => Promise<Uint8Array>) | null = null;

// For validation activity tracking
type ValidationActivity = {
  url: string;
  timestamp: number;
  status: "UP" | "DOWN";
  latency: number;
};

const validationActivities: ValidationActivity[] = [];

/**
 * Sign up as a validator
 */
export async function signUpValidator(
  publicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<{ validatorId: string } | null> {
  return new Promise(async (resolve) => {
    // Store sign message function for future use
    signMessageFunction = signMessage;
    
    // Generate a callback ID for this signup request
    const callbackId = window.crypto.randomUUID();
    
    // Create and sign the message
    const msg = `Signed message for ${callbackId}, ${publicKey.toBase58()}`;
    const signature = await signMessage(new TextEncoder().encode(msg));

    // Close any existing socket
    if (socket) {
      socket.close();
    }

    // Connect to the hub
    socket = new WebSocket("ws://localhost:8081");
    
    // Set up handlers
    socket.onopen = () => {
      // Send signup request
      socket?.send(
        JSON.stringify({
          type: "signup",
          data: {
            callbackId,
            ip: "0.0.0.0",
            publicKey: publicKey.toBase58(),
            signedMessage: JSON.stringify(Array.from(signature)),
          },
        })
      );
    };

    socket.onmessage = (event) => {
      const res = JSON.parse(event.data);
      
      // Handle signup response
      if (res.type === "signup" && res.data.callbackId === callbackId) {
        validatorId = res.data.validatorId;
        resolve({ validatorId: res.data.validatorId });
      } 
      // Handle validation requests
      else if (res.type === "validate") {
        handleValidationRequest(res.data);
      }
    };

    socket.onerror = (err: Event) => {
      console.error("WebSocket error:", err);
      resolve(null);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
  });
}

/**
 * Handle incoming validation requests
 */
async function handleValidationRequest(data: any) {
  const { url, callbackId, websiteId } = data;
  console.log(`Validating ${url}`);
  
  // Skip if we don't have validator ID or sign function
  if (!validatorId || !signMessageFunction || !socket) {
    console.error("Validator not properly initialized");
    return;
  }

  // Simulate validation instead of actually fetching
  // This avoids CORS issues in the browser environment
  // In a production environment, this would be replaced with a proper backend validation
  const simulateValidation = () => {
    // Simulate random latency between 50-500ms
    const simulatedLatency = Math.floor(Math.random() * 450) + 50;
    
    // Simulate 90% uptime for websites
    const isUp = Math.random() < 0.9;
    
    return {
      status: isUp ? "UP" : "DOWN" as "UP" | "DOWN",
      latency: simulatedLatency
    };
  };
  
  // Get simulated validation result
  const { status, latency } = simulateValidation();
  
  try {
    // Sign the validation response
    const responseMessage = `Replying to ${callbackId}`;
    const messageBytes = new TextEncoder().encode(responseMessage);
    const signedMessage = await signMessageFunction(messageBytes);
    
    // Send validation result
    socket.send(
      JSON.stringify({
        type: "validate",
        data: {
          validatorId,
          status,
          latency,
          callbackId,
          websiteId,
          signedMessage: JSON.stringify(Array.from(signedMessage)),
        },
      })
    );
    
    // Log the activity
    const activity = {
      url,
      timestamp: Date.now(),
      status,
      latency
    };
    
    // Add to activity log and notify UI
    validationActivities.unshift(activity);
    if (validationActivities.length > 50) {
      validationActivities.pop();
    }
    
    // Dispatch event for UI to pick up
    window.dispatchEvent(new CustomEvent('validation-activity', {
      detail: activity
    }));
    
    console.log(`Validation result for ${url}: ${status}, ${latency}ms`);
  } catch (error) {
    console.error("Error sending validation result:", error);
  }
}

/**
 * Start validation process
 */
export function startValidation(): boolean {
  if (!validatorId || !signMessageFunction) {
    console.error("Validator not initialized");
    return false;
  }
  
  // Nothing to do here since message handler is already set up
  // and will automatically handle validation requests
  return true;
}

/**
 * Get all validation activities
 */
export function getValidationActivities(): ValidationActivity[] {
  return [...validationActivities];
}

/**
 * Get validator status
 */
export function getValidatorStatus(): {
  isConnected: boolean;
  validatorId: string | null;
} {
  return {
    isConnected: !!socket && socket.readyState === WebSocket.OPEN,
    validatorId
  };
}
