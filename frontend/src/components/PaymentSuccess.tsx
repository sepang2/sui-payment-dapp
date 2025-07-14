"use client";

import React from "react";
import { useTranslation } from "react-i18next";

interface PaymentSuccessProps {
  amount: string;
  name: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ amount, name }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 gap-4">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
        <i className="fas fa-check text-3xl text-green-600 dark:text-green-400"></i>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('payment_complete')}</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {t('payment_success_message', { name, amount })}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('redirecting_to_main')}</p>
    </div>
  );
};

export default PaymentSuccess;
