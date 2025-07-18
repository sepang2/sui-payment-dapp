"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import QrScanner from "qr-scanner";
import { useTranslation } from "react-i18next";

interface QRScannerProps {
  onCancel: () => void;
  onScanSuccess: (result: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onCancel, onScanSuccess }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [error, setError] = useState<string>("");

  // 카메라 및 스캐너 정지
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current = null;
    }
  }, []);

  // 카메라 권한 확인 함수
  const checkCameraPermission = useCallback(async () => {
    try {
      const permissionStatus = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      return permissionStatus.state;
    } catch (err) {
      console.error("Error checking camera permission: ", err);
      return "prompt"; // 만약 권한을 확인할 수 없으면 기본적으로 권한 요청을 진행
    }
  }, []);

  // 카메라를 활성화하고 QR 스캐너 시작
  const activateCamera = useCallback(async () => {
    try {
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
        videoRef.current.play();

        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            stopCamera();
            onScanSuccess(result.data);
          },
          {
            returnDetailedScanResult: true,
          }
        );
        qrScannerRef.current.start();
        setError("");
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      setError(t('camera_access_denied'));
    }
  }, [stopCamera, onScanSuccess]);

  // 카메라 시작 함수
  const startCamera = useCallback(async () => {
    const cameraPermission = localStorage.getItem("cameraPermission");

    // 이미 허용된 경우
    if (cameraPermission === "granted") {
      await activateCamera();
      return;
    }

    // 권한 상태 확인 및 처리
    const permissionState = await checkCameraPermission();

    if (permissionState === "granted") {
      localStorage.setItem("cameraPermission", "granted");
      await activateCamera();
    } else if (permissionState === "prompt") {
      try {
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { ideal: "environment" },
          },
          audio: false,
        });
        localStorage.setItem("cameraPermission", "granted");
        await activateCamera();
      } catch (err) {
        console.error("Error accessing camera after permission prompt: ", err);
        setError(t('camera_access_denied'));
      }
    } else {
      setError(t('camera_access_blocked'));
    }
  }, [activateCamera, checkCameraPermission]);

  const handleCancel = useCallback(() => {
    stopCamera();
    onCancel();
  }, [onCancel, stopCamera]);

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

            {/* 에러 상태 표시 */}
            {error && (
              <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center p-4">
                  <i className="fas fa-exclamation-triangle text-white text-2xl mb-2"></i>
                  <p className="text-white text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* 프레임 테두리 */}
            {!error && (
              <div className="absolute inset-0 border-2 border-white rounded-lg pointer-events-none z-10">
                {/* 모서리 가이드 */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-lg"></div>

                {/* 중앙 스캔 라인 애니메이션 */}
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-indigo-400 opacity-80 animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* 상단 안내 텍스트 */}
        <div className="absolute top-0 inset-x-0 p-6 bg-gradient-to-b from-black via-black/50 to-transparent z-30">
          {error ? (
            <>
              <h2 className="text-white text-center text-xl font-bold drop-shadow-lg">{t('camera_error')}</h2>
              <p className="text-white text-center text-sm mt-2 opacity-90 drop-shadow-lg">
                {t('check_camera_permission')}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-white text-center text-xl font-bold drop-shadow-lg">
                {t('align_qr_code')}
              </h2>
              <p className="text-white text-center text-sm mt-2 opacity-90 drop-shadow-lg">
                {t('auto_recognize_qr')}
              </p>
            </>
          )}
        </div>
      </div>

      {/* 하단 버튼들 */}
      <div className="p-6 bg-gradient-to-t from-black via-black/50 to-transparent z-50">
        {error ? (
          <div className="flex space-x-3">
            <button
              onClick={startCamera}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-button font-semibold cursor-pointer shadow-lg"
            >
              {t('retry')}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-white text-indigo-600 py-3 rounded-button font-semibold cursor-pointer shadow-lg"
            >
              {t('cancel')}
            </button>
          </div>
        ) : (
          <button
            onClick={handleCancel}
            className="w-full bg-white text-indigo-600 py-3 rounded-button font-semibold cursor-pointer shadow-lg"
          >
            {t('cancel')}
          </button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
