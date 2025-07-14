"use client";

import React from "react";
import { ConnectButton } from "@mysten/dapp-kit";
import { useTranslation } from "react-i18next";

interface WalletConnectionPromptProps {
  title?: string;
  description?: string;
  icon?: string;
}

const WalletConnectionPrompt: React.FC<WalletConnectionPromptProps> = ({
  title = "SUI 페이에 오신 것을 환영합니다",
  description = "SUI 블록체인을 이용한 간편한 결제 서비스입니다.\n시작하려면 Slush Wallet을 연결해주세요.",
  icon = "fas fa-wallet",
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center justify-center p-6 h-[80vh] w-full max-w-md">
        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-6">
          <i className={`${icon} text-4xl text-indigo-600 dark:text-indigo-400`}></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 p-4">{t('welcome_to_sui_pay')}</h2>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8 whitespace-pre-line">{t('sui_payment_description')}</p>
        <div className="connect-wallet-main p-6">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
};

export default WalletConnectionPrompt;
