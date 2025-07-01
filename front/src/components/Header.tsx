import React from "react";
import { ConnectButton } from "@mysten/dapp-kit";

interface HeaderProps {
  walletConnected: boolean;
  walletAddress?: string;
}

const Header: React.FC<HeaderProps> = ({ walletConnected, walletAddress }) => {
  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-2">
            <i className="fas fa-wallet text-white"></i>
          </div>
          <h1 className="text-xl font-bold text-gray-800">SUI 페이</h1>
        </div>
        {!walletConnected ? (
          <div className="connect-wallet-container">
            <ConnectButton />
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <p className="text-sm text-gray-600">
              {formatWalletAddress(walletAddress || "")}
            </p>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
