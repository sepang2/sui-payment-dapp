"use client";

import React, { useState } from "react";
import { ConnectButton } from "@mysten/dapp-kit";
import { useDarkMode } from "../contexts/DarkModeContext";

interface HeaderProps {
  walletConnected: boolean;
  walletAddress?: string;
}

const Header: React.FC<HeaderProps> = ({ walletConnected, walletAddress }) => {
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleWalletClick = () => {
    setShowDisconnect(!showDisconnect);
  };

  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 드롭다운이 닫히지 않도록 이벤트 전파 중단

    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopySuccess(true);

      // 2초 후 복사 성공 상태 초기화
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      console.error("주소 복사 실패:", error);
      // fallback: 텍스트 선택 방식
      const textArea = document.createElement("textarea");
      textArea.value = walletAddress;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
  };

  const handleDisconnect = () => {
    try {
      // localStorage에서 SUI 지갑 관련 정보를 정리
      const keysToRemove = [
        "sui-dapp-kit:wallet-connection-info",
        "sui-dapp-kit:last-wallet",
        "walletconnect",
        "sui_wallet",
        "sui-wallet-adapter",
        "wallet-standard:app",
        "wallet-standard:wallet",
      ];

      // 모든 관련 localStorage 키 제거
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      // sessionStorage도 정리
      sessionStorage.clear();

      // 드롭다운 닫기
      setShowDisconnect(false);

      // 메인 페이지로 리다이렉트
      window.location.href = "/";
    } catch (error) {
      console.error("Error during disconnect:", error);
      // 에러 발생시에도 메인 페이지로 fallback
      window.location.href = "/";
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex justify-center">
        <div className="w-full max-w-md px-2 py-3 flex justify-between items-center relative">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white pl-2">DSRV x Sui</h1>
          </div>
          <div className="flex items-center space-x-3">
            {/* 다크모드 토글 버튼 */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              {isDarkMode ? (
                <i className="fas fa-sun text-yellow-500"></i>
              ) : (
                <i className="fas fa-moon text-gray-600 dark:text-gray-400"></i>
              )}
            </button>
            {!walletConnected ? (
              <div className="connect-wallet-container">
                <ConnectButton />
              </div>
            ) : (
              <div className="relative">
                <div
                  className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1 transition-colors"
                  onClick={handleWalletClick}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 pl-2">
                    {formatWalletAddress(walletAddress || "")}
                  </p>
                  <i className="fas fa-chevron-down text-xs text-gray-400 dark:text-gray-300 ml-2 pl-1"></i>
                </div>

                {showDisconnect && (
                  <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg min-w-[200px] z-50">
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-600">
                        <div className="font-medium mb-2">연결된 지갑</div>
                        <div className="flex items-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mr-2 pr-1">
                            {formatWalletAddress(walletAddress || "")}
                          </div>
                          <button
                            onClick={handleCopyAddress}
                            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                              copySuccess
                                ? "text-green-600 dark:text-green-400"
                                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            }`}
                            title={copySuccess ? "복사됨!" : "주소 복사"}
                          >
                            <i className={`fas ${copySuccess ? "fa-check" : "fa-copy"} text-xs`}></i>
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={handleDisconnect}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex items-center"
                      >
                        <i className="fas fa-sign-out-alt mr-2 pr-1"></i>
                        지갑 연결 해제
                      </button>
                    </div>
                  </div>
                )}

                {showDisconnect && <div className="fixed inset-0 z-40" onClick={() => setShowDisconnect(false)} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
