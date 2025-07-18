"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import PaymentConfirmation from "@/components/PaymentConfirmation";
import { useBalance } from "@/hooks/useBalance";
import { usePayment, PaymentRequest } from "@/hooks/usePayment";
import { getPaymentFlowData, savePaymentFlowData, clearPaymentFlowData } from "@/utils/paymentFlow";
import { useConsumerAuth } from "@/hooks/useAuth";
import { DISCOUNT_RATE } from "@/utils/constants";
import { useTranslation } from "react-i18next";

const ConfirmPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const account = useCurrentAccount();
  const { isAuthenticated } = useConsumerAuth();
  const { balance, isPending: balanceLoading, refetch: refetchBalance } = useBalance();
  const { processPayment, isProcessing } = usePayment();
  const [amount, setAmount] = useState<string>("0");
  const [name, setName] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 결제 플로우 데이터 로드
  useEffect(() => {
    if (!isAuthenticated || !account) {
      router.push("/");
      return;
    }

    const flowData = getPaymentFlowData();
    if (!flowData.walletAddress || !flowData.amount) {
      // 이전 단계를 거치지 않은 경우 scan 페이지로 리다이렉트
      router.push("/consumer/scan");
      return;
    }

    setName(flowData.name || "Unknown Store");
    setAmount(flowData.amount);
    setWalletAddress(flowData.walletAddress);
    setIsLoading(false);
  }, [router, isAuthenticated, account]);

  const handleConfirm = async () => {
    if (!account || !walletAddress) return;

    const numericAmount = parseFloat(amount);
    const discountAmount = numericAmount * DISCOUNT_RATE;
    const finalAmount = numericAmount - discountAmount;

    const paymentRequest: PaymentRequest = {
      walletAddress,
      amount: finalAmount,
      name,
      discountAmount,
    };

    try {
      // 결제 처리 및 트랜잭션 해시 받기
      const txHash = await processPayment(paymentRequest);

      // 트랜잭션 정보를 paymentFlowData에 저장
      savePaymentFlowData({
        step: "success",
        txHash,
        finalAmount,
        senderWalletAddress: account.address,
      });

      router.push("/consumer/success");

      // 잔고 새로고침
      refetchBalance();
    } catch (error) {
      console.error("Payment failed:", error);
      // 에러 처리 로직 추가 가능
    }
  };

  const handleCancel = () => {
    // 결제 플로우 데이터 정리
    clearPaymentFlowData();
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
    <PaymentConfirmation
      amount={amount}
      name={name}
      balance={displayBalance}
      senderWalletAddress={account?.address || ""}
      receiverWalletAddress={walletAddress}
      isProcessing={isProcessing}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
};

export default ConfirmPage;
