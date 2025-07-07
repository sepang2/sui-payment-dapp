"use client";

import React, { useEffect, useRef, useCallback } from "react";
import QrScanner from "qr-scanner";

interface QRScannerProps {
  onCancel: () => void;
  onScanSuccess: (result: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onCancel, onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  // 카메라 권한 확인 함수
  const checkCameraPermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      return permissionStatus.state;
    } catch (err) {
      console.error("Error checking camera permission: ", err);
      return "prompt";
    }
  };

  const startCamera = async () => {
    try {
      // 카메라 스트림 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      if (videoRef.current) {
        // 기존 스트림이 있다면 정리
        if (videoRef.current.srcObject) {
          const oldStream = videoRef.current.srcObject as MediaStream;
          oldStream.getTracks().forEach((track) => track.stop());
        }

        videoRef.current.srcObject = stream;

        // 비디오 로드 후 재생
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                console.log("Video started playing successfully");

                // QR 스캐너 초기화
                if (qrScannerRef.current) {
                  qrScannerRef.current.stop();
                  qrScannerRef.current = null;
                }

                qrScannerRef.current = new QrScanner(videoRef.current!, (result: any) => onScanSuccess(result.data), {
                  onDecodeError: (error) => {
                    if (error !== "No QR code found") {
                      console.error("QR Scanner error: ", error);
                    }
                  },
                  returnDetailedScanResult: true,
                });
                qrScannerRef.current.start();
              })
              .catch((error) => {
                console.error("Error playing video: ", error);
              });
          }
        };

        // 권한 성공 시 로컬 스토리지에 저장
        localStorage.setItem("cameraPermission", "granted");
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      if (err instanceof Error) {
        if (err.name === "OverconstrainedError") {
          console.error("OverconstrainedError: 카메라 설정을 지원하지 않습니다.");
        } else if (err.name === "NotAllowedError") {
          console.error("NotAllowedError: 카메라 접근 권한이 거부되었습니다.");
        } else if (err.name === "NotFoundError") {
          console.error("NotFoundError: 카메라를 찾을 수 없습니다.");
        }
      }
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleCancel = useCallback(() => {
    stopCamera();
    onCancel();
  }, [onCancel]);

  useEffect(() => {
    startCamera();

    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      <div className="flex-1 relative overflow-hidden">
        {/* 전체 어두운 배경 */}
        <div className="absolute inset-0 bg-black z-10"></div>

        {/* QR 코드 스캔 영역 가이드 및 비디오 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 gap-4">
          <div className="w-64 h-64 relative">
            {/* 카메라 비디오 스트림 - 프레임 내부에만 표시 */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover rounded-lg"
              autoPlay
              playsInline
              muted
            />

            {/* 프레임 테두리 */}
            <div className="absolute inset-0 border-2 border-white rounded-lg pointer-events-none z-10">
              {/* 모서리 가이드 */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-lg"></div>

              {/* 중앙 스캔 라인 애니메이션 */}
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-indigo-400 opacity-80 animate-pulse"></div>
            </div>
          </div>

          {/* 데모 목적으로 QR 코드 인식 성공 버튼 추가 */}
          <button
            onClick={() => {
              // 테스트용 JSON 데이터로 QR 스캔 성공 시뮬레이션
              const testQRData = JSON.stringify({
                merchantName: "테스트 상점",
                merchantAddress: "0xTest",
                lumaLink: "https://luma.com/event/test123",
              });
              onScanSuccess(testQRData);
            }}
            className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-button font-semibold cursor-pointer shadow-lg"
          >
            QR 인식 성공 (테스트)
          </button>
        </div>

        {/* 상단 안내 텍스트 */}
        <div className="absolute top-0 inset-x-0 p-6 bg-gradient-to-b from-black via-black/50 to-transparent z-30">
          <h2 className="text-white text-center text-xl font-bold drop-shadow-lg">QR 코드를 프레임 안에 맞춰주세요</h2>
          <p className="text-white text-center text-sm mt-2 opacity-90 drop-shadow-lg">
            카메라가 QR 코드를 자동으로 인식합니다
          </p>
        </div>
      </div>

      {/* 하단 버튼들 */}
      <div className="p-6 bg-gradient-to-t from-black via-black/50 to-transparent z-50">
        <button
          onClick={handleCancel}
          className="w-full bg-white text-indigo-600 py-3 rounded-button font-semibold cursor-pointer shadow-lg"
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
