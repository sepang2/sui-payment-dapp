"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface QRCodeDisplayProps {
  user: {
    name: string;
    description?: string;
    walletAddress: string;
    uniqueId?: string;
    qrCode?: string;
  };
  onClose: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ user, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2초 후 복사 상태 초기화
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('my_qr_code')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* QR 코드 영역 */}
        <div className="p-6 text-center">
          {user.qrCode ? (
            <div className="space-y-4">
              {/* QR 코드 이미지 */}
              <div className="bg-white p-4 rounded-lg mx-auto inline-block">
                <img src={user.qrCode} alt="QR Code" className="w-64 h-64 mx-auto" />
              </div>

              {/* 사용자 정보 */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{user.name}</h3>
                {user.description && <p className="text-sm text-gray-600 dark:text-gray-400">{user.description}</p>}
                <div className="relative">
                  <button
                    onClick={copyToClipboard}
                    className="text-xs text-gray-500 dark:text-gray-500 font-mono break-all bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded w-full transition-colors cursor-pointer flex items-center justify-between"
                    title="클릭하여 복사"
                  >
                    <span className="flex-1">{user.walletAddress}</span>
                    <i className="fas fa-copy ml-2 text-gray-400"></i>
                  </button>
                  {copied && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg">
                      복사됨!
                    </div>
                  )}
                </div>
              </div>

              {/* 안내 메시지 */}
              <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">{t('scan_qr_to_pay')}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto">
                <div className="text-center">
                  <i className="fas fa-qrcode text-4xl text-gray-400 dark:text-gray-500 mb-2"></i>
                  <p className="text-gray-500 dark:text-gray-400">{t('no_qr_code')}</p>
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {t('update_profile_for_qr')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
