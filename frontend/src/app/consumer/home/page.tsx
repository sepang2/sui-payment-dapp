"use client";

import React from "react";
import { useConsumerAuth } from "../../../hooks/useAuth";
import { useBalance } from "../../../hooks/useBalance";
import Header from "../../../components/Header";
import ConsumerBottomNavigation from "../../../components/ConsumerBottomNavigation";
import ConsumerDashboard from "../../../components/ConsumerDashboard";
import QRScanner from "../../../components/QRScanner";

export default function ConsumerHomePage() {
  const { isLoading, isAuthenticated, account } = useConsumerAuth();
  const { balance, isPending: balanceLoading } = useBalance();
  const [showQRScanner, setShowQRScanner] = React.useState(false);

  const handleScanQRCode = () => {
    setShowQRScanner(true);
  };

  const handleCloseScanQRCode = () => {
    setShowQRScanner(false);
  };

  const handleQRScanSuccess = (data: string) => {
    console.log("QR scan success:", data);
    // TODO: 결제 처리 로직 구현
    setShowQRScanner(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <Header walletConnected={isAuthenticated} walletAddress={account?.address} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <ConsumerBottomNavigation visible={true} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <Header walletConnected={isAuthenticated} walletAddress={account?.address} />

      <div className="pb-24">
        <ConsumerDashboard balance={balance} balanceLoading={balanceLoading} onScanQRCode={handleScanQRCode} />
      </div>

      <ConsumerBottomNavigation visible={true} />

      {/* QR 스캐너 모달 */}
      {showQRScanner && <QRScanner onScanSuccess={handleQRScanSuccess} onCancel={handleCloseScanQRCode} />}
    </div>
  );
}
