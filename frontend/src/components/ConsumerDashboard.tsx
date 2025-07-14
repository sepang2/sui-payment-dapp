"use client";

import React, { useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { EXCHANGE_RATE } from "../utils/constants";
import { useTransactions } from "../hooks/useTransactions";
import { useUser } from "../hooks/useUser";
import TransactionList from "./common/TransactionList";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface ConsumerDashboardProps {
  balance: number;
  balanceLoading: boolean;
  onScanQRCode: () => void;
}

const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ balance, balanceLoading, onScanQRCode }) => {
  const account = useCurrentAccount();
  const { user } = useUser();
  const router = useRouter();
  const exchangeRate = EXCHANGE_RATE;
  const displayBalance = balanceLoading ? 0 : balance;
  const { t } = useTranslation();

  // 실제 DB에서 트랜잭션 데이터 가져오기 (최신 3개)
  const {
    transactions: recentTransactions,
    // allTransactions,
    isLoading: transactionsLoading,
    refetch,
  } = useTransactions(account?.address || null, "consumer");

  // SSE 구독 - 트랜잭션 상태 업데이트 실시간 수신
  useEffect(() => {
    if (!account?.address) return;

    const eventSource = new EventSource(
      `/api/transactions/stream?walletAddress=${encodeURIComponent(account.address)}&userType=consumer`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "transaction_status_update") {
        // 트랜잭션 상태가 업데이트되었을 때 목록 새로고침
        refetch();
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
    };

    return () => eventSource.close();
  }, [account?.address, refetch]);

  // // 오늘의 결제 계산 (전체 트랜잭션 기준) - 오히려 노출되면 소비 심리 위축될 수 있음
  // const today = new Date().toISOString().split("T")[0];
  // const todayTransactions = allTransactions.filter((tx) => {
  //   try {
  //     const txDate = tx.rawTimestamp ? tx.rawTimestamp.split("T")[0] : null;
  //     return txDate === today && tx.type === "send";
  //   } catch (error) {
  //     console.warn("Invalid transaction date:", tx.timestamp, error);
  //     return false;
  //   }
  // });
  // const todaySpent = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center p-6 w-full max-w-md">
        {/* 잔액 카드 */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">{t('user_balance', { name: user?.name })}</h2>
          <div className="text-center">
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              {balanceLoading ? t('loading') : `${displayBalance.toFixed(3)} SUI`}
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              ≈ {(displayBalance * exchangeRate).toLocaleString()} KRW
            </p>
          </div>

          {/* 오늘의 결제 요약 */}
          {/* <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">오늘 결제</span>
              <div>
                <p className="text-sm font-semibold text-red-500 dark:text-red-400">-{todaySpent.toFixed(3)} SUI</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ≈ {(todaySpent * exchangeRate).toLocaleString()} KRW
                </p>
              </div>
            </div>
          </div> */}
        </div>

        {/* QR 스캔 버튼 */}
        <div className="w-full mb-6">
          <button
            onClick={onScanQRCode}
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white py-4 px-6 rounded-lg text-lg font-semibold flex items-center justify-center gap-3 transition-colors"
          >
            <i className="fas fa-camera text-xl"></i>
            {t('scan_qr_code')}
          </button>
        </div>

        {/* 최근 결제 내역 */}
        <TransactionList
          transactions={recentTransactions}
          title={t('recent_payments')}
          emptyMessage={transactionsLoading ? t('loading_transactions') : t('no_payment_history')}
          maxItems={3}
          onCardClick={() => router.push("/consumer/transactions")}
        />
      </div>
    </div>
  );
};

export default ConsumerDashboard;
