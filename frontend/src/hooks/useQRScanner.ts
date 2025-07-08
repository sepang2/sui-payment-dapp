"use client";

import { useState, useCallback } from "react";

export interface QRScanResult {
  walletAddress: string;
  name: string;
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
      if (!parsedResult.walletAddress) {
        throw new Error("Invalid QR code: wallet address not found");
      }

      // name이 없으면 기본값 설정
      const finalResult = {
        walletAddress: parsedResult.walletAddress,
        name: parsedResult.name || "Unknown User",
      };

      setScanResult(finalResult);
      setIsScanning(false);
      setError("");
    } catch (error) {

      // 다양한 형태의 QR 코드 처리
      if (typeof result === "string") {
        // 1. 단순 지갑 주소인 경우
        if (result.startsWith("0x") && result.length >= 42) {
          const fallbackResult = {
            walletAddress: result,
            name: "Unknown User",
          };
          setScanResult(fallbackResult);
          setIsScanning(false);
          setError("");
        }
        // 2. 다른 형태의 구조화된 데이터 시도
        else if (result.includes(":") || result.includes("=")) {
          try {
            // key:value 또는 key=value 형태 파싱 시도
            const pairs = result.split(/[,;&\n]/).filter((pair) => pair.trim());
            let walletAddress = "";
            let name = "Unknown User";

            for (const pair of pairs) {
              const [key, value] = pair.split(/[:=]/).map((s) => s.trim());
              if (key.toLowerCase().includes("wallet") || key.toLowerCase().includes("address")) {
                walletAddress = value;
              } else if (key.toLowerCase().includes("name")) {
                name = value;
              }
            }

            if (walletAddress) {
              const keyValueResult = { walletAddress, name };
              setScanResult(keyValueResult);
              setIsScanning(false);
              setError("");
            } else {
              throw new Error("No wallet address found in structured data");
            }
          } catch (parseError) {
            setError("QR 코드 형식을 인식할 수 없습니다");
          }
        }
        // 3. 그 외의 경우 - 전체 문자열을 그대로 사용
        else {
          const rawResult = {
            walletAddress: result,
            name: "Unknown User",
          };
          setScanResult(rawResult);
          setIsScanning(false);
          setError("");
        }
      } else {
        setError("지원하지 않는 QR 코드 형식입니다");
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
