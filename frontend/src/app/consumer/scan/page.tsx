"use client";

import React from "react";
import { useRouter } from "next/navigation";
import QRScanner from "@/components/QRScanner";
import { savePaymentFlowData } from "@/utils/paymentFlow";
import { useConsumerAuth } from "@/hooks/useAuth";

const ScanPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useConsumerAuth();

  // 권한 확인
  if (!isAuthenticated) {
    router.push("/");
    return null;
  }

  const handleScanSuccess = (result: string) => {
    try {
      const qrData = JSON.parse(result);

      if (qrData.walletAddress) {
        // 결제 플로우 데이터 저장
        savePaymentFlowData({
          name: qrData.name || "Unknown Store",
          walletAddress: qrData.walletAddress,
          amount: "0",
          step: "amount",
        });

        // 금액 입력 페이지로 이동
        router.push("/consumer/amount");
      } else {
        console.error("Invalid QR code data");
        handleCancel();
      }
    } catch (error) {
      console.error("QR scan result parsing failed:", error);
      handleCancel();
    }
  };

  const handleCancel = () => {
    router.push("/consumer/home");
  };

  return <QRScanner onScanSuccess={handleScanSuccess} onCancel={handleCancel} />;
};

export default ScanPage;
