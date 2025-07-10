"use client";

import React from "react";
import { DISCOUNT_RATE, EXCHANGE_RATE } from "../utils/constants";

interface PaymentConfirmationProps {
  amount: string;
  name: string;
  balance: number;
  senderWalletAddress: string;
  receiverWalletAddress: string;
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  amount,
  name,
  balance,
  senderWalletAddress,
  receiverWalletAddress,
  isProcessing,
  onCancel,
  onConfirm,
}) => {
  const originalAmount = parseFloat(amount);
  const discountAmount = originalAmount * DISCOUNT_RATE;
  const finalAmount = originalAmount - discountAmount;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col">
      {/* 상단 콘텐츠 */}
      <div className="flex-1 px-4 pt-6">
        {/* 상점명과 금액 */}
        <div className="text-center mb-6">
          <h1 className="text-lg font-medium text-gray-800 dark:text-white mb-3">{name}에서</h1>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{originalAmount.toFixed(3)} SUI</p>
          <p className="text-lg text-gray-800 dark:text-white">결제할까요?</p>
        </div>

        {/* 결제 내역 */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <p className="text-gray-700 dark:text-gray-300">정상가</p>
              <p className="text-gray-900 dark:text-white">{originalAmount.toFixed(3)} SUI</p>
            </div>
            <div className="flex justify-between text-indigo-600 dark:text-indigo-400 py-2">
              <p>할인 ({DISCOUNT_RATE * 100}%)</p>
              <p>-{discountAmount.toFixed(3)} SUI</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 my-2 pb-2"></div>
            <div className="flex justify-between">
              <p className="text-base font-bold text-gray-900 dark:text-white">총 결제 금액</p>
              <div className="flex flex-col items-end">
                <p className="text-base font-bold text-gray-900 dark:text-white">{finalAmount.toFixed(3)} SUI</p>
                <p className="text-gray-900 dark:text-white text-sm">
                  ≈ {(finalAmount * EXCHANGE_RATE).toLocaleString()} 원
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 정보 섹션 */}
      <div className="px-4 pb-4">
        <div className="flex flex-col">
          {/* 보안 텍스트 */}
          <div className="text-center mb-4 py-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">보유하신 코인으로 결제할게요</p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-600 my-2 pb-2"></div>
          {/* 지갑 정보 */}
          <div className="space-y-2">
            <div className="flex justify-between py-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">보유 코인</p>
              <p className="text-sm text-gray-900 dark:text-white">{balance.toLocaleString()} SUI</p>
            </div>
            <div className="flex justify-between py-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">결제 지갑</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {senderWalletAddress ? `${senderWalletAddress.slice(0, 6)}...${senderWalletAddress.slice(-4)}` : "N/A"}
              </p>
            </div>
            <div className="flex justify-between py-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">받는 지갑</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {receiverWalletAddress
                  ? `${receiverWalletAddress.slice(0, 6)}...${receiverWalletAddress.slice(-4)}`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼들 */}
      <div className="px-4 pb-6 pt-2">
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 max-w-1/3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300 py-3 rounded-lg font-semibold text-base transition-colors"
          >
            그만할래요
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white py-3 rounded-lg font-semibold text-base transition-colors disabled:opacity-50"
          >
            {isProcessing ? "처리 중..." : "결제할래요"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
