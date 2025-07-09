"use client";

import React from "react";
import { useUser } from "../hooks/useUser";
import { EXCHANGE_RATE } from "../utils/constants";
import TransactionList from "./common/TransactionList";

interface DashboardProps {
  balance: number;
  balanceLoading: boolean;
  onMakeQRCode: () => void;
  onScanQRCode: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ balance, balanceLoading, onMakeQRCode, onScanQRCode }) => {
  const { user } = useUser();
  const exchangeRate = EXCHANGE_RATE;
  const displayBalance = balanceLoading ? 0 : balance;

  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center p-6 w-full max-w-md">
        <div className="flex justify-between w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2 pb-2">SUI 잔액</h2>
            <div>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {balanceLoading ? "로딩 중..." : `${displayBalance.toFixed(3)} SUI`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ≈ {(displayBalance * exchangeRate).toLocaleString()} KRW
              </p>
            </div>
          </div>
          {user?.qrCode && (
            <div className="flex items-center justify-center">
              <button
                onClick={onMakeQRCode}
                className="hover:opacity-80 transition-opacity cursor-pointer p-1 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500"
                title="QR 코드 정보"
              >
                <img src={user.qrCode} alt="지갑 QR 코드" className="w-22 h-22 rounded-md" />
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 w-full py-2">
          <button
            onClick={onScanQRCode}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white py-4 px-6 rounded-button text-lg font-semibold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <i className="fas fa-camera"></i>
            QR 코드 스캔하기
          </button>
        </div>
        <div className="mt-8">
          <TransactionList
            transactions={[
              {
                id: "1",
                type: "send",
                amount: 0.45,
                description: "카페 라떼",
                timestamp: "2025-01-07 09:30",
              },
              {
                id: "2",
                type: "send",
                amount: 0.35,
                description: "아이스 아메리카노",
                timestamp: "2025-01-06 19:45",
              },
            ]}
            title="최근 거래 내역"
            emptyMessage="아직 거래 내역이 없습니다"
            maxItems={5}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
