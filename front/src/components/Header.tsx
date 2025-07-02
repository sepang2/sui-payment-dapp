import React, { useState } from "react";
import { ConnectButton } from "@mysten/dapp-kit";

interface HeaderProps {
  walletConnected: boolean;
  walletAddress?: string;
}

const Header: React.FC<HeaderProps> = ({ walletConnected, walletAddress }) => {
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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

      // 약간의 지연 후 페이지 새로고침으로 완전한 연결 해제
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Error during disconnect:", error);
      // 에러 발생시에도 페이지 새로고침으로 fallback
      window.location.reload();
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-center">
        <div className="w-full max-w-md px-6 py-3 flex justify-between items-center relative">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-2">
              <i className="fas fa-wallet text-white"></i>
            </div>
            <h1 className="text-xl font-bold text-gray-800 pl-2">SUI 페이</h1>
          </div>
          {!walletConnected ? (
            <div className="connect-wallet-container">
              <ConnectButton />
            </div>
          ) : (
            <div className="relative">
              <div
                className="flex items-center cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
                onClick={handleWalletClick}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <p className="text-sm text-gray-600 pl-2">
                  {formatWalletAddress(walletAddress || "")}
                </p>
                <i className="fas fa-chevron-down text-xs text-gray-400 ml-2 pl-1"></i>
              </div>

              {showDisconnect && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium mb-2">연결된 지갑</div>
                      <div className="flex items-center">
                        <div className="text-xs text-gray-500 mr-2 pr-1">
                          {formatWalletAddress(walletAddress || "")}
                        </div>
                        <button
                          onClick={handleCopyAddress}
                          className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                            copySuccess
                              ? "text-green-600"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                          title={copySuccess ? "복사됨!" : "주소 복사"}
                        >
                          <i
                            className={`fas ${copySuccess ? "fa-check" : "fa-copy"} text-xs`}
                          ></i>
                        </button>
                      </div>
                      {copySuccess && (
                        <div className="text-xs text-green-600 mt-1">
                          주소가 복사되었습니다!
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center"
                    >
                      <i className="fas fa-sign-out-alt mr-2 pr-1"></i>
                      지갑 연결 해제
                    </button>
                  </div>
                </div>
              )}

              {showDisconnect && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDisconnect(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
