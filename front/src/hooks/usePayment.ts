import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { createSuiTransferTransaction } from "../utils/transaction";

export interface PaymentRequest {
  merchantAddress: string;
  amount: number;
  merchantName?: string;
  discount?: number;
}

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransactionDigest, setLastTransactionDigest] =
    useState<string>("");
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const processPayment = async (paymentRequest: PaymentRequest) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const finalAmount = paymentRequest.discount
        ? paymentRequest.amount - paymentRequest.discount
        : paymentRequest.amount;

      const transaction = createSuiTransferTransaction(
        paymentRequest.merchantAddress,
        finalAmount,
      );

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
          },
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
