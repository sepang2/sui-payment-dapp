import React from "react";
import { ConnectButton } from "@mysten/dapp-kit";

interface DashboardProps {
  walletConnected: boolean;
  balance: number;
  balanceLoading: boolean;
  onStartQRScan: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  walletConnected,
  balance,
  balanceLoading,
  onStartQRScan,
}) => {
  const exchangeRate = 3500; // USD to KRW 환율
  const displayBalance = balanceLoading ? 0 : balance;

  if (!walletConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-[80vh] max-w-md mx-auto">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-wallet text-4xl text-indigo-600"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2 p-4">
          SUI 페이에 오신 것을 환영합니다
        </h2>
        <p className="text-gray-600 text-center mb-8">
          SUI 블록체인을 이용한 간편한 결제 서비스입니다.
          <br />
          시작하려면 Slush Wallet을 연결해주세요.
        </p>
        <div className="connect-wallet-main p-6">
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 max-w-md mx-auto">
      <div className="w-full bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-700 mb-2 pb-2">SUI 잔액</h2>
        <div>
          <p className="text-3xl font-bold text-indigo-600">
            {balanceLoading ? "로딩 중..." : `${displayBalance.toFixed(3)} SUI`}
          </p>
          <p className="text-sm text-gray-500">
            ≈ {(displayBalance * exchangeRate).toLocaleString()} KRW
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 w-full py-4">
        <button
          onClick={onStartQRScan}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-button text-lg font-semibold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <i className="fas fa-qrcode"></i>
          QR 코드 스캔하기
        </button>
        <button className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-4 px-6 rounded-button text-lg font-semibold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap">
          <i className="fas fa-plus-circle"></i>
          SUI 충전하기
        </button>
      </div>
      <div className="mt-8 w-full py-2">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 py-2">
          최근 거래 내역
        </h3>
        <div className="flex flex-col gap-2">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">커피숍 123</p>
                <p className="text-sm text-gray-500">2025-07-01 09:30</p>
              </div>
              <p className="text-red-500 font-medium">-0.125 SUI</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">레스토랑 XYZ</p>
                <p className="text-sm text-gray-500">2025-06-30 19:45</p>
              </div>
              <p className="text-red-500 font-medium">-0.350 SUI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
