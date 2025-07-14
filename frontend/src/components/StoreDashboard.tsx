"use client";

import React, { useEffect } from "react";
import { useTransactions } from "../hooks/useTransactions";
import TransactionList from "./common/TransactionList";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface StoreDashboardProps {
  user: {
    name: string;
    description?: string;
    walletAddress: string;
    uniqueId?: string;
    qrCode?: string;
  } | null;
  onShowQRCode: () => void;
}

const StoreDashboard: React.FC<StoreDashboardProps> = ({ user, onShowQRCode }) => {
  // 실제 DB에서 트랜잭션 데이터 가져오기 (최신 3개)
  const {
    transactions: recentTransactions,
    isLoading: transactionsLoading,
    refetch,
    updateTransactionStatus,
  } = useTransactions(user?.walletAddress || null, "store");
  useEffect(() => {
    if (!user?.walletAddress) return;
    const eventSource = new EventSource(
      `/api/transactions/stream?walletAddress=${encodeURIComponent(user.walletAddress)}&userType=store`
    );
    eventSource.onmessage = (event) => {
      refetch();
    };
    return () => eventSource.close();
  }, [user?.walletAddress, refetch]);
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <div className="flex justify-center">
      <div className="flex flex-col p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">{t('qr_code_modal_title')}</h1>
        {/* QR 코드 카드 */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-1 text-center">{user?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">{user?.description}</p>
          {user?.qrCode ? (
            <div className="text-center">
              <button
                onClick={onShowQRCode}
                className="hover:opacity-80 transition-opacity cursor-pointer p-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 bg-white"
                title={t('view_qr_code')}
              >
                <img src={user.qrCode} alt={t('payment_qr_code')} className="w-36 h-36 mx-auto rounded-md" />
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{t('scan_qr_to_pay')}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-qrcode text-4xl text-gray-400 dark:text-gray-500"></i>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('update_profile_for_qr')}</p>
            </div>
          )}
        </div>

        {/* 최근 거래 내역 */}
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200 pt-4 mb-4">{t('recent_transactions_store')}</h1>
        <TransactionList
          transactions={recentTransactions}
          title=""
          emptyMessage={transactionsLoading ? t('loading_transactions') : t('no_payment_history')}
          maxItems={3}
          onCardClick={() => router.push("/store/transactions")}
          userType="store"
          storeWalletAddress={user?.walletAddress}
          onUpdateTransactionStatus={updateTransactionStatus}
        />
      </div>
    </div>
  );
};

export default StoreDashboard;
