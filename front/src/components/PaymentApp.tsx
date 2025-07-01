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
  const { balance, isPending: balanceLoading } = useBalance();
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

  const handleQRScanSuccess = () => {
    // 데모용 가맹점 데이터
    const demoMerchantData = {
      merchantAddress: "0x1234567890abcdef1234567890abcdef12345678",
      merchantName: "커피숍 ABC",
      maxAmount: 100,
    };

    handleScanResult(JSON.stringify(demoMerchantData));
  };

  // QR 스캔 결과 처리
  useEffect(() => {
    if (scanResult && !qrError) {
      setScanningQR(false);
      setEnteringAmount(true);
      setMerchantName(scanResult.merchantName || "Unknown Merchant");
      setMerchantAddress(scanResult.merchantAddress);
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
    } else if (key === "clear") {
      setAmount("0");
    } else {
      setAmount((prev) => {
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
    const discount = numericAmount * 0.05; // 5% 할인
    const finalAmount = numericAmount - discount;

    const paymentRequest: PaymentRequest = {
      merchantAddress,
      amount: finalAmount,
      merchantName,
      discount,
    };

    try {
      await processPayment(paymentRequest);
      setConfirmingPayment(false);
      setPaymentSuccess(true);

      // 5초 후 초기 화면으로 돌아가기
      setTimeout(() => {
        setPaymentSuccess(false);
        setAmount("0");
        setMerchantName("");
        setMerchantAddress("");
      }, 5000);
    } catch (error) {
      console.error("Payment failed:", error);
      // 에러 처리 로직 추가 가능
    }
  };

  const displayBalance = balanceLoading ? 0 : walletBalance;

  return (
    <div className="min-h-screen bg-gray-50">
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
            balance={displayBalance}
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
