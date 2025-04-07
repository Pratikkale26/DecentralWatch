// Import necessary dependencies and validatorClient functions
import { PublicKey } from "@solana/web3.js";
import { 
  signUpValidator, 
  startValidation, 
  getValidationActivities,
  getValidatorStatus
} from "./lib/validatorClient";

// Re-export the activity type for components to use
export type ValidationActivity = {
  url: string;
  timestamp: number;
  status: "UP" | "DOWN";
  latency: number;
};

// Class to manage validator state and activities
export class ValidatorClient {
  private isActive = false;
  private activities: ValidationActivity[] = [];

  constructor() {
    // Listen for validation activity events from the validatorClient
    window.addEventListener('validation-activity', ((event: CustomEvent) => {
      this.logActivity(event.detail);
    }) as EventListener);
  }

  // Initialize the validator with wallet details
  async initialize(
    publicKey: PublicKey,
    signMessage: (message: Uint8Array) => Promise<Uint8Array>
  ): Promise<boolean> {
    try {
      // Try to sign up with the validator server
      const result = await signUpValidator(publicKey, signMessage);
      
      if (result?.validatorId) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to initialize validator:", error);
      return false;
    }
  }

  // Start the validation process
  async startValidating(): Promise<boolean> {
    try {
      const success = await startValidation();
      if (success) {
        this.isActive = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to start validation:", error);
      return false;
    }
  }

  // Stop the validation process
  stopValidating(): void {
    this.isActive = false;
    // Socket connection remains open to receive further validation requests
  }

  // Add a validation activity to the log
  logActivity(activity: ValidationActivity): void {
    this.activities.unshift(activity); // Add to the beginning of the array
    // Keep only the last 50 activities
    if (this.activities.length > 50) {
      this.activities = this.activities.slice(0, 50);
    }
  }

  // Get the validation activity log
  getActivities(): ValidationActivity[] {
    return getValidationActivities();
  }

  // Get validator status
  getStatus(): {
    isInitialized: boolean;
    isActive: boolean;
    validatorId: string | null;
    activityCount: number;
  } {
    const status = getValidatorStatus();
    return {
      isInitialized: !!status.validatorId,
      isActive: this.isActive,
      validatorId: status.validatorId,
      activityCount: getValidationActivities().length
    };
  }
}

// Create and export a singleton instance
export const validatorClient = new ValidatorClient();