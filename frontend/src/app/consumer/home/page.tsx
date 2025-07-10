"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useConsumerAuth } from "../../../hooks/useAuth";
import { useBalance } from "../../../hooks/useBalance";
import Header from "../../../components/Header";
import ConsumerBottomNavigation from "../../../components/ConsumerBottomNavigation";
import ConsumerDashboard from "../../../components/ConsumerDashboard";

export default function ConsumerHomePage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, account } = useConsumerAuth();
  const { balance, isPending: balanceLoading } = useBalance();

  const handleScanQRCode = () => {
    // 새로운 결제 플로우의 스캔 페이지로 이동
    router.push("/consumer/scan");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header walletConnected={isAuthenticated} walletAddress={account?.address} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <ConsumerBottomNavigation visible={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header walletConnected={isAuthenticated} walletAddress={account?.address} />

      <div className="pb-24">
        <ConsumerDashboard balance={balance} balanceLoading={balanceLoading} onScanQRCode={handleScanQRCode} />
      </div>

      <ConsumerBottomNavigation visible={true} />
    </div>
  );
}
