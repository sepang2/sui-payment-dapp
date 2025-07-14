"use client";

import { useCallback, useState, useEffect } from "react";
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
  txHash: string;
  status: "PENDING" | "APPROVED" | "REJECTED"; // 거래 상태
}

interface ApiTransaction {
  id: number;
  amount: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  createdAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED"; // 거래 상태
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
  updateTransactionStatus: (
    transactionId: string,
    status: "APPROVED" | "REJECTED",
    storeWalletAddress: string
  ) => Promise<boolean>;
}

export function useTransactions(
  walletAddress: string | null,
  userType: "consumer" | "store" | null
): UseTransactionsReturn {
  const apiUrl =
    walletAddress && userType
      ? `/api/transactions?walletAddress=${encodeURIComponent(walletAddress)}&userType=${userType}&limit=999`
      : null;

  const { data, error, isLoading, mutate: refetch } = useSWR(apiUrl, fetcher);

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
          txHash: tx.txHash,
          status: tx.status,
        };
      });
    },
    []
  );

  // 거래 상태 업데이트 함수
  const updateTransactionStatus = useCallback(
    async (transactionId: string, status: "APPROVED" | "REJECTED", storeWalletAddress: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/transactions/${transactionId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            storeWalletAddress,
          }),
        });

        if (response.ok) {
          // 성공 시 데이터 다시 가져오기
          refetch();
          return true;
        } else {
          const errorData = await response.json();
          console.error("Failed to update transaction status:", errorData.error);
          return false;
        }
      } catch (error) {
        console.error("Error updating transaction status:", error);
        return false;
      }
    },
    [refetch]
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
    updateTransactionStatus,
  };
}

// 새로운 무한 스크롤 훅
interface UseInfiniteTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: any;
  loadMore: () => void;
  refetch: () => void;
  updateTransactionStatus: (
    transactionId: string,
    status: "APPROVED" | "REJECTED",
    storeWalletAddress: string
  ) => Promise<boolean>;
}

export function useInfiniteTransactions(
  walletAddress: string | null,
  userType: "consumer" | "store" | null,
  initialLimit: number = 7,
  loadMoreLimit: number = 5,
  status?: "ALL" | "PENDING" | "APPROVED" | "REJECTED"
): UseInfiniteTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<any>(null);

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
          txHash: tx.txHash,
          status: tx.status,
        };
      });
    },
    []
  );

  // 거래 상태 업데이트 함수
  const updateTransactionStatus = useCallback(
    async (transactionId: string, status: "APPROVED" | "REJECTED", storeWalletAddress: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/transactions/${transactionId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            storeWalletAddress,
          }),
        });

        if (response.ok) {
          // 성공 시 로컬 상태 업데이트
          setTransactions((prev) => prev.map((tx) => (tx.id === transactionId ? { ...tx, status } : tx)));
          return true;
        } else {
          const errorData = await response.json();
          console.error("Failed to update transaction status:", errorData.error);
          return false;
        }
      } catch (error) {
        console.error("Error updating transaction status:", error);
        return false;
      }
    },
    []
  );

  const fetchTransactions = useCallback(
    async (skip: number, take: number, isInitial: boolean = false) => {
      if (!walletAddress || !userType) return;

      try {
        if (isInitial) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        let url = `/api/transactions?walletAddress=${encodeURIComponent(
          walletAddress
        )}&userType=${userType}&offset=${skip}&limit=${take}`;
        if (status && status !== "ALL") {
          url += `&status=${status}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
          const newTransactions = transformApiTransactions(data.transactions || [], userType, walletAddress);

          if (isInitial) {
            setTransactions(newTransactions);
            setOffset(newTransactions.length);
          } else {
            setTransactions((prev) => [...prev, ...newTransactions]);
            setOffset((prev) => prev + newTransactions.length);
          }

          // 더 불러올 데이터가 있는지 확인
          setHasMore(newTransactions.length === take);
        } else {
          setError(data.error || "Failed to fetch transactions");
        }
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [walletAddress, userType, transformApiTransactions, status]
  );

  // 초기 로드
  useEffect(() => {
    if (walletAddress && userType) {
      setTransactions([]);
      setOffset(0);
      setHasMore(true);
      setError(null);
      fetchTransactions(0, initialLimit, true);
    }
  }, [walletAddress, userType, initialLimit, status, fetchTransactions]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchTransactions(offset, loadMoreLimit, false);
    }
  }, [fetchTransactions, offset, loadMoreLimit, isLoadingMore, hasMore]);

  const refetch = useCallback(() => {
    if (walletAddress && userType) {
      setTransactions([]);
      setOffset(0);
      setHasMore(true);
      setError(null);
      fetchTransactions(0, initialLimit, true);
    }
  }, [walletAddress, userType, initialLimit, fetchTransactions]);

  return {
    transactions,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
    updateTransactionStatus,
  };
}
