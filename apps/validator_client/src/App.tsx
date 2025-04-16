import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {WalletModalProvider, WalletDisconnectButton, WalletMultiButton} from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';
import Validate from './components/Validate';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  // Initialize wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        {/* Navigation Header */}
                        <header className="flex items-center justify-between px-10 py-6 bg-gray-950 border-b border-gray-800 shadow-lg">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-500 tracking-tight">
                            DecentralWatch Validator
                            </h1>
                            <div className="flex gap-3">
                                <WalletMultiButton />
                                <WalletDisconnectButton />
                            </div>
                        </header>

                        {/* Main Content */}
                        <main className="flex justify-center items-center px-4 py-16">
                            <Validate />
                        </main>
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </div>
    );
}

export default App;
