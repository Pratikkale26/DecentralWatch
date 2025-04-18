import { useEffect, useState } from 'react';

function WalletDashboard() {
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [pendingPayout, setPendingPayout] = useState<number>(0.1); // hardcoded example
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<string | null>(null);

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
    try {
      await window.electron.claimReward(); // implement this in preload/backend
      setPendingPayout(0);
      setStatus('✅ Payout claimed successfully!');
    } catch (err) {
      setStatus('❌ Failed to claim payout.');
      console.log(err);
    }
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

  return (
    <div className="bg-gray-600 p-2 text-white flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-4 bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-800">

        <h2 className="text-4xl mb-8 font-bold text-indigo-400 text-center">💼 Validator Wallet</h2>

        {pubKey && (
          <div className="space-y-3 text-center">
            <p className="text-gray-300 font-mono text-sm break-all">{pubKey}</p>
            <p className="text-xl text-green-400">💰 Balance: {balance.toFixed(4)} SOL</p>
          </div>
        )}

        <div className="bg-gray-800 p-5 rounded-xl space-y-3 border border-gray-700">
          <h2 className="text-lg font-semibold text-yellow-400">🟡 Earned Rewards</h2>
          <p className="text-2xl">{pendingPayout} SOL</p>
          <button
            onClick={handleClaim}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-semibold transition"
          >
            Claim Now
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
    </div>
  );
}

export default WalletDashboard;
