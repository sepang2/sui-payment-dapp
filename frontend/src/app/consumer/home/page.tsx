"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useConsumerAuth } from "../../../hooks/useAuth";
import { useBalance } from "../../../hooks/useBalance";
import Header from "../../../components/Header";
import ConsumerBottomNavigation from "../../../components/ConsumerBottomNavigation";
import ConsumerDashboard from "../../../components/ConsumerDashboard";
import QRScanner from "../../../components/QRScanner";

export default function ConsumerHomePage() {
  const router = useRouter();
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

    try {
      // QR 스캔 결과를 파싱하여 localStorage에 저장
      let scanResult;
      try {
        scanResult = JSON.parse(data);
      } catch {
        // JSON 파싱 실패 시 단순 지갑 주소로 처리
        if (data.startsWith("0x") && data.length >= 42) {
          scanResult = {
            walletAddress: data,
            name: "Unknown User",
          };
        } else {
          scanResult = {
            walletAddress: data,
            name: "Unknown User",
          };
        }
      }

      // 스캔 결과를 localStorage에 저장
      localStorage.setItem("qr-scan-result", JSON.stringify(scanResult));

      // 결제 플로우 진행 상태를 localStorage에 저장
      localStorage.setItem("payment-flow-active", "true");

      // 메인 페이지로 리다이렉트하여 PaymentApp의 결제 플로우 사용
      router.push("/");
    } catch (error) {
      console.error("QR 스캔 결과 처리 실패:", error);
      setShowQRScanner(false);
    }
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
