// components/Validate.tsx
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { validatorClient, ValidationActivity } from "../validator";

const Validate = () => {
  const { publicKey, signMessage, connected } = useWallet();
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validatorId, setValidatorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<ValidationActivity[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check if validator is already initialized on component mount
  useEffect(() => {
    const status = validatorClient.getStatus();
    if (status.isInitialized) {
      setIsSignedUp(true);
      setValidatorId(status.validatorId);
      setIsValidating(status.isActive);
      setActivities(validatorClient.getActivities());
    }

    // Set up activity polling
    const activityInterval = setInterval(() => {
      setActivities(validatorClient.getActivities());
    }, 3000); // Update activities every 3 seconds
    
    // Listen for validation activity events
    const activityHandler = (event: CustomEvent) => {
      setActivities(prevActivities => {
        const newActivity = event.detail;
        // Add to beginning and limit to 50 items
        const updatedActivities = [newActivity, ...prevActivities].slice(0, 50);
        return updatedActivities;
      });
    };
    
    window.addEventListener('validation-activity', activityHandler as EventListener);

    return () => {
      clearInterval(activityInterval);
      window.removeEventListener('validation-activity', activityHandler as EventListener);
    };
  }, []);

  const handleSignup = async () => {
    if (!publicKey || !signMessage) {
      setError("Wallet not ready. Please connect your wallet.");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const success = await validatorClient.initialize(publicKey, signMessage);
      
      if (success) {
        const status = validatorClient.getStatus();
        setValidatorId(status.validatorId);
        setIsSignedUp(true);
      } else {
        setError("Failed to register as validator. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred during signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!isSignedUp) {
      setError("Please sign up as validator first.");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const success = await validatorClient.startValidating();
      
      if (success) {
        setIsValidating(true);
      } else {
        setError("Failed to start validation. Please try again.");
      }
    } catch (err) {
      console.error("Validation error:", err);
      setError("An error occurred while starting validation.");
    } finally {
      setLoading(false);
    }
  };

  const handleStopValidation = () => {
    validatorClient.stopValidating();
    setIsValidating(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 shadow rounded-xl space-y-4">
      <h2 className="text-xl font-bold text-center">Validator Dashboard</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}
      
      {connected ? (
        <>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <p className="text-sm font-medium mb-1">Connected Wallet</p>
            <p className="text-xs break-all">{publicKey?.toBase58()}</p>
          </div>

          {!isSignedUp ? (
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
            >
              {loading ? "Signing up..." : "Sign Up as Validator"}
            </button>
          ) : (
            <>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-md">
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Validator ID: <span className="text-xs break-all">{validatorId}</span>
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
                  All validation requests will be automatically processed.
                </p>
              </div>
              
              {!isValidating ? (
                <button
                  onClick={handleValidate}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
                >
                  {loading ? "Starting..." : "Start Validating"}
                </button>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 p-2 bg-green-50 dark:bg-green-900 rounded-md">
                    <div className="animate-pulse h-3 w-3 bg-green-500 rounded-full"></div>
                    <p className="font-medium text-green-800 dark:text-green-300">Actively Validating</p>
                  </div>
                  
                  <button
                    onClick={handleStopValidation}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
                  >
                    Stop Validating
                  </button>
                  
                  {activities.length > 0 ? (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Recent Activities</h3>
                      <div className="max-h-48 overflow-auto rounded-md border border-gray-200 dark:border-gray-700">
                        {activities.map((activity, index) => (
                          <div key={index} className="border-b last:border-b-0 border-gray-200 dark:border-gray-700 p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <p className="text-sm font-medium truncate">{activity.url}</p>
                            <div className="flex justify-between text-xs">
                              <span className={`font-medium ${activity.status === 'UP' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {activity.status} • {activity.latency}ms
                              </span>
                              <span className="text-gray-500">{new Date(activity.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      No validation activities yet. Waiting for requests...
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500">Connect your wallet to get started</p>
        </div>
      )}
    </div>
  );
};

export default Validate;
