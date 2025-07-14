"use client";

import React from "react";
import Keypad from "./Keypad";
import { useTranslation } from "react-i18next";

interface AmountInputProps {
  amount: string;
  name: string;
  balance: number;
  onKeypadPress: (key: string) => void;
  onCancel: () => void;
  onProceed: () => void;
}

const AmountInput: React.FC<AmountInputProps> = ({ amount, name, balance, onKeypadPress, onCancel, onProceed }) => {
  const { t } = useTranslation();
  // 원본 amount 문자열을 그대로 사용하여 소수점 입력 과정을 정확히 표시
  const coinAmount = amount === "0" ? "0" : amount;
  const availableCoin = balance.toLocaleString();

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col">
      {/* 상단 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center px-4 pt-8">
        {/* 카드 아이콘 */}
        <div className="w-12 h-12 bg-indigo-600 dark:bg-indigo-700 rounded-lg flex items-center justify-center mb-4">
          <i className="fas fa-credit-card text-white text-lg"></i>
        </div>

        {/* 메시지 */}
        <div className="text-center mb-6">
          <h1 className="text-lg font-medium text-gray-800 dark:text-white mb-1">{t('from_store', { name })}</h1>
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">{t('how_much_to_pay')}</h2>
        </div>

        {/* 금액 표시 */}
        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{coinAmount} SUI</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('wallet_balance', { balance: availableCoin })}</p>
          {parseFloat(amount) > balance && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-2">{t('insufficient_balance')}</p>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-4 pb-2 w-full flex flex-row gap-2">
        <button
          onClick={onCancel}
          className="bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700 text-white py-3 rounded-lg font-semibold text-base transition-colors w-full"
        >
          {t('cancel')}
        </button>
        <button
          onClick={onProceed}
          disabled={parseFloat(amount) <= 0 || parseFloat(amount) > balance}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold text-base transition-colors w-full"
        >
          {t("next")}
        </button>
      </div>

      {/* 키패드 */}
      <div className="px-4 pb-4">
        <Keypad onKeyPress={onKeypadPress} />
      </div>
    </div>
  );
};

export default AmountInput;
