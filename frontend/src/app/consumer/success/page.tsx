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
  const [isSavingTransaction, setIsSavingTransaction] = useState<boolean>(false);

  // 결제 플로우 데이터 로드 및 트랜잭션 저장
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    const flowData = getPaymentFlowData();
    if (!flowData.walletAddress || !flowData.amount || !flowData.txHash) {
      // 이전 단계를 거치지 않은 경우 home으로 리다이렉트
      router.push("/consumer/home");
      return;
    }

    setName(flowData.name || "Unknown Store");
    setAmount(flowData.amount);
    setIsLoading(false);

    // 트랜잭션 DB 저장
    saveTransactionToDatabase(flowData);

    // 3초 후 consumer home으로 리다이렉트
    const timer = setTimeout(() => {
      clearPaymentFlowData();
      router.push("/consumer/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, isAuthenticated]);

  const saveTransactionToDatabase = async (flowData: any) => {
    if (!flowData.txHash || !flowData.finalAmount || !flowData.senderWalletAddress || !flowData.walletAddress) {
      console.warn("필수 트랜잭션 정보가 누락되었습니다:", flowData);
      return;
    }

    setIsSavingTransaction(true);

    try {
      const transactionResponse = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: flowData.finalAmount,
          txHash: flowData.txHash,
          fromAddress: flowData.senderWalletAddress,
          toAddress: flowData.walletAddress,
        }),
      });

      if (!transactionResponse.ok) {
        const errorData = await transactionResponse.json();
        
        // 409 (Conflict) 에러는 이미 저장된 트랜잭션이므로 정상적인 상황
        if (transactionResponse.status === 409) {
          console.log("✅ Transaction already exists in database (this is normal if page was refreshed)");
          return;
        }

        console.warn("❌ Transaction DB 저장 실패:", errorData.error);
        // 다른 에러의 경우에만 재시도
        await retryTransactionSave(flowData, 1);
      } else {
        console.log("✅ Transaction successfully saved to database");
      }
    } catch (error) {
      console.warn("❌ Transaction DB 저장 중 오류:", error);
      // 실패 시 재시도 로직
      await retryTransactionSave(flowData, 1);
    } finally {
      setIsSavingTransaction(false);
    }
  };

  const retryTransactionSave = async (flowData: any, retryCount: number) => {
    const maxRetries = 3;

    if (retryCount > maxRetries) {
      console.error("트랜잭션 저장 최대 재시도 횟수 초과");
      return;
    }

    // 지수 백오프: 1초, 2초, 4초 간격으로 재시도
    const delay = Math.pow(2, retryCount - 1) * 1000;

    setTimeout(async () => {
      try {
        const transactionResponse = await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: flowData.finalAmount,
            txHash: flowData.txHash,
            fromAddress: flowData.senderWalletAddress,
            toAddress: flowData.walletAddress,
          }),
        });

        if (!transactionResponse.ok) {
          const errorData = await transactionResponse.json();
          
          // 409 (Conflict) 에러는 이미 저장된 트랜잭션이므로 정상적인 상황
          if (transactionResponse.status === 409) {
            console.log(`✅ Transaction already exists in database (retry ${retryCount})`);
            return;
          }

          console.warn(`❌ Transaction DB 저장 재시도 ${retryCount} 실패:`, errorData.error);
          await retryTransactionSave(flowData, retryCount + 1);
        } else {
          console.log(`✅ Transaction successfully saved to database (retry ${retryCount})`);
        }
      } catch (error) {
        console.warn(`❌ Transaction DB 저장 재시도 ${retryCount} 중 오류:`, error);
        await retryTransactionSave(flowData, retryCount + 1);
      }
    }, delay);
  };

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

  return (
    <div>
      <PaymentSuccess amount={amount} name={name} />
      {/* 트랜잭션 저장 상태 표시 (선택사항) */}
      {isSavingTransaction && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">거래 내역 저장 중...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessPage;
