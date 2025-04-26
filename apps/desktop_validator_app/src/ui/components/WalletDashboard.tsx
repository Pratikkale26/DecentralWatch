import { useEffect, useState } from 'react';

function WalletDashboard() {
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);


  useEffect(() => {
    const fetchData = async () => {
      const key = await window.electron.getPubKey();
      setPubKey(key);
      if (key) {
        const bal = await window.electron.getBalance();
        setBalance(bal);
      }
    };
    fetchData();
  }, []);

  const handleClaim = async () => {
    setStatus('✅ Payout happens on 1st of the next month.');
  };

  const handleSend = async () => {
    try {
        if(!receiver || !amount) return setStatus("Please enter Address/Amount")
      const res = await window.electron.sendSol(receiver, parseFloat(amount));
      setStatus(`✅ Sent ${amount} SOL to ${receiver}`);
      setAmount('');
      setReceiver('');

      if (res) {
        const bal = await window.electron.getBalance();
        setBalance(bal);
      }
    } catch (err) {
      setStatus('❌ Transaction failed.');
      console.log(err);
    }
  };

  const handleGetPrivateKey = async () => {
    try {
      const key = await window.electron.getPrivateKey();
      setPrivateKey(key);
    } catch (err) {
      console.log(err);
    }
  };

  const showPrivateKeyAlert = () => {
    if (window.confirm("Are you sure you want to view the private key?")) {
      handleGetPrivateKey();
      setShowPrivateKey(true);
    }
  };

  const closePrivateKey = () => {
    setShowPrivateKey(false);
    setPrivateKey(null);
  };


  return (
    <div className="bg-gray-600 p-2 text-white flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-4 bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-800">

        <h2 className="text-4xl mb-8 font-bold text-indigo-400 text-center">💼 Validator Wallet</h2>

        {pubKey && (
          <div className="space-y-3 text-center">
            <p className="text-gray-300 font-mono text-sm">{pubKey}</p>
            <p className="text-xl text-green-400">💰 Balance: {balance.toFixed(4)} SOL</p>
          </div>
        )}

        <div className="bg-gray-800 p-5 rounded-xl space-y-3 border border-gray-700">
          <h2 className="text-lg font-semibold text-yellow-400">🟡 Earned Rewards</h2>
          <p className="text-2xl">View on explorer</p>
          <button
            onClick={handleClaim}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-semibold transition"
          >
            Claim Rewards
          </button>
        </div>

        <div className="bg-gray-800 p-5 rounded-xl space-y-3 border border-gray-700">
          <h2 className="text-lg font-semibold text-blue-400">📤 Send SOL</h2>
          <input
            type="text"
            placeholder="Recipient Address"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <input
            type="number"
            placeholder="Amount in SOL"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition"
          >
            Send
          </button>
        </div>

        {status && (
          <p className="text-center text-sm font-medium text-purple-400">{status}</p>
        )}
      </div>

      <div className="mt-8 w-full flex flex-col items-center space-y-4">
        <button
          onClick={showPrivateKeyAlert}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg font-semibold transition"
        >
          🔐 Show Private Key
        </button>

        {showPrivateKey && privateKey && (
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 w-full max-w-2xl mt-4">
            <h3 className="text-red-400 text-center mb-2 font-semibold">Your Private Key:</h3>
            <p className="text-gray-300 font-mono text-xs break-all text-center">{privateKey}</p>
            <p>Note: Keep this private and do not share it with anyone. (add wallet in phantom)</p>
            <button
              onClick={closePrivateKey}
              className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-semibold transition mt-4"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletDashboard;
