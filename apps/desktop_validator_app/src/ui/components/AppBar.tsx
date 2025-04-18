import { useState } from "react";
import WalletDashboard from "./WalletDashboard";

function AppBar() {
  const [showWallet, setShowWallet] = useState(false);

  const toggleWallet = () => {
    setShowWallet((prev) => !prev);
  };

  return (
    <div className="w-full flex justify-between items-center px-6 py-4 rounded-2xl mt-2 bg-gray-900 border-b border-gray-800 shadow-md z-50 relative">
      <h1 className="text-lg font-bold text-indigo-400">🛡️ DecentralWatch</h1>

      {/* Wallet Button */}
      <button
        onClick={toggleWallet}
        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition"
      >
        {showWallet ? "Close Wallet" : "Open Wallet"}
      </button>

      {/* Wallet Modal */}
      {showWallet && (
        <div className="absolute top-full right-4 mt-4 w-[420px] max-w-[90vw] z-50 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <WalletDashboard />
        </div>
      )}
    </div>
  );
}

export default AppBar;
