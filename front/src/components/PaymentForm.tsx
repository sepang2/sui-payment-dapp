import { useState } from "react";
import {
  Button,
  Container,
  Flex,
  Text,
  Card,
  TextField,
  Separator,
} from "@radix-ui/themes";
import { useBalance } from "../hooks/useBalance";
import { usePayment, PaymentRequest } from "../hooks/usePayment";

interface PaymentFormProps {
  merchantAddress: string;
  merchantName?: string;
  maxAmount?: number;
  onPaymentComplete: (digest: string) => void;
  onCancel: () => void;
}

export function PaymentForm({
  merchantAddress,
  merchantName = "알 수 없는 가맹점",
  maxAmount,
  onPaymentComplete,
  onCancel,
}: PaymentFormProps) {
  const [amount, setAmount] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { balance, isConnected } = useBalance();
  const { processPayment, isProcessing } = usePayment();

  // 고정 할인 (데모용)
  const discountAmount = 0.5; // 0.5 SUI 할인
  const numericAmount = parseFloat(amount) || 0;
  const finalAmount = Math.max(0, numericAmount - discountAmount);

  const isValidAmount =
    numericAmount > 0 &&
    numericAmount <= balance &&
    (!maxAmount || numericAmount <= maxAmount);

  const handleAmountChange = (value: string) => {
    // 숫자와 소수점만 허용
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handlePayment = async () => {
    if (!isValidAmount || !isConnected) return;

    const paymentRequest: PaymentRequest = {
      merchantAddress,
      amount: numericAmount,
      merchantName,
      discount: discountAmount,
    };

    try {
      await processPayment(paymentRequest);
      onPaymentComplete("payment-completed"); // 실제로는 트랜잭션 digest가 전달됨
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  if (!showConfirmation) {
    return (
      <Container my="2">
        <Card>
          <Flex direction="column" gap="4" p="4">
            <Text size="4" weight="medium">
              결제 금액 입력
            </Text>

            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                가맹점
              </Text>
              <Text size="3">{merchantName}</Text>
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                결제 금액 (SUI)
              </Text>
              <TextField.Root
                placeholder="0.00"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleAmountChange(e.target.value)
                }
                size="3"
              />
              {maxAmount && (
                <Text size="1" color="gray">
                  최대 결제 가능 금액: {maxAmount} SUI
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                현재 잔액
              </Text>
              <Text size="3" color={balance < numericAmount ? "red" : "green"}>
                {balance.toFixed(4)} SUI
              </Text>
            </Flex>

            {numericAmount > balance && (
              <Text size="2" color="red">
                잔액이 부족합니다
              </Text>
            )}

            <Flex gap="2">
              <Button variant="soft" onClick={onCancel} style={{ flex: 1 }}>
                취소
              </Button>
              <Button
                onClick={() => setShowConfirmation(true)}
                disabled={!isValidAmount}
                style={{ flex: 1 }}
              >
                다음
              </Button>
            </Flex>
          </Flex>
        </Card>
      </Container>
    );
  }

  return (
    <Container my="2">
      <Card>
        <Flex direction="column" gap="4" p="4">
          <Text size="4" weight="medium">
            결제 확인
          </Text>

          <Flex direction="column" gap="3">
            <Flex justify="between">
              <Text size="2">가맹점</Text>
              <Text size="2" weight="medium">
                {merchantName}
              </Text>
            </Flex>

            <Flex justify="between">
              <Text size="2">원래 금액</Text>
              <Text size="2">{numericAmount.toFixed(2)} SUI</Text>
            </Flex>

            <Flex justify="between">
              <Text size="2" color="green">
                할인
              </Text>
              <Text size="2" color="green">
                -{discountAmount.toFixed(2)} SUI
              </Text>
            </Flex>

            <Separator my="1" />

            <Flex justify="between">
              <Text size="3" weight="bold">
                최종 결제 금액
              </Text>
              <Text size="3" weight="bold">
                {finalAmount.toFixed(2)} SUI
              </Text>
            </Flex>
          </Flex>

          <Flex gap="2">
            <Button
              variant="soft"
              onClick={() => setShowConfirmation(false)}
              disabled={isProcessing}
              style={{ flex: 1 }}
            >
              이전
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              style={{ flex: 1 }}
            >
              {isProcessing ? "처리 중..." : "결제할래요"}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Container>
  );
}
