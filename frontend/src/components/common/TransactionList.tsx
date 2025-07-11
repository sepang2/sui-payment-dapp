"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { EXCHANGE_RATE } from "../../utils/constants";

interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: number;
  description: string;
  timestamp: string;
  rawTimestamp: string; // ISO 날짜 형식으로 날짜 비교용
  fromAddress?: string;
  toAddress?: string;
  status: "PENDING" | "APPROVED" | "REJECTED"; // 거래 상태
}

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  emptyMessage?: string;
  maxItems?: number;
  onCardClick?: () => void; // 카드 클릭 시 실행할 콜백 (선택)
  userType?: "consumer" | "store"; // 사용자 타입
  storeWalletAddress?: string; // 상점 지갑 주소 (상태 업데이트용)
  onUpdateTransactionStatus?: (
    transactionId: string,
    status: "APPROVED" | "REJECTED",
    storeWalletAddress: string
  ) => Promise<boolean>;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  title = "최근 거래 내역",
  emptyMessage = "아직 거래 내역이 없습니다",
  maxItems = 5,
  onCardClick,
  userType = "consumer",
  storeWalletAddress,
  onUpdateTransactionStatus,
}) => {
  const exchangeRate = EXCHANGE_RATE;
  const displayTransactions = transactions.slice(0, maxItems);
  const [processingTxId, setProcessingTxId] = useState<string | null>(null);

  const getTransactionIcon = (type: string, status: string) => {
    if (status === "PENDING") return "fas fa-clock text-yellow-500";
    if (status === "APPROVED") {
      return type === "send" ? "fas fa-arrow-up text-red-500" : "fas fa-arrow-down text-green-500";
    }
    if (status === "REJECTED") return "fas fa-times text-red-500";
    return "fas fa-question text-gray-500";
  };

  const getAmountColor = (type: string, status: string) => {
    if (status === "PENDING") return "text-yellow-500 dark:text-yellow-400";
    if (status === "REJECTED") return "text-gray-500 dark:text-gray-400";
    return type === "send" ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400";
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "보류";
      case "APPROVED":
        return "승인";
      case "REJECTED":
        return "거절";
      default:
        return "알 수 없음";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900";
      case "APPROVED":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900";
      case "REJECTED":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900";
    }
  };

  const formatAddress = (address: string | undefined) => {
    if (!address) return "Unknown Address";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleStatusUpdate = async (transactionId: string, status: "APPROVED" | "REJECTED") => {
    if (!onUpdateTransactionStatus || !storeWalletAddress) return;

    setProcessingTxId(transactionId);
    try {
      const success = await onUpdateTransactionStatus(transactionId, status, storeWalletAddress);
      if (!success) {
        alert("거래 상태 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating transaction status:", error);
      alert("거래 상태 업데이트 중 오류가 발생했습니다.");
    } finally {
      setProcessingTxId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="w-full">
        {title && <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">{title}</h3>}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
          <i className="fas fa-receipt text-3xl text-gray-400 dark:text-gray-500 mb-3"></i>
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 my-4">{title}</h3>}
      <motion.ul
        className="space-y-3"
        variants={listVariants}
        initial="hidden"
        animate="visible"
        key={transactions.length} // 데이터 변경 시 애니메이션 재실행
      >
        {displayTransactions.map((transaction) => (
          <motion.li
            key={transaction.id}
            variants={itemVariants}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition ${
              transaction.status === "PENDING" ? "" : "cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700"
            }`}
            onClick={transaction.status === "PENDING" ? undefined : onCardClick}
            layout // 위치 변경 시 애니메이션
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start flex-1">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 mt-1">
                  <i className={getTransactionIcon(transaction.type, transaction.status)}></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}
                    >
                      {getStatusText(transaction.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">
                    {transaction.type === "send"
                      ? `to: ${formatAddress(transaction.toAddress)}`
                      : `from: ${formatAddress(transaction.fromAddress)}`}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.timestamp}</p>
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
            {transaction.status === "PENDING" &&
              userType === "store" &&
              onUpdateTransactionStatus &&
              storeWalletAddress && (
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
                      승인
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
                      거절
                    </button>
                  </div>
                </div>
              )}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
};

export default TransactionList;
