"use client";

import React from "react";
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
}

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  emptyMessage?: string;
  maxItems?: number;
  onCardClick?: () => void; // 카드 클릭 시 실행할 콜백 (선택)
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
}) => {
  const exchangeRate = EXCHANGE_RATE;
  const displayTransactions = transactions.slice(0, maxItems);

  const getTransactionIcon = (type: string) => {
    if (type === "send") return "fas fa-arrow-up text-red-500";
    return "fas fa-arrow-down text-green-500";
  };

  const getAmountColor = (type: string) => {
    return type === "send" ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400";
  };

  const formatAddress = (address: string | undefined) => {
    if (!address) return "Unknown Address";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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
      {title && <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">{title}</h3>}
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
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 transition`}
            onClick={onCardClick}
            layout // 위치 변경 시 애니메이션
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                  <i className={getTransactionIcon(transaction.type)}></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {transaction.type === "send"
                      ? `to: ${formatAddress(transaction.toAddress)}`
                      : `from: ${formatAddress(transaction.fromAddress)}`}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.timestamp}</p>
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
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
};

export default TransactionList;
