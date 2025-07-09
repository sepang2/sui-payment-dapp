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
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    transaction.type === "send" ? "bg-red-100 dark:bg-red-900" : "bg-green-100 dark:bg-green-900"
                  }`}
                >
                  <i
                    className={`fas ${
                      transaction.type === "send"
                        ? "fa-arrow-up text-red-600 dark:text-red-400"
                        : "fa-arrow-down text-green-600 dark:text-green-400"
                    }`}
                  ></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.timestamp}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    transaction.type === "send"
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
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
