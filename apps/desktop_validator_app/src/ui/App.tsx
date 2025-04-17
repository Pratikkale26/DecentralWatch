import { useState, useEffect } from 'react';

function App() {
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [showPubKey, setShowPubKey] = useState<boolean>(false);

  // Fetch pubkey
  useEffect(() => {
    const fetchPubKey = async () => {
      const pubKey = await window.electron.getPubKey();
      setPubKey(pubKey);
    };
    fetchPubKey();
  }, []);

  const handleCreateWallet = async () => {
    const createdKey = await window.electron.createWallet();
    setPubKey(createdKey);
  };

  const toggleShowPubKey = () => {
    setShowPubKey(prev => !prev);
  };

  return (
    <div className="flex justify-center items-center w-screen h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">
      <div className="w-full max-w-3xl mx-auto p-10 bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 space-y-8 text-center animate-fade-in">
        <h1 className="text-4xl font-extrabold tracking-tight text-indigo-400">
          🛡️ DecentralWatch - Node
        </h1>
  
        {!pubKey ? (
          <button
            onClick={handleCreateWallet}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold py-3 px-8 rounded-xl transition duration-300 shadow-md hover:shadow-xl"
          >
            🚀 Create Wallet
          </button>
        ) : (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-green-400">✅ Wallet Ready</h2>
  
            <div className="text-sm sm:text-base text-gray-300">
              <p className="mb-1 font-medium">Public Key:</p>
              <p className="font-mono bg-gray-800 px-4 py-2 rounded-lg break-all border border-gray-700">
                {showPubKey ? pubKey : '**** **** **** ****'}
              </p>
            </div>
  
            <button
              onClick={toggleShowPubKey}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white py-2 px-6 rounded-lg transition duration-200"
            >
              {showPubKey ? '🙈 Hide Public Key' : '👁️ Show Public Key'}
            </button>
  
            <p className="text-yellow-400 text-lg animate-pulse mt-4">
              ⛏️ Mining in progress...
            </p>
          </div>
        )}
      </div>
    </div>
  );
  
}

export default App;
