import React from "react";

interface PaymentConfirmationProps {
  amount: string;
  merchantName: string;
  balance: number;
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  amount,
  merchantName,
  balance,
  isProcessing,
  onCancel,
  onConfirm,
}) => {
  const originalAmount = parseFloat(amount);
  const discount = originalAmount * 0.05; // 5% 할인 가정
  const finalAmount = originalAmount - discount;

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="p-6 flex-1">
        <h2 className="text-xl font-bold text-gray-800 mb-6">결제 확인</h2>
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-lg font-bold">{merchantName}</p>
          </div>
          <div className="border-t border-gray-200 my-3"></div>
          <div className="flex justify-between mb-2">
            <p className="text-gray-600">원래 금액</p>
            <p className="font-medium">{originalAmount.toFixed(3)} SUI</p>
          </div>
          <div className="flex justify-between mb-2 text-green-600">
            <p>할인 (5%)</p>
            <p>-{discount.toFixed(3)} SUI</p>
          </div>
          <div className="border-t border-gray-200 my-3"></div>
          <div className="flex justify-between">
            <p className="text-lg font-bold">최종 결제 금액</p>
            <p className="text-lg font-bold text-indigo-600">
              {finalAmount.toFixed(3)} SUI
            </p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
              <i className="fas fa-wallet text-indigo-600"></i>
            </div>
            <div>
              <p className="font-medium">Connected Wallet</p>
              <p className="text-sm text-gray-500">
                잔액: {balance.toFixed(3)} SUI
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-button font-semibold cursor-pointer whitespace-nowrap"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-button font-semibold cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            {isProcessing ? "처리 중..." : "결제할래요"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
