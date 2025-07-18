"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStoreAuth } from "../../../hooks/useAuth";
import { useInfiniteTransactions, useTransactions } from "../../../hooks/useTransactions";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import Header from "../../../components/Header";
import StoreBottomNavigation from "../../../components/StoreBottomNavigation";
import { EXCHANGE_RATE } from "../../../utils/constants";
import { useTranslation } from "react-i18next";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function StoreTransactionsPage() {
  const { t, i18n } = useTranslation();
  const { isLoading: authLoading, user, isAuthenticated } = useStoreAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [previousCount, setPreviousCount] = useState(0);
  const [processingTxId, setProcessingTxId] = useState<string | null>(null);
  const exchangeRate = EXCHANGE_RATE;

  const { transactions, isLoading, isLoadingMore, hasMore, error, loadMore, updateTransactionStatus, refetch } =
    useInfiniteTransactions(
      user?.walletAddress || null,
      "store",
      7, // 초기 로드 7개
      5, // 추가 로드 5개
      statusFilter
    );

  // 전체 거래내역도 별도로 불러온다 (상단 상태 관리 탭/매출 현황용)
  const { allTransactions, refetch: refetchAll } = useTransactions(user?.walletAddress || null, "store");

  // 무한스크롤 설정
  useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: loadMore,
    threshold: 200,
    loadDelay: 1500, // 1.5초 딜레이
  });

  // 상태별 필터링
  // const filteredTransactions = transactions.filter((transaction) => {
  //   if (statusFilter === "ALL") return true;
  //   return transaction.status === statusFilter;
  // });

  // 오늘의 매출 계산 (승인된 거래만, 전체 거래내역 기준)
  const today = new Date().toISOString().split("T")[0];
  const todayTransactions = allTransactions.filter((tx) => {
    try {
      const txDate = new Date(tx.rawTimestamp);
      if (isNaN(txDate.getTime())) {
        return false;
      }
      const txDateString = txDate.toISOString().split("T")[0];
      return txDateString === today && tx.type === "receive" && tx.status === "APPROVED";
    } catch (error) {
      console.error("Error parsing transaction date:", error);
      return false;
    }
  });
  const todayRevenue = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // 총 매출 계산 (승인된 receive만, 전체 거래내역 기준)
  const totalRevenue = allTransactions
    .filter((tx) => tx.type === "receive" && tx.status === "APPROVED")
    .reduce((sum, tx) => sum + tx.amount, 0);

  // 상태별 통계 (전체 거래내역 기준)
  const statusCounts = {
    PENDING: allTransactions.filter((tx) => tx.status === "PENDING").length,
    APPROVED: allTransactions.filter((tx) => tx.status === "APPROVED").length,
    REJECTED: allTransactions.filter((tx) => tx.status === "REJECTED").length,
  };

  // 새로 로드된 항목 추적
  useEffect(() => {
    if (transactions.length > previousCount) {
      setPreviousCount(transactions.length);
    }
  }, [transactions.length, previousCount]);

  // 헬퍼 함수들
  const getTransactionIcon = (type: string, status: string) => {
    if (status === "PENDING") return "fas fa-clock text-yellow-500";
    if (status === "APPROVED") {
      return "fas fa-check text-green-500";
      // return type === "send" ? "fas fa-arrow-up text-red-500" : "fas fa-arrow-down text-green-500";
    }
    if (status === "REJECTED") return "fas fa-times text-red-500";
    return "fas fa-question text-gray-500";
  };

  const getAmountColor = (type: string, status: string) => {
    if (status === "PENDING") return "text-yellow-500 dark:text-yellow-400";
    if (status === "REJECTED") return "text-gray-500 dark:text-gray-400";
    return type === "send" ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400";
  };

  const formatAddress = (address: string | undefined) => {
    if (!address) return "Unknown Address";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleStatusUpdate = async (transactionId: string, status: "APPROVED" | "REJECTED") => {
    if (!updateTransactionStatus || !user?.walletAddress) return;

    setProcessingTxId(transactionId);
    try {
      const success = await updateTransactionStatus(transactionId, status, user.walletAddress);
      if (!success) {
        alert("거래 상태 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating transaction status:", error);
      alert(t("update_error"));
    } finally {
      setProcessingTxId(null);
    }
  };

  const getFilterButtonClass = (filter: StatusFilter) => {
    const baseClass = "px-4 py-2 rounded-lg font-medium text-sm transition-colors";
    const activeClass = "bg-indigo-600 text-white";
    const inactiveClass =
      "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600";

    return `${baseClass} ${statusFilter === filter ? activeClass : inactiveClass}`;
  };

  const getStatusIcon = (status: StatusFilter) => {
    switch (status) {
      case "PENDING":
        return "fas fa-clock text-yellow-500";
      case "APPROVED":
        return "fas fa-check text-green-500";
      case "REJECTED":
        return "fas fa-times text-red-500";
      default:
        return "fas fa-list text-gray-500";
    }
  };

  // SSE 구독 - 트랜잭션 상태 업데이트(DB) 실시간 수신
  useEffect(() => {
    if (!user?.walletAddress) return;

    const eventSource = new EventSource(
      `/api/transactions/stream?walletAddress=${encodeURIComponent(user.walletAddress)}&userType=store`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "transaction_status_update" || data.id || data.transaction) {
        refetch(); // 무한스크롤 목록 갱신
        refetchAll(); // 전체 목록 갱신
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
    };

    return () => eventSource.close();
  }, [user?.walletAddress, refetch, refetchAll]);

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
            <p className="text-red-500 dark:text-red-400">{t("failed_to_load_transactions")}</p>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t("sales_status")}</h1>

        {/* 매출 현황 카드 */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("today_sales")}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{todayRevenue.toFixed(3)} SUI</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ≈ {(todayRevenue * exchangeRate).toLocaleString()} KRW
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("total_sales")}</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalRevenue.toFixed(3)} SUI</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ≈ {(totalRevenue * exchangeRate).toLocaleString()} KRW
              </p>
            </div>
          </div>
        </div>

        {/* 거래 상태 통계 */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t("transaction_status")}</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="flex items-center justify-center mb-1">
                <i className="fas fa-clock text-yellow-500"></i>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{t("pending")}</span>
              </div>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{statusCounts.PENDING}</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <i className="fas fa-check text-green-500"></i>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{t("approved")}</span>
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{statusCounts.APPROVED}</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <i className="fas fa-times text-red-500"></i>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{t("rejected")}</span>
              </div>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{statusCounts.REJECTED}</p>
            </div>
          </div>
        </div>

        {/* 상태 필터 버튼 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("transaction_history")}</h1>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setStatusFilter("ALL")} className={getFilterButtonClass("ALL")}>
            <i className={getStatusIcon("ALL")}></i>
            <span className="ml-2">
              {t("all")} ({allTransactions.length})
            </span>
          </button>
          <button onClick={() => setStatusFilter("PENDING")} className={getFilterButtonClass("PENDING")}>
            <i className={getStatusIcon("PENDING")}></i>
            {i18n.language === "en" ? (
              <span className="block">
                {t("pending")} ({statusCounts.PENDING})
              </span>
            ) : (
              <span className="ml-2">
                {t("pending")} ({statusCounts.PENDING})
              </span>
            )}
          </button>
          <button onClick={() => setStatusFilter("APPROVED")} className={getFilterButtonClass("APPROVED")}>
            <i className={getStatusIcon("APPROVED")}></i>
            {i18n.language === "en" ? (
              <span className="block">
                {t("approved")} ({statusCounts.APPROVED})
              </span>
            ) : (
              <span className="ml-2">
                {t("approved")} ({statusCounts.APPROVED})
              </span>
            )}
          </button>
          <button onClick={() => setStatusFilter("REJECTED")} className={getFilterButtonClass("REJECTED")}>
            <i className={getStatusIcon("REJECTED")}></i>
            {i18n.language === "en" ? (
              <span className="block">
                {t("rejected")} ({statusCounts.REJECTED})
              </span>
            ) : (
              <span className="ml-2">
                {t("rejected")} ({statusCounts.REJECTED})
              </span>
            )}
          </button>
        </div>

        {/* 거래 내역 리스트 */}
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-exchange-alt text-4xl text-gray-400 dark:text-gray-500 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">
              {statusFilter === "ALL"
                ? t("no_transaction_history")
                : `${
                    statusFilter === "PENDING"
                      ? t("pending")
                      : statusFilter === "APPROVED"
                      ? t("approved")
                      : t("rejected")
                  } ${t("no_transaction_history")}`}
            </p>
          </div>
        ) : (
          <div>
            {/* 거래 내역 직접 렌더링 */}
            <div className="space-y-3">
              {transactions.map((transaction, index) => {
                // 새로 로드된 항목인지 확인 (이전 개수보다 뒤에 있는 항목들)
                const isNewItem = index >= previousCount;

                return (
                  <motion.div
                    key={transaction.id}
                    initial={isNewItem ? { opacity: 0, y: 20 } : false}
                    animate={isNewItem ? { opacity: 1, y: 0 } : false}
                    transition={isNewItem ? { duration: 0.3, delay: (index - previousCount) * 0.1 } : undefined}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition ${
                      transaction.status === "PENDING" ? "" : "cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start flex-1">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 mt-1">
                          <i className={getTransactionIcon(transaction.type, transaction.status)}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                          </div>
                          <p className="text-xs text-gray-400 mb-1">
                            {transaction.type === "send"
                              ? `to: ${formatAddress(transaction.toAddress)}`
                              : `from: ${formatAddress(transaction.fromAddress)}`}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.timestamp}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <a
                              href={`https://suiscan.xyz/testnet/tx/${transaction.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {t("transaction_hash")}: {formatAddress(transaction.txHash)}
                            </a>
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`text-lg font-bold ${getAmountColor(transaction.type, transaction.status)}`}>
                          {transaction.type === "send" ? "-" : "+"}
                          {transaction.amount.toFixed(3)} SUI
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ≈ {(transaction.amount * exchangeRate).toLocaleString()} KRW
                        </p>
                      </div>
                    </div>

                    {/* Store용 승인/거절 버튼 (PENDING 상태일 때만) */}
                    {transaction.status === "PENDING" && (
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleStatusUpdate(transaction.id, "APPROVED")}
                            disabled={processingTxId === transaction.id}
                            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            {processingTxId === transaction.id ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-check"></i>
                            )}
                            {t("approve")}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(transaction.id, "REJECTED")}
                            disabled={processingTxId === transaction.id}
                            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            {processingTxId === transaction.id ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-times"></i>
                            )}
                            {t("reject")}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* 로딩 인디케이터 */}
            {isLoadingMore && (
              <div className="flex justify-center py-4 mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {/* 더 이상 불러올 데이터가 없을 때 */}
            {!hasMore && transactions.length > 0 && (
              <div className="text-center py-4 mt-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t("all_transactions_loaded")}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <StoreBottomNavigation visible={true} />
    </div>
  );
}
