"use client";

import React, { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Header from "../../components/Header";
import BottomNavigation from "../../components/BottomNavigation";

interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: number;
  toAddress?: string;
  fromAddress?: string;
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
}

// 더미 데이터
const dummyTransactions: Transaction[] = [
  {
    id: "1",
    type: "send",
    amount: 0.45,
    toAddress: "0x8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
    description: "카페 라떼",
    timestamp: "2025-01-07 09:30",
    status: "completed",
  },
  {
    id: "2",
    type: "send",
    amount: 0.35,
    toAddress: "0x7e9f8g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j",
    description: "아이스 아메리카노",
    timestamp: "2025-01-06 19:45",
    status: "completed",
  },
];

export default function TransactionsPage() {
  const account = useCurrentAccount();
  const [transactions] = useState<Transaction[]>(dummyTransactions);
  const [loading] = useState(false);

  const walletConnected = !!account;

  const getTransactionIcon = (type: string, status: string) => {
    if (status === "pending") return "fas fa-clock text-yellow-500";
    if (status === "failed") return "fas fa-times-circle text-red-500";

    if (type === "send") return "fas fa-arrow-up text-red-500";
    return "fas fa-arrow-down text-green-500";
  };

  const getAmountColor = (type: string) => {
    return type === "send" ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400";
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!walletConnected) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <Header walletConnected={false} />
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <i className="fas fa-wallet text-4xl text-gray-400 dark:text-gray-500 mb-4"></i>
            <p className="text-gray-600 dark:text-gray-400">거래 내역을 보려면 지갑을 연결해주세요.</p>
          </div>
        </div>
        <BottomNavigation visible={true} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <Header walletConnected={walletConnected} walletAddress={account?.address} />
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <BottomNavigation visible={true} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <Header walletConnected={walletConnected} walletAddress={account?.address} />
      <div className="px-4 py-6 pb-24 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">거래 내역</h1>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-exchange-alt text-4xl text-gray-400 dark:text-gray-500 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">거래 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                      <i className={getTransactionIcon(transaction.type, transaction.status)}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {transaction.description}
                      </h3>
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <p>{transaction.timestamp}</p>
                        {transaction.type === "send" && transaction.toAddress && (
                          <p>받는 주소: {formatAddress(transaction.toAddress)}</p>
                        )}
                        {transaction.type === "receive" && transaction.fromAddress && (
                          <p>보낸 주소: {formatAddress(transaction.fromAddress)}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {transaction.status === "completed" && "완료"}
                            {transaction.status === "pending" && "대기중"}
                            {transaction.status === "failed" && "실패"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getAmountColor(transaction.type)}`}>
                      {transaction.type === "send" ? "-" : "+"}
                      {transaction.amount.toFixed(3)} SUI
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 더 많은 거래 내역 로드 버튼 (나중에 구현) */}
        {transactions.length > 0 && (
          <div className="mt-6 text-center">
            <button
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
              onClick={() => {
                // TODO: 더 많은 거래 내역 로드
                console.log("Load more transactions");
              }}
            >
              더 많은 거래 내역 보기
            </button>
          </div>
        )}
      </div>
      <BottomNavigation visible={true} />
    </div>
  );
}
