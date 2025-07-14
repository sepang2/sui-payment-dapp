"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AmountInput from "@/components/AmountInput";
import { useBalance } from "@/hooks/useBalance";
import { getPaymentFlowData, savePaymentFlowData } from "@/utils/paymentFlow";
import { useConsumerAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

const AmountPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useConsumerAuth();
  const { balance, isPending: balanceLoading } = useBalance();
  const [amount, setAmount] = useState<string>("0");
  const [name, setName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 결제 플로우 데이터 로드
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    const flowData = getPaymentFlowData();
    if (!flowData.walletAddress) {
      // 이전 단계를 거치지 않은 경우 scan 페이지로 리다이렉트
      router.push("/consumer/scan");
      return;
    }

    setName(flowData.name || "Unknown Store");
    setAmount("0");
    setIsLoading(false);
  }, [router, isAuthenticated]);

  const handleKeypadPress = (key: string) => {
    if (key === "backspace") {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else if (key === ".") {
      setAmount((prev) => {
        // 이미 소수점이 있으면 추가하지 않음
        if (prev.includes(".")) return prev;
        // "0"이면 "0."으로 시작
        if (prev === "0") return "0.";
        return prev + ".";
      });
    } else {
      setAmount((prev) => {
        // "0"인 경우에만 숫자로 교체 (소수점이 있는 경우는 제외)
        if (prev === "0") return key;
        return prev + key;
      });
    }
  };

  const handleProceed = () => {
    // 결제 플로우 데이터 업데이트
    savePaymentFlowData({
      amount,
      step: "confirm",
    });

    // 결제 확인 페이지로 이동
    router.push("/consumer/confirm");
  };

  const handleCancel = () => {
    router.push("/consumer/home");
  };

  const displayBalance = balanceLoading ? 0 : balance;

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <AmountInput
      amount={amount}
      name={name}
      balance={displayBalance}
      onKeypadPress={handleKeypadPress}
      onProceed={handleProceed}
      onCancel={handleCancel}
    />
  );
};

export default AmountPage;
