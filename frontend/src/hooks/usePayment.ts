"use client";

import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { createSuiTransferTransaction } from "../utils/transaction";

export interface PaymentRequest {
  walletAddress: string;
  amount: number;
  name?: string;
  discountAmount?: number;
}

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransactionDigest, setLastTransactionDigest] = useState<string>("");
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const processPayment = async (paymentRequest: PaymentRequest) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // PaymentApp에서 이미 할인이 적용된 최종 금액을 받으므로 그대로 사용
      const finalAmount = paymentRequest.amount;

      // 유효성 검사: 금액이 양수인지 확인
      if (finalAmount <= 0) {
        throw new Error(`Invalid payment amount: ${finalAmount}. Amount must be greater than 0.`);
      }

      const transaction = createSuiTransferTransaction(paymentRequest.walletAddress, finalAmount);

      await new Promise<void>((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction,
            chain: "sui:testnet",
          },
          {
            onSuccess: (result) => {
              setLastTransactionDigest(result.digest);
              resolve();
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
    lastTransactionDigest,
  };
}
