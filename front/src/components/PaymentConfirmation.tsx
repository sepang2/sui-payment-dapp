import React from "react";

interface PaymentConfirmationProps {
  amount: string;
  merchantName: string;
  balance: number;
  walletAddress?: string;
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  amount,
  merchantName,
  balance,
  walletAddress,
  isProcessing,
  onCancel,
  onConfirm,
}) => {
  const originalAmount = parseFloat(amount);
  const discount = originalAmount * 0.05; // 5% 할인 가정
  const finalAmount = originalAmount - discount;

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* 중앙 콘텐츠 */}
      <div className="flex-1 flex flex-col justify-center px-6">
        {/* 상점명과 금액 */}
        <div className="text-center mb-8 p-4">
          <h1 className="text-xl font-medium text-gray-800 mb-4">
            {merchantName}에서
          </h1>
          <p className="text-4xl font-bold text-gray-900 mb-2 p-2">
            {originalAmount.toFixed(3)} SUI
          </p>
          <p className="text-xl text-gray-800">결제할까요?</p>
        </div>

        {/* 결제 내역 */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <p className="text-gray-700">정상가</p>
              <p className="text-gray-900">{originalAmount.toFixed(3)} SUI</p>
            </div>
            <div className="flex justify-between text-indigo-600 py-4">
              <p>할인 (5%)</p>
              <p>-{discount.toFixed(3)} SUI</p>
            </div>
            <div className="border-t border-gray-200 my-3 pb-4"></div>
            <div className="flex justify-between">
              <p className="text-lg font-bold text-gray-900">총 결제 금액</p>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {finalAmount.toFixed(3)} SUI
                </p>
                <p className="text-gray-900 text-sm">
                  ≈ {(balance * 3500).toLocaleString()} 원
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 보안 텍스트 */}
        <div className="text-center mb-6 p-4">
          <p className="text-sm text-gray-500">보유하신 코인으로 결제할게요</p>
        </div>
        <div className="border-t border-gray-200 my-3 pb-4"></div>
        {/* 지갑 정보 */}
        <div className="space-y-2 mb-8">
          <div className="flex justify-between">
            <p className="text-gray-700">보유 코인</p>
            <p className="text-gray-900">{balance.toLocaleString()} SUI</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-700">출금 지갑</p>
            <p className="text-gray-900">
              {walletAddress
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* 하단 버튼들 */}
      <div className="px-6 pb-6">
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 max-w-1/3 bg-gray-300 hover:bg-gray-400 text-gray-700 py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            그만할래요
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50"
          >
            {isProcessing ? "처리 중..." : "결제할래요"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
