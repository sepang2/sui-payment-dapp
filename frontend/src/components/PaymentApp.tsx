"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useBalance } from "../hooks/useBalance";
import { usePayment, PaymentRequest } from "../hooks/usePayment";
import { useQRScanner } from "../hooks/useQRScanner";
import { useUser } from "../hooks/useUser";
import Header from "./Header";
import Dashboard from "./Dashboard";
import QRScanner from "./QRScanner";
import AmountInput from "./AmountInput";
import PaymentConfirmation from "./PaymentConfirmation";
import PaymentSuccess from "./PaymentSuccess";
import BottomNavigation from "./BottomNavigation";
import UserRegistration from "./UserRegistration";
import QRCodeDisplay from "./QRCodeDisplay";
import WalletConnectionPrompt from "./common/WalletConnectionPrompt";
import { DISCOUNT_RATE, UserType } from "../utils/constants";

const PaymentApp: React.FC = () => {
  const router = useRouter();
  const account = useCurrentAccount();
  const { balance, isPending: balanceLoading, refetch: refetchBalance } = useBalance();
  const { processPayment, isProcessing } = usePayment();
  const { scanResult, error: qrError, startScanning, stopScanning, handleScanResult, clearResult } = useQRScanner();
  const { user, isNewUser, isLoading: userLoading } = useUser();

  const [scanningQR, setScanningQR] = useState<boolean>(false);
  const [enteringAmount, setEnteringAmount] = useState<boolean>(false);
  const [confirmingPayment, setConfirmingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [showRegistration, setShowRegistration] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("0");
  const [name, setName] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const walletConnected = !!account;
  const walletBalance = balance;

  // 앱 초기화 상태 관리
  useEffect(() => {
    // 지갑 연결 상태가 결정되면 초기화 완료
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // 지갑 연결 상태 변화 감지 (useUser 훅에서 자동으로 사용자 정보 확인)
  useEffect(() => {
    if (!account?.address) {
      setShowRegistration(false);
    }
  }, [account?.address]);

  // 신규 가입자인 경우 등록 화면 표시
  useEffect(() => {
    if (walletConnected && isNewUser && !userLoading) {
      setShowRegistration(true);
    }
  }, [walletConnected, isNewUser, userLoading]);

  // 등록된 사용자의 경우 타입에 따라 리다이렉트
  useEffect(() => {
    if (user && !userLoading && !showRegistration) {
      if (user.userType === UserType.STORE) {
        router.push("/store/home");
      } else if (user.userType === UserType.CONSUMER) {
        router.push("/consumer/home");
      }
    }
  }, [user, userLoading, showRegistration, router]);

  const startQRScan = () => {
    setScanningQR(true);
    startScanning();
  };

  const makeQRCode = () => {
    if (walletConnected && user) {
      setShowQRCode(true);
    }
  };

  const closeQRCode = () => {
    setShowQRCode(false);
  };

  const handleQRScanSuccess = (result: string) => {
    // QR 스캔 결과를 처리
    handleScanResult(result);
  };

  // QR 스캔 결과 처리
  useEffect(() => {
    if (scanResult && !qrError) {
      setScanningQR(false);
      setEnteringAmount(true);
      setName(scanResult.name || "Unknown User");
      setWalletAddress(scanResult.walletAddress);
      setAmount("0"); // 사용자가 직접 입력하도록 "0"으로 설정
      clearResult();
    }
  }, [scanResult, qrError, clearResult]);

  const cancelQRScan = () => {
    setScanningQR(false);
    stopScanning();
    clearResult();
  };

  const handleKeypadPress = (key: string) => {
    if (key === "backspace") {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else if (key === ".") {
      setAmount((prev) => {
        // 이미 소수점이 있으면 추가하지 않음
        if (prev.includes(".")) return prev;
        // "0"이면 "0."으로 시작
        if (prev === "0") return "0.";
        return prev + ".";
      });
    } else {
      setAmount((prev) => {
        // "0"인 경우에만 숫자로 교체 (소수점이 있는 경우는 제외)
        if (prev === "0") return key;
        return prev + key;
      });
    }
  };

  const proceedToConfirmation = () => {
    setEnteringAmount(false);
    setConfirmingPayment(true);
  };

  const cancelPayment = () => {
    setEnteringAmount(false);
    setConfirmingPayment(false);
    setAmount("0");
  };

  const confirmPayment = async () => {
    if (!account || !walletAddress) return;

    const numericAmount = parseFloat(amount);
    const discountAmount = numericAmount * DISCOUNT_RATE;
    const finalAmount = numericAmount - discountAmount;

    const paymentRequest: PaymentRequest = {
      walletAddress,
      amount: finalAmount,
      name,
      discountAmount,
    };

    try {
      await processPayment(paymentRequest);
      setConfirmingPayment(false);
      setPaymentSuccess(true);

      // 3초 후 초기 화면으로 돌아가기
      setTimeout(() => {
        setPaymentSuccess(false);
        setAmount("0");
        setName("");
        setWalletAddress("");
        refetchBalance();
      }, 3000);
    } catch (error) {
      console.error("Payment failed:", error);
      // 에러 처리 로직 추가 가능
    }
  };

  const handleRegistrationComplete = () => {
    setShowRegistration(false);
    // 사용자 정보는 useUser 훅에서 자동으로 업데이트됨
  };

  const handleRegistrationCancel = () => {
    setShowRegistration(false);

    // 지갑 연결 해제 로직 (Header.tsx의 handleDisconnect와 동일)
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

      window.location.reload();
    } catch (error) {
      console.error("Error during disconnect:", error);
      // 에러 발생시에도 페이지 새로고침으로 fallback
      window.location.reload();
    }
  };

  const displayBalance = balanceLoading ? 0 : walletBalance;

  // 로딩 중이거나 등록 화면이 표시되는 경우의 처리
  const shouldShowMainContent = walletConnected && !showRegistration && !userLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <Header walletConnected={walletConnected} walletAddress={account?.address} />

      {/* 메인 콘텐츠 */}
      <main className="pb-20">
        {/* 지갑 연결 상태 확인 중 */}
        {isInitializing && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">지갑 연결을 확인하는 중...</p>
            </div>
          </div>
        )}

        {/* 사용자 정보 로딩 중 */}
        {userLoading && walletConnected && !isInitializing && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">사용자 정보를 확인하는 중...</p>
            </div>
          </div>
        )}

        {/* 사용자 등록 화면 */}
        {showRegistration && (
          <UserRegistration
            walletAddress={account?.address || ""}
            onRegistrationComplete={handleRegistrationComplete}
            onCancel={handleRegistrationCancel}
          />
        )}

        {/* QR 코드 표시 */}
        {showQRCode && user && (
          <QRCodeDisplay
            user={{
              name: user.name,
              description: user.description || undefined,
              walletAddress: user.walletAddress,
              qrCode: user.qrCode || undefined,
            }}
            onClose={closeQRCode}
          />
        )}

        {/* 대시보드 */}
        {shouldShowMainContent && !isInitializing && (
          <Dashboard
            balance={displayBalance}
            balanceLoading={balanceLoading}
            onMakeQRCode={makeQRCode}
            onScanQRCode={startQRScan}
          />
        )}

        {/* 지갑 연결되지 않은 경우 */}
        {!walletConnected && !isInitializing && <WalletConnectionPrompt />}

        {/* QR 코드 스캔 화면 */}
        {scanningQR && <QRScanner onCancel={cancelQRScan} onScanSuccess={handleQRScanSuccess} />}

        {/* 결제 금액 입력 화면 */}
        {enteringAmount && (
          <AmountInput
            amount={amount}
            name={name}
            balance={displayBalance}
            onKeypadPress={handleKeypadPress}
            onCancel={cancelPayment}
            onProceed={proceedToConfirmation}
          />
        )}

        {/* 결제 확인 화면 */}
        {confirmingPayment && (
          <PaymentConfirmation
            amount={amount}
            name={name}
            balance={displayBalance}
            senderWalletAddress={account?.address || ""}
            receiverWalletAddress={walletAddress}
            onCancel={cancelPayment}
            onConfirm={confirmPayment}
            isProcessing={isProcessing}
          />
        )}

        {/* 결제 성공 화면 */}
        {paymentSuccess && <PaymentSuccess amount={amount} name={name} />}
      </main>

      {/* 하단 네비게이션 */}
      <BottomNavigation
        visible={
          shouldShowMainContent &&
          !scanningQR &&
          !enteringAmount &&
          !confirmingPayment &&
          !paymentSuccess &&
          !showQRCode
        }
      />
    </div>
  );
};

export default PaymentApp;
