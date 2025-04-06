
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {WalletModalProvider, WalletDisconnectButton, WalletMultiButton} from '@solana/wallet-adapter-react-ui';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {


  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]} autoConnect>
            <WalletModalProvider>
              <div className="flex justify-between items-center p-4 bg-gray-900 shadow-lg">
                  <h1 className="text-5xl ml-20 font-bold text-blue-500">Uptora</h1>
                    <div className="flex space-x-2 mr-2">
                        <WalletMultiButton />
                        <WalletDisconnectButton />
                    </div>
                  </div>
                </WalletModalProvider>
            </WalletProvider>
      </ConnectionProvider>
  </div>
  )
}

export default App
