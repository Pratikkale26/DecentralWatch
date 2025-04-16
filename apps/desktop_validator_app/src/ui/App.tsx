import { useState } from 'react';

function App() {
  const [pubKey, setPubKey] = useState<string | null>(null);

  const handleCreateWallet = async () => {
    const createdKey = await window.electron.createWallet();
    setPubKey(createdKey);
  };

  return (
    <div className="app">
      <h1>Validator Wallet Setup</h1>
      <button onClick={handleCreateWallet}>Create Wallet</button>

      {pubKey && (
        <div>
          <h2>Wallet Created!</h2>
          <p>Public Key: {pubKey}</p>
        </div>
      )}
    </div>
  );
}

export default App;