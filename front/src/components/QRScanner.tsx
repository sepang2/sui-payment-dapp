import { useState } from "react";
import {
  Button,
  Container,
  Flex,
  Text,
  Card,
  AlertDialog,
} from "@radix-ui/themes";
import { CameraIcon } from "@radix-ui/react-icons";
import { useQRScanner } from "../hooks/useQRScanner";

interface QRScannerProps {
  onScanSuccess: (result: {
    merchantAddress: string;
    merchantName?: string;
    maxAmount?: number;
  }) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    isScanning,
    scanResult,
    error,
    startScanning,
    stopScanning,
    handleScanResult,
    clearResult,
  } = useQRScanner();

  // 데모용 QR 코드 스캔 시뮬레이션
  const simulateQRScan = () => {
    // 데모용 가맹점 정보
    const demoMerchantData = {
      merchantAddress: "0x1234567890abcdef1234567890abcdef12345678",
      merchantName: "데모 커피숍",
      maxAmount: 100,
    };

    handleScanResult(JSON.stringify(demoMerchantData));
  };

  const handleStartScan = () => {
    setIsDialogOpen(true);
    startScanning();
  };

  const handleStopScan = () => {
    setIsDialogOpen(false);
    stopScanning();
    clearResult();
  };

  // 스캔 성공 시 콜백 호출
  if (scanResult && !error) {
    onScanSuccess(scanResult);
    clearResult();
    setIsDialogOpen(false);
  }

  return (
    <Container my="2">
      <Card>
        <Flex direction="column" gap="3" p="4">
          <Text size="4" weight="medium">
            QR 코드 스캔
          </Text>
          <Text size="2" color="gray">
            가맹점의 QR 코드를 스캔하여 결제를 시작하세요
          </Text>

          <Button size="3" onClick={handleStartScan} style={{ width: "100%" }}>
            <CameraIcon />
            QR 코드 스캔하기
          </Button>

          {/* QR 스캔 다이얼로그 */}
          <AlertDialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialog.Content style={{ maxWidth: 450 }}>
              <AlertDialog.Title>QR 코드 스캔</AlertDialog.Title>
              <AlertDialog.Description size="2">
                {isScanning ? (
                  <Flex direction="column" gap="3" align="center" py="4">
                    <Text>카메라로 QR 코드를 스캔하고 있습니다...</Text>
                    <Text size="1" color="gray">
                      (데모 버전: 아래 버튼으로 스캔을 시뮬레이션할 수 있습니다)
                    </Text>
                    <Button onClick={simulateQRScan} variant="soft">
                      데모 QR 코드 스캔
                    </Button>
                  </Flex>
                ) : (
                  <Text>QR 코드 스캔을 준비 중입니다...</Text>
                )}

                {error && (
                  <Text color="red" size="2">
                    오류: {error}
                  </Text>
                )}
              </AlertDialog.Description>

              <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray" onClick={handleStopScan}>
                    취소
                  </Button>
                </AlertDialog.Cancel>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </Flex>
      </Card>
    </Container>
  );
}
