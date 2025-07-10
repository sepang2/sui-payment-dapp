"use client";

import { useState, useEffect, useCallback } from "react";

interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: number;
  description: string;
  timestamp: string;
  rawTimestamp: string; // ISO 날짜 형식으로 날짜 비교용
  fromAddress?: string;
  toAddress?: string;
}

interface ApiTransaction {
  id: number;
  amount: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  createdAt: string;
  consumer?: {
    name: string;
    walletAddress: string;
  };
  store?: {
    name: string;
    walletAddress: string;
  };
}

interface UseTransactionsReturn {
  transactions: Transaction[]; // 최신 N개
  allTransactions: Transaction[]; // 전체
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTransactions(
  walletAddress: string | null,
  userType: "consumer" | "store" | null
): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transformApiTransactions = useCallback(
    (
      apiTransactions: ApiTransaction[],
      currentUserType: "consumer" | "store",
      currentWalletAddress: string
    ): Transaction[] => {
      return apiTransactions.map((tx) => {
        const isCurrentUserSender = tx.fromAddress === currentWalletAddress;
        const type = isCurrentUserSender ? "send" : "receive";

        let description = "";
        if (currentUserType === "consumer") {
          description = tx.store?.name ? `${tx.store.name}` : "상점 이름";
        } else {
          description = tx.consumer?.name ? `${tx.consumer.name}` : "고객 이름";
        }

        const createdDate = new Date(tx.createdAt);

        return {
          id: tx.id.toString(),
          type,
          amount: parseFloat(tx.amount),
          description,
          timestamp: createdDate.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          rawTimestamp: createdDate.toISOString(),
          fromAddress: tx.fromAddress,
          toAddress: tx.toAddress,
        };
      });
    },
    []
  );

  const fetchTransactions = useCallback(async () => {
    if (!walletAddress || !userType) {
      setTransactions([]);
      setAllTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/transactions?walletAddress=${encodeURIComponent(walletAddress)}&userType=${userType}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }

      const data = await response.json();
      const transformedTransactions = transformApiTransactions(data.transactions || [], userType, walletAddress);
      setAllTransactions(transformedTransactions);
      setTransactions(transformedTransactions.slice(0, 3));
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
      setTransactions([]);
      setAllTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, userType, transformApiTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const refetch = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    allTransactions,
    isLoading,
    error,
    refetch,
  };
}
