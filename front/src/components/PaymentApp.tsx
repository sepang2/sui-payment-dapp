// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useBalance } from "../hooks/useBalance";
import { usePayment, PaymentRequest } from "../hooks/usePayment";
import { useQRScanner } from "../hooks/useQRScanner";
import Header from "./Header";
import Dashboard from "./Dashboard";
import QRScanner from "./QRScanner";
import AmountInput from "./AmountInput";
import PaymentConfirmation from "./PaymentConfirmation";
import PaymentSuccess from "./PaymentSuccess";
import BottomNavigation from "./BottomNavigation";

const PaymetApp: React.FC = () => {
  const account = useCurrentAccount();
  const {
    balance,
    isPending: balanceLoading,
    refetch: refetchBalance,
  } = useBalance();
  const { processPayment, isProcessing } = usePayment();
  const {
    scanResult,
    error: qrError,
    startScanning,
    stopScanning,
    handleScanResult,
    clearResult,
  } = useQRScanner();

  const [scanningQR, setScanningQR] = useState<boolean>(false);
  const [enteringAmount, setEnteringAmount] = useState<boolean>(false);
  const [confirmingPayment, setConfirmingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("0");
  const [merchantName, setMerchantName] = useState<string>("");
  const [merchantAddress, setMerchantAddress] = useState<string>("");

  const walletConnected = !!account;
  const walletBalance = balance;

  const startQRScan = () => {
    setScanningQR(true);
    startScanning();
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
      setMerchantName(scanResult.merchantName || "Unknown Merchant");
      setMerchantAddress(scanResult.merchantAddress);
      setAmount(scanResult.paymentAmount?.toString() || "0");
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
    if (!account || !merchantAddress) return;

    const numericAmount = parseFloat(amount);
    const discountRate = 0.05;
    const discountAmount = numericAmount * discountRate;
    const finalAmount = numericAmount - discountAmount;

    const paymentRequest: PaymentRequest = {
      merchantAddress,
      amount: finalAmount,
      merchantName,
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
        setMerchantName("");
        setMerchantAddress("");
        refetchBalance();
      }, 3000);
    } catch (error) {
      console.error("Payment failed:", error);
      // 에러 처리 로직 추가 가능
    }
  };

  const displayBalance = balanceLoading ? 0 : walletBalance;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <Header
        walletConnected={walletConnected}
        walletAddress={account?.address}
      />

      {/* 메인 콘텐츠 */}
      <main className="pb-20">
        <Dashboard
          walletConnected={walletConnected}
          balance={displayBalance}
          balanceLoading={balanceLoading}
          onStartQRScan={startQRScan}
        />

        {/* QR 코드 스캔 화면 */}
        {scanningQR && (
          <QRScanner
            onCancel={cancelQRScan}
            onScanSuccess={handleQRScanSuccess}
          />
        )}

        {/* 결제 금액 입력 화면 */}
        {enteringAmount && (
          <AmountInput
            amount={amount}
            merchantName={merchantName}
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
            merchantName={merchantName}
            merchantAddress={merchantAddress}
            balance={displayBalance}
            walletAddress={account?.address}
            isProcessing={isProcessing}
            onCancel={cancelPayment}
            onConfirm={confirmPayment}
          />
        )}

        {/* 결제 성공 화면 */}
        {paymentSuccess && (
          <PaymentSuccess amount={amount} merchantName={merchantName} />
        )}
      </main>

      {/* 하단 네비게이션 */}
      <BottomNavigation
        visible={
          walletConnected &&
          !scanningQR &&
          !enteringAmount &&
          !confirmingPayment &&
          !paymentSuccess
        }
      />
    </div>
  );
};

export default PaymetApp;
