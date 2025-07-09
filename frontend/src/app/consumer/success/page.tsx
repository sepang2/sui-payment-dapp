"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PaymentSuccess from "@/components/PaymentSuccess";
import { getPaymentFlowData, clearPaymentFlowData } from "@/utils/paymentFlow";
import { useConsumerAuth } from "@/hooks/useAuth";

const SuccessPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useConsumerAuth();
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
    if (!flowData.walletAddress || !flowData.amount) {
      // 이전 단계를 거치지 않은 경우 home으로 리다이렉트
      router.push("/consumer/home");
      return;
    }

    setName(flowData.name || "Unknown Store");
    setAmount(flowData.amount);
    setIsLoading(false);

    // 3초 후 consumer home으로 리다이렉트
    const timer = setTimeout(() => {
      clearPaymentFlowData();
      router.push("/consumer/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, isAuthenticated]);

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return <PaymentSuccess amount={amount} name={name} />;
};

export default SuccessPage;
