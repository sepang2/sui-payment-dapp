"use client";

import React from "react";
import { motion } from "framer-motion";
import { useStoreAuth } from "../../../hooks/useAuth";
import { useInfiniteTransactions } from "../../../hooks/useTransactions";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import Header from "../../../components/Header";
import StoreBottomNavigation from "../../../components/StoreBottomNavigation";
import { EXCHANGE_RATE } from "../../../utils/constants";
import { itemVariants } from "../../../utils/animations";

export default function StoreTransactionsPage() {
  const { isLoading: authLoading, user, isAuthenticated } = useStoreAuth();
  const exchangeRate = EXCHANGE_RATE;

  const { transactions, isLoading, isLoadingMore, hasMore, error, loadMore } = useInfiniteTransactions(
    user?.walletAddress || null,
    "store",
    7, // 초기 로드 7개
    5 // 추가 로드 5개
  );

  // 무한스크롤 설정
  useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: loadMore,
    threshold: 200,
  });

  // 오늘의 매출 계산
  const today = new Date().toISOString().split("T")[0];
  const todayTransactions = transactions.filter((tx) => {
    try {
      const txDate = new Date(tx.rawTimestamp);
      if (isNaN(txDate.getTime())) {
        return false; // 유효하지 않은 날짜는 제외
      }
      const txDateString = txDate.toISOString().split("T")[0];
      return txDateString === today && tx.type === "receive";
    } catch (error) {
      console.error("Error parsing transaction date:", error);
      return false; // 에러 발생시 제외
    }
  });
  const todayRevenue = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // 총 매출 계산 (receive만)
  const totalRevenue = transactions.filter((tx) => tx.type === "receive").reduce((sum, tx) => sum + tx.amount, 0);

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

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return timestamp; // 유효하지 않은 날짜인 경우 원본 문자열 반환
      }
      return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return timestamp; // 에러 발생시 원본 문자열 반환
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header walletConnected={isAuthenticated} walletAddress={user?.walletAddress} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <StoreBottomNavigation visible={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header walletConnected={isAuthenticated} walletAddress={user?.walletAddress} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p className="text-red-500 dark:text-red-400">거래 내역을 불러오는데 실패했습니다.</p>
          </div>
        </div>
        <StoreBottomNavigation visible={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header walletConnected={isAuthenticated} walletAddress={user?.walletAddress} />
      <div className="px-4 py-6 pb-24 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">매출 현황</h1>

        {/* 매출 현황 카드 */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">오늘 매출</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{todayRevenue.toFixed(3)} SUI</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ≈ {(todayRevenue * exchangeRate).toLocaleString()} KRW
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">총 매출</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalRevenue.toFixed(3)} SUI</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ≈ {(totalRevenue * exchangeRate).toLocaleString()} KRW
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white pt-4 mb-6">거래 내역</h1>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-exchange-alt text-4xl text-gray-400 dark:text-gray-500 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">거래 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
              >
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
                        {transaction.type === "send" && transaction.toAddress && (
                          <p>to: {formatAddress(transaction.toAddress)}</p>
                        )}
                        {transaction.type === "receive" && transaction.fromAddress && (
                          <p>from: {formatAddress(transaction.fromAddress)}</p>
                        )}
                        <p>{formatTimestamp(transaction.timestamp)}</p>
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ≈ {(transaction.amount * exchangeRate).toLocaleString()} KRW
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* 로딩 인디케이터 */}
            {isLoadingMore && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {/* 더 이상 불러올 데이터가 없을 때 */}
            {!hasMore && transactions.length > 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">모든 거래 내역을 불러왔습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <StoreBottomNavigation visible={true} />
    </div>
  );
}
