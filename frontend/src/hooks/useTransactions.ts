"use client";

import { useCallback } from "react";
import useSWR from "swr";

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UseTransactionsReturn {
  transactions: Transaction[]; // 최신 N개
  allTransactions: Transaction[]; // 전체
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

export function useTransactions(
  walletAddress: string | null,
  userType: "consumer" | "store" | null
): UseTransactionsReturn {
  const apiUrl =
    walletAddress && userType
      ? `/api/transactions?walletAddress=${encodeURIComponent(walletAddress)}&userType=${userType}`
      : null;

  const { data, error, isLoading, mutate: refetch } = useSWR(apiUrl, fetcher); // refreshInterval 제거

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

  const transformedTransactions =
    data && walletAddress && userType ? transformApiTransactions(data.transactions || [], userType, walletAddress) : [];

  const recentTransactions = transformedTransactions.slice(0, 3);

  return {
    transactions: recentTransactions,
    allTransactions: transformedTransactions,
    isLoading,
    error,
    refetch,
  };
}
