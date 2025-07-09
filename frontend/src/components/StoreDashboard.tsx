"use client";

import React, { useState } from "react";
import TransactionList from "./common/TransactionList";

interface StoreDashboardProps {
  user: {
    name: string;
    description?: string;
    walletAddress: string;
    qrCode?: string;
  } | null;
  onShowQRCode: () => void;
}

// 더미 매출 데이터 (나중에 실제 API로 교체)
const dummyStoreTransactions = [
  {
    id: "1",
    type: "receive" as const,
    amount: 0.45,
    fromAddress: "0x7e9f8g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j",
    description: "카페 라떼",
    timestamp: "2025-01-07 09:30",
    txHash: "EKpob2HV2TSGhfv6gLYcvMC5RcTS9KxSxndoToiN5yN8",
  },
  {
    id: "2",
    type: "receive" as const,
    amount: 0.35,
    fromAddress: "0x8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
    description: "아이스 아메리카노",
    timestamp: "2025-01-06 19:45",
    txHash: "owSgWNK5tPSvjeG4NEG6fPC6Yz8ddUBwqbFG1U6LP89",
  },
  {
    id: "3",
    type: "receive" as const,
    amount: 0.6,
    fromAddress: "0x9f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a",
    description: "카푸치노",
    timestamp: "2025-01-06 14:20",
    txHash: "Dp4sH3LM6QEbvk3gMJL5nPC7Yz9ddUBwqbFG1U6LP90",
  },
];

const StoreDashboard: React.FC<StoreDashboardProps> = ({ user, onShowQRCode }) => {
  const [recentTransactions] = useState(dummyStoreTransactions);

  return (
    <div className="flex justify-center">
      <div className="flex flex-col p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">결제 QR 코드</h2>
        {/* QR 코드 카드 */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          {user?.qrCode ? (
            <div className="text-center">
              <button
                onClick={onShowQRCode}
                className="hover:opacity-80 transition-opacity cursor-pointer p-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 bg-white"
                title="QR 코드 크게 보기"
              >
                <img src={user.qrCode} alt="결제 QR 코드" className="w-36 h-36 mx-auto rounded-md" />
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                고객이 이 QR 코드를 스캔하여 결제할 수 있습니다
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-qrcode text-4xl text-gray-400 dark:text-gray-500"></i>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">QR 코드를 생성하려면 프로필을 업데이트해주세요</p>
            </div>
          )}
        </div>

        {/* 최근 거래 내역 */}
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 pt-4 mb-4">최근 거래 내역</h2>
        <TransactionList
          transactions={recentTransactions}
          title=""
          emptyMessage="아직 거래 내역이 없습니다"
          maxItems={5}
        />
      </div>
    </div>
  );
};

export default StoreDashboard;
