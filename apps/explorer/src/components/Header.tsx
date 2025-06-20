import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ShieldCheck } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 shadow-md backdrop-blur-md mx-4 mt-4 rounded-2xl bg-gray-900 border border-gray-700">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-indigo-400" size={24} />
        <h1 className="text-xl md:text-2xl font-bold text-white">
          DecentralWatch
          <span className="text-indigo-400"> Explorer</span>
        </h1>
      </div>
      <div className="flex items-center">
        <WalletMultiButton />
      </div>
    </header>
  );
};

export default Header;
