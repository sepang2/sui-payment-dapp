"use client";

import React, { useState, useEffect } from "react";
import { useConsumerAuth } from "../../../hooks/useAuth";
import Header from "../../../components/Header";
import ConsumerBottomNavigation from "../../../components/ConsumerBottomNavigation";

interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: number;
  toAddress?: string;
  fromAddress?: string;
  description: string;
  timestamp: string;
  txHash: string;
}

// 더미 데이터
const dummyTransactions: Transaction[] = [
  {
    id: "1",
    type: "send",
    amount: 0.45,
    toAddress: "0x8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
    fromAddress: "0x7e9f8g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j",
    description: "카페 라떼",
    timestamp: "2025-01-07 09:30",
    txHash: "EKpob2HV2TSGhfv6gLYcvMC5RcTS9KxSxndoToiN5yN8",
  },
  {
    id: "2",
    type: "send",
    amount: 0.35,
    toAddress: "0x7e9f8g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j",
    fromAddress: "0x8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
    description: "아이스 아메리카노",
    timestamp: "2025-01-06 19:45",
    txHash: "owSgWNK5tPSvjeG4NEG6fPC6Yz8ddUBwqbFG1U6LP89",
  },
];

export default function ConsumerTransactionsPage() {
  const { isLoading, user, isAuthenticated } = useConsumerAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // 거래 내역 조회
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.walletAddress) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/transactions?walletAddress=${user.walletAddress}&userType=consumer`);

        if (response.ok) {
          const { transactions: dbTransactions } = await response.json();

          // DB 데이터를 UI 형식으로 변환
          const formattedTransactions: Transaction[] = dbTransactions.map((tx: any) => ({
            id: tx.id.toString(),
            type: "send" as const, // Consumer는 항상 send (결제)
            amount: parseFloat(tx.amount),
            toAddress: tx.toAddress,
            fromAddress: tx.fromAddress,
            description: tx.store?.name || "Unknown Store",
            timestamp: new Date(tx.createdAt).toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            txHash: tx.txHash,
          }));

          setTransactions(formattedTransactions);
        } else {
          console.error("Failed to fetch transactions");
          setTransactions([]);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchTransactions();
    }
  }, [isAuthenticated, user]);

  const getTransactionIcon = (type: string) => {
    if (type === "send") return "fas fa-arrow-up text-red-500";
    return "fas fa-arrow-down text-green-500";
  };

  const getAmountColor = (type: string) => {
    return type === "send" ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400";
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (loading || isLoading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <Header walletConnected={isAuthenticated} walletAddress={user?.walletAddress} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <ConsumerBottomNavigation visible={true} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <Header walletConnected={isAuthenticated} walletAddress={user?.walletAddress} />
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
                      <i className={getTransactionIcon(transaction.type)}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {transaction.description}
                      </h3>
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <p>{transaction.timestamp}</p>
                        {transaction.type === "send" && transaction.toAddress && (
                          <p>to: {formatAddress(transaction.toAddress)}</p>
                        )}
                        {transaction.type === "receive" && transaction.fromAddress && (
                          <p>from: {formatAddress(transaction.fromAddress)}</p>
                        )}
                        <p>
                          <a
                            href={`https://suiscan.xyz/testnet/tx/${transaction.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
                          >
                            트랜잭션 해시: {formatAddress(transaction.txHash)}
                          </a>
                        </p>
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
      <ConsumerBottomNavigation visible={true} />
    </div>
  );
}
