import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import Header from "./components/Header";
import Explorer from "./components/Explorer";

const endpoint = "https://api.devnet.solana.com";

function App() {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <div className="bg-gray-900 text-white min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Explorer />
            </main>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
