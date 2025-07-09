"use client";

import React, { useState } from "react";
import { EXCHANGE_RATE } from "../utils/constants";
import TransactionList from "./common/TransactionList";

interface ConsumerDashboardProps {
  balance: number;
  balanceLoading: boolean;
  onScanQRCode: () => void;
}

// 더미 결제 데이터 (나중에 실제 API로 교체)
const dummyConsumerTransactions = [
  {
    id: "1",
    type: "send" as const,
    amount: 0.45,
    toAddress: "0x8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
    description: "카페 라떼",
    timestamp: "2025-01-07 09:30",
    txHash: "EKpob2HV2TSGhfv6gLYcvMC5RcTS9KxSxndoToiN5yN8",
  },
  {
    id: "2",
    type: "send" as const,
    amount: 0.35,
    toAddress: "0x7e9f8g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j",
    description: "아이스 아메리카노",
    timestamp: "2025-01-06 19:45",
    txHash: "owSgWNK5tPSvjeG4NEG6fPC6Yz8ddUBwqbFG1U6LP89",
  },
  {
    id: "3",
    type: "send" as const,
    amount: 0.6,
    toAddress: "0x9f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a",
    description: "카푸치노",
    timestamp: "2025-01-06 14:20",
    txHash: "Dp4sH3LM6QEbvk3gMJL5nPC7Yz9ddUBwqbFG1U6LP90",
  },
];

const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ balance, balanceLoading, onScanQRCode }) => {
  const exchangeRate = EXCHANGE_RATE;
  const displayBalance = balanceLoading ? 0 : balance;
  const [recentTransactions] = useState(dummyConsumerTransactions);

  // 오늘의 결제 계산
  const today = new Date().toISOString().split("T")[0];
  const todayTransactions = recentTransactions.filter((tx) => tx.timestamp.split(" ")[0] === today.replace(/-/g, "-"));
  const todaySpent = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // 지갑 연결은 상위 컴포넌트에서 처리됨

  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center p-6 w-full max-w-md">
        {/* 잔액 카드 */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">SUI 잔액</h2>
          <div className="text-center">
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              {balanceLoading ? "로딩 중..." : `${displayBalance.toFixed(3)} SUI`}
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              ≈ {(displayBalance * exchangeRate).toLocaleString()} KRW
            </p>
          </div>

          {/* 오늘의 결제 요약 */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">오늘 결제</span>
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">-{todaySpent.toFixed(3)} SUI</span>
            </div>
          </div>
        </div>

        {/* QR 스캔 버튼 */}
        <div className="w-full mb-6">
          <button
            onClick={onScanQRCode}
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white py-4 px-6 rounded-lg text-lg font-semibold flex items-center justify-center gap-3 transition-colors"
          >
            <i className="fas fa-camera text-xl"></i>
            QR 코드 스캔하기
          </button>
        </div>

        {/* 최근 결제 내역 */}
        <TransactionList
          transactions={recentTransactions}
          title="최근 결제 내역"
          emptyMessage="아직 결제 내역이 없습니다"
          maxItems={5}
        />
      </div>
    </div>
  );
};

export default ConsumerDashboard;
