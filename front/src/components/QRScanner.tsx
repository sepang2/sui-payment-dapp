import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

interface QRScannerProps {
  onCancel: () => void;
  onScanSuccess: (result: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onCancel, onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const initializeQrScanner = async () => {
      if (!videoRef.current) return;

      try {
        // 카메라 사용 가능 여부 확인
        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
          setHasCamera(false);
          setError("카메라를 사용할 수 없습니다.");
          setIsLoading(false);
          return;
        }

        // QR 스캐너 인스턴스 생성
        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            console.log("QR Code detected:", result.data);
            onScanSuccess(result.data);
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: "environment", // 후면 카메라 사용 (모바일)
          },
        );

        qrScannerRef.current = qrScanner;
        await qrScanner.start();
        setIsLoading(false);
      } catch (err) {
        console.error("QR Scanner initialization error:", err);
        setError("카메라 접근 권한이 필요합니다.");
        setIsLoading(false);
      }
    };

    initializeQrScanner();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, [onScanSuccess]);

  const handleCancel = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
    onCancel();
  };

  if (!hasCamera || error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        <div className="text-white text-center p-6">
          <h2 className="text-xl font-bold mb-4">카메라 오류</h2>
          <p className="mb-6">{error || "카메라를 사용할 수 없습니다."}</p>
          <button
            onClick={onCancel}
            className="bg-indigo-600 text-white py-3 px-6 rounded-button font-semibold cursor-pointer"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        {/* 카메라 비디오 스트림 */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-10"
          autoPlay
          playsInline
          muted
        />

        {/* 반투명 오버레이 (QR 스캔 영역 외부를 어둡게) */}
        <div className="absolute inset-0 z-20">
          {/* 상단 오버레이 */}
          <div className="absolute top-0 left-0 right-0 h-[calc(50%-8rem)] bg-black bg-opacity-50"></div>
          {/* 하단 오버레이 */}
          <div className="absolute bottom-0 left-0 right-0 h-[calc(50%-8rem)] bg-black bg-opacity-50"></div>
          {/* 좌측 오버레이 */}
          <div className="absolute top-[calc(50%-8rem)] bottom-[calc(50%-8rem)] left-0 w-[calc(50%-8rem)] bg-black bg-opacity-50"></div>
          {/* 우측 오버레이 */}
          <div className="absolute top-[calc(50%-8rem)] bottom-[calc(50%-8rem)] right-0 w-[calc(50%-8rem)] bg-black bg-opacity-50"></div>
        </div>

        {/* QR 코드 스캔 영역 가이드 */}
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="w-64 h-64 border-2 border-white rounded-lg relative bg-transparent">
            {/* 모서리 가이드 */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg"></div>
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg"></div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-lg"></div>

            {/* 중앙 스캔 라인 애니메이션 */}
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-indigo-400 opacity-80 animate-pulse"></div>
          </div>
        </div>

        {/* 로딩 오버레이 */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
            <div className="text-white text-center flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p>카메라를 준비하는 중...</p>
            </div>
          </div>
        )}

        {/* 상단 안내 텍스트 */}
        <div className="absolute top-0 inset-x-0 p-6 bg-gradient-to-b from-black via-black/50 to-transparent z-30">
          <h2 className="text-white text-center text-xl font-bold drop-shadow-lg">
            QR 코드를 프레임 안에 맞춰주세요
          </h2>
          <p className="text-white text-center text-sm mt-2 opacity-90 drop-shadow-lg">
            카메라가 QR 코드를 자동으로 인식합니다
          </p>
        </div>
      </div>

      {/* 하단 취소 버튼 */}
      <div className="p-6 bg-gradient-to-t from-black via-black/50 to-transparent z-30">
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
