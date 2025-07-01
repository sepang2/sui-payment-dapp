import { useState } from "react";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { WalletConnection } from "./WalletConnection";
import { QRScanner } from "./QRScanner";
import { PaymentForm } from "./PaymentForm";
import { TransactionStatus } from "./TransactionStatus";
import { NavButton } from "./NavButton";

type AppState = "wallet" | "qr-scan" | "payment" | "transaction";

interface MerchantInfo {
  address: string;
  name?: string;
  maxAmount?: number;
}

function PaymentApp() {
  const [currentState, setCurrentState] = useState<AppState>("wallet");
  const [merchantInfo, setMerchantInfo] = useState<MerchantInfo | null>(null);
  const [transactionResult, setTransactionResult] = useState<{
    digest?: string;
    isSuccess: boolean;
    error?: string;
    amount?: number;
  } | null>(null);

  const handleQRScanSuccess = (scanResult: {
    merchantAddress: string;
    merchantName?: string;
    maxAmount?: number;
  }) => {
    setMerchantInfo({
      address: scanResult.merchantAddress,
      name: scanResult.merchantName,
      maxAmount: scanResult.maxAmount,
    });
    setCurrentState("payment");
  };

  const handlePaymentComplete = (digest: string) => {
    setTransactionResult({
      digest,
      isSuccess: true,
      amount: merchantInfo ? 1.5 : undefined, // 데모용 고정값
    });
    setCurrentState("transaction");
  };

  const handlePaymentCancel = () => {
    setCurrentState("qr-scan");
    setMerchantInfo(null);
  };

  const handleReset = () => {
    setCurrentState("wallet");
    setMerchantInfo(null);
    setTransactionResult(null);
  };

  const renderCurrentView = () => {
    switch (currentState) {
      case "wallet":
        return (
          <>
            <WalletConnection />
            <Container my="2">
              <Flex justify="center">
                <button
                  onClick={() => setCurrentState("qr-scan")}
                  style={{
                    background: "var(--accent-9)",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "6px",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                    width: "100%",
                    maxWidth: "300px",
                  }}
                >
                  결제 시작하기
                </button>
              </Flex>
            </Container>
          </>
        );

      case "qr-scan":
        return <QRScanner onScanSuccess={handleQRScanSuccess} />;

      case "payment":
        return merchantInfo ? (
          <PaymentForm
            merchantAddress={merchantInfo.address}
            merchantName={merchantInfo.name}
            maxAmount={merchantInfo.maxAmount}
            onPaymentComplete={handlePaymentComplete}
            onCancel={handlePaymentCancel}
          />
        ) : null;

      case "transaction":
        return transactionResult ? (
          <TransactionStatus
            digest={transactionResult.digest}
            isSuccess={transactionResult.isSuccess}
            error={transactionResult.error}
            merchantName={merchantInfo?.name}
            amount={transactionResult.amount}
            onReset={handleReset}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <>
      <NavButton />
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="center"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
          background: "white",
        }}
      >
        <Box>
          <Heading size="6" style={{ color: "var(--accent-11)" }}>
            💳 SUI 결제 dApp
          </Heading>
        </Box>
      </Flex>

      <Container
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          minHeight: "calc(100vh - 80px)",
          padding: "16px",
        }}
      >
        {renderCurrentView()}
      </Container>
    </>
  );
}

export default PaymentApp;
