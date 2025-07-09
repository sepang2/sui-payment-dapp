"use client";

import React from "react";
import { EXCHANGE_RATE } from "../../utils/constants";

interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: number;
  description: string;
  timestamp: string;
  fromAddress?: string;
  toAddress?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  emptyMessage?: string;
  maxItems?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  title = "최근 거래 내역",
  emptyMessage = "아직 거래 내역이 없습니다",
  maxItems = 5,
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

  if (transactions.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{title}</h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
          <i className="fas fa-receipt text-3xl text-gray-400 dark:text-gray-500 mb-3"></i>
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{title}</h3>
      <div className="space-y-3">
        {displayTransactions.map((transaction) => (
          <div key={transaction.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                  <i className={getTransactionIcon(transaction.type)}></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
