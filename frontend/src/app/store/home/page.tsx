"use client";

import React from "react";
import { useStoreAuth } from "../../../hooks/useAuth";
import Header from "../../../components/Header";
import StoreBottomNavigation from "../../../components/StoreBottomNavigation";
import StoreDashboard from "../../../components/StoreDashboard";
import QRCodeDisplay from "../../../components/QRCodeDisplay";

export default function StoreHomePage() {
  const { isLoading, user, isAuthenticated, account } = useStoreAuth();
  const [showQRCode, setShowQRCode] = React.useState(false);

  const handleShowQRCode = () => {
    setShowQRCode(true);
  };

  const handleCloseQRCode = () => {
    setShowQRCode(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header walletConnected={isAuthenticated} walletAddress={account?.address} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <StoreBottomNavigation visible={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header walletConnected={isAuthenticated} walletAddress={account?.address} />

      <div className="pb-24">
        <StoreDashboard user={user} onShowQRCode={handleShowQRCode} />
      </div>

      <StoreBottomNavigation visible={true} />

      {/* QR 코드 모달 */}
      {showQRCode && user && <QRCodeDisplay user={user} onClose={handleCloseQRCode} />}
    </div>
  );
}
