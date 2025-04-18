import { useState, useEffect } from 'react';

function App() {
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [showPubKey, setShowPubKey] = useState<boolean>(false);
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

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

  const handleRestoreWallet = async () => {
    try {
      const restoredKey = await window.electron.restoreWallet(seedPhrase.trim());
      setPubKey(restoredKey);
      setError(null);
    } catch (err) {
      setError("Invalid seed phrase or error restoring wallet");
      console.log(err);
    }
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
          <div className="space-y-6">
            <button
              onClick={handleCreateWallet}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold py-3 px-8 rounded-xl transition duration-300 shadow-md hover:shadow-xl"
            >
              🚀 Create Wallet
            </button>

            <div className="space-y-3">
              <textarea
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                placeholder="Enter your 12/24-word seed phrase"
                className="w-full p-3 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white resize-none"
                rows={3}
              />
              <button
                onClick={handleRestoreWallet}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
              >
                ♻️ Restore Wallet
              </button>
              {error && (
                <p className="text-red-400 text-sm font-medium">{error}</p>
              )}
            </div>
          </div>
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
