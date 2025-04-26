import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between p-3 shadow-md backdrop-blur-md mt-2 mx-10 rounded-3xl bg-gray-800">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-white pl-4">DecentralWatch Explorer</h1>
      </div>
      <div className="flex items-center pr-4">
        <WalletMultiButton />
      </div>
    </header>
  );
};

export default Header;
