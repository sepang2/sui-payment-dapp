"use client";

import React from "react";
import { useRouter } from "next/navigation";
import QRScanner from "@/components/QRScanner";
import { savePaymentFlowData } from "@/utils/paymentFlow";
import { useConsumerAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

const ScanPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useConsumerAuth();

  // 권한 확인
  if (!isAuthenticated) {
    router.push("/");
    return null;
  }

  const handleScanSuccess = async (result: string) => {
    try {
      // QR 코드에서 uniqueId 추출 (더 이상 JSON 파싱하지 않음)
      const uniqueId = result.trim();

      if (uniqueId) {
        // uniqueId로 Store 정보 조회
        const response = await fetch(`/api/stores/${uniqueId}`);

        if (!response.ok) {
          throw new Error("Store not found");
        }

        const { store } = await response.json();

        if (store) {
          // 결제 플로우 데이터 저장
          savePaymentFlowData({
            name: store.name,
            walletAddress: store.walletAddress,
            amount: "0",
            step: "amount",
          });

          // 금액 입력 페이지로 이동
          router.push("/consumer/amount");
        } else {
          console.error("Store data not found");
          handleCancel();
        }
      } else {
        console.error("Invalid QR code data");
        handleCancel();
      }
    } catch (error) {
      console.error(t("qr_scan_failed"), error);
      handleCancel();
    }
  };

  const handleCancel = () => {
    router.push("/consumer/home");
  };

  return <QRScanner onScanSuccess={handleScanSuccess} onCancel={handleCancel} />;
};

export default ScanPage;
