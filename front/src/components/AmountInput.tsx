import React from "react";
import Keypad from "./Keypad";

interface AmountInputProps {
  amount: string;
  merchantName: string;
  balance: number;
  onKeypadPress: (key: string) => void;
  onCancel: () => void;
  onProceed: () => void;
}

const AmountInput: React.FC<AmountInputProps> = ({
  amount,
  merchantName,
  balance,
  onKeypadPress,
  onCancel,
  onProceed,
}) => {
  // 원본 amount 문자열을 그대로 사용하여 소수점 입력 과정을 정확히 표시
  const coinAmount = amount === "0" ? "0" : amount;
  const availableCoin = balance.toLocaleString();

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* 중앙 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* 카드 아이콘 */}
        <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-8">
          <i className="fas fa-credit-card text-white text-2xl"></i>
        </div>

        {/* 메시지 */}
        <div className="text-center mb-8 p-4">
          <h1 className="text-xl font-medium text-gray-800 mb-2">
            {merchantName}에서
          </h1>
          <h2 className="text-xl font-medium text-gray-800">
            얼마를 결제할까요?
          </h2>
        </div>

        {/* 금액 표시 */}
        <div className="text-center mb-4">
          <p className="text-5xl font-bold text-gray-900 mb-2 pb-2">
            {coinAmount} SUI
          </p>
          <p className="text-gray-500">지갑 잔고 {availableCoin} SUI</p>
          {parseFloat(amount) > balance && (
            <p className="text-red-500 text-sm mt-2 pt-1">잔고가 부족합니다</p>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 pb-2 w-full flex flex-row gap-2">
        <button
          onClick={onCancel}
          className="bg-gray-400 hover:bg-gray-500 text-white py-4 rounded-lg font-semibold text-lg transition-colors w-full"
        >
          취소
        </button>
        <button
          onClick={onProceed}
          disabled={parseFloat(amount) <= 0 || parseFloat(amount) > balance}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-4 rounded-lg font-semibold text-lg transition-colors w-full"
        >
          다음
        </button>
      </div>

      {/* 키패드 */}
      <div className="px-6 pb-6">
        <Keypad onKeyPress={onKeypadPress} />
      </div>
    </div>
  );
};

export default AmountInput;
