import { useState, useCallback } from "react";

export interface QRScanResult {
  merchantAddress: string;
  merchantName?: string;
  lumaLink?: string;
}

export function useQRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [error, setError] = useState<string>("");

  const startScanning = useCallback(() => {
    setIsScanning(true);
    setError("");
    setScanResult(null);
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  const handleScanResult = useCallback((result: string) => {
    try {
      // QR 코드 결과 파싱 (JSON 형태 또는 특정 형식으로 가정)
      const parsedResult = JSON.parse(result) as QRScanResult;

      // 기본 유효성 검사
      if (!parsedResult.merchantAddress) {
        throw new Error("Invalid QR code: merchant address not found");
      }

      setScanResult(parsedResult);
      setIsScanning(false);
      setError("");
    } catch (err) {
      // 단순 주소 문자열인 경우 처리
      if (result.startsWith("0x") && result.length === 66) {
        setScanResult({
          merchantAddress: result,
          merchantName: "Unknown Merchant",
        });
        setIsScanning(false);
        setError("");
      } else {
        setError("Invalid QR code format");
      }
    }
  }, []);

  const clearResult = useCallback(() => {
    setScanResult(null);
    setError("");
  }, []);

  return {
    isScanning,
    scanResult,
    error,
    startScanning,
    stopScanning,
    handleScanResult,
    clearResult,
  };
}
