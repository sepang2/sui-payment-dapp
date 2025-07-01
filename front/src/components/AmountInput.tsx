import React from "react";
import Keypad from "./Keypad";

interface AmountInputProps {
  amount: string;
  merchantName: string;
  onKeypadPress: (key: string) => void;
  onCancel: () => void;
  onProceed: () => void;
}

const AmountInput: React.FC<AmountInputProps> = ({
  amount,
  merchantName,
  onKeypadPress,
  onCancel,
  onProceed,
}) => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">결제 금액 입력</h2>
          <p className="text-sm text-gray-500">{merchantName}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <p className="text-sm text-gray-500 mb-1">결제 금액</p>
          <p className="text-4xl font-bold text-indigo-600">{amount} SUI</p>
          <p className="text-sm text-gray-500 mt-1">
            ≈ ${(parseFloat(amount) * 3500).toFixed(2)} KRW
          </p>
        </div>
        <Keypad onKeyPress={onKeypadPress} />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-button font-semibold cursor-pointer whitespace-nowrap"
          >
            취소
          </button>
          <button
            onClick={onProceed}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-button font-semibold cursor-pointer whitespace-nowrap"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmountInput;
