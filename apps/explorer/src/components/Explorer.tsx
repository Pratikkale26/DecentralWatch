import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Wallet, CheckCircle, Download, MapPin, Server } from "lucide-react";

const ELECTRON_GITHUB_URL =
  "https://github.com/Pratikkale26/DecentralWatch/releases/tag/v1.0.0";
const BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;

export default function Explorer() {
  const { publicKey } = useWallet();
  const [isValidator, setIsValidator] = useState<boolean | null>(null);
  const [pendingPayout, setPendingPayout] = useState<number>();
  const [validators, setValidators] = useState<
    {
      id: string;
      publicKey: string;
      location: string;
      ip: string;
      pendingPayouts: number;
    }[]
  >([]);

  // Check if user is validator
  useEffect(() => {
    if (publicKey) {
      axios.get(`${BACKEND_URL}/api/v1/validator/is-validator`, {
          params: { publicKey: publicKey.toString() },
        })
        .then((res) => {
          setIsValidator(res.data.isValidator);
          setPendingPayout(res.data.pendingPayout);
        })
        .catch(() => setIsValidator(false));
    } else {
      setIsValidator(null);
    }
  }, [publicKey]);

  // Fetch all validators
  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/v1/validator/validators`)
      .then((res) => setValidators(res.data.validators || []))
      .catch(() => setValidators([]));
  }, []);

  return (
    <main className="flex-1 px-4 py-10 max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-8">
        DecentralWatch Explorer
      </h2>

      {publicKey ? (
        <div className="bg-gray-900 rounded-xl p-6 shadow mb-8 text-center border border-gray-700">
          <div className="flex flex-col items-center space-y-2">
            <Wallet className="text-indigo-400" />
            <div className="text-sm text-gray-400">Connected Wallet</div>
            <div className="font-mono text-xs break-all bg-gray-800 px-4 py-2 rounded text-blue-300">
              {publicKey.toString()}
            </div>
          </div>

          {isValidator === false && (
            <button
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-semibold inline-flex items-center gap-2 shadow"
              onClick={() => window.open(ELECTRON_GITHUB_URL, "_blank")}
            >
              <Download size={16} /> Become a Validator
            </button>
          )}

          {isValidator && (
            <div className="mt-6 text-green-400 text-sm font-semibold">
              <CheckCircle className="inline-block mr-1" size={16} />
              You are a validator!
              {pendingPayout !== undefined && (
                <div className="mt-2 text-white">
                  Pending Payout:{" "}
                  <span className="font-bold text-yellow-400">
                    {(pendingPayout / 1_000_000_000).toFixed(4)} SOL
                  </span>
                  <button
                    className="ml-4 bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded font-medium shadow-sm text-sm"
                    onClick={() =>
                      alert("Payouts processed on the 1st of each month.")
                    }
                  >
                    Claim
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 mb-8">
          Connect your wallet to get started.
        </div>
      )}

      <div>
        <h3 className="text-2xl font-bold mb-4 text-center text-white">
          Active Validators
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {validators.length === 0 ? (
            <div className="col-span-2 text-center text-gray-400">
              No validators found.
            </div>
          ) : (
            validators.map((v) => (
              <div
                key={v.id}
                className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-700 hover:border-indigo-500 transition"
              >
                <div className="font-mono text-xs break-all text-blue-300 mb-2">
                  {v.publicKey}
                </div>
                <div className="text-sm text-gray-300 flex items-center gap-2">
                  <MapPin size={14} /> Location: {v.location}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
