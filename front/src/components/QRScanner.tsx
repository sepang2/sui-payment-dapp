import React, { useEffect, useRef, useState, useCallback } from "react";
import QrScanner from "qr-scanner";

interface QRScannerProps {
  onCancel: () => void;
  onScanSuccess: (result: string) => void;
  onSkipToAmountInput: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onCancel,
  onScanSuccess,
  onSkipToAmountInput,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  // const streamRef = useRef<MediaStream | null>(null);
  // const mountedRef = useRef<boolean>(true);

  // const [hasCamera, setHasCamera] = useState<boolean>(true);
  // const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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

  const activateCamera = async () => {
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
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => onScanSuccess(result.data),
          {
            onDecodeError: (error) => {
              if (error !== "No QR code found") {
                console.error("QR Scanner error: ", error);
              }
            },
            returnDetailedScanResult: true,
          },
        );
        qrScannerRef.current.start();
        setIsScanning(true);
      }
    } catch (err) {
      if (err === "OverconstrainedError") {
        console.error("OverconstrainedError: 카메라 설정을 지원하지 않습니다.");
      } else {
        console.error("Error accessing camera: ", err);
      }
      setError(
        "카메라 접근이 거부되었습니다. 카메라 접근을 허용하고 다시 시도해주세요.",
      );
    }
  };

  const startCamera = async () => {
    const cameraPermission = localStorage.getItem("cameraPermission");

    if (cameraPermission === "granted") {
      await activateCamera();
      return;
    }

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
        setError("카메라 접근이 거부되었습니다. 다시 시도해주세요.");
      }
    } else {
      setError(
        "카메라 접근이 차단되었습니다. 설정에서 카메라 권한을 허용해주세요.",
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      qrScannerRef.current?.stop();
      setIsScanning(false);
    }
  };

  const handleCancel = useCallback(() => {
    stopCamera();
    onCancel();
  }, [stopCamera, onCancel]);

  useEffect(() => {
    const startCam = async () => {
      await startCamera();
    };
    startCam();

    return () => stopCamera();
  }, []);

  /*
// QR 스캔 성공 핸들러
  const handleScanSuccess = useCallback(
    (result: any) => {
      if (mountedRef.current) {
        console.log("QR Code detected:", result.data);
        onScanSuccess(result.data);
      }
    },
    [onScanSuccess],
  );

  // 전체화면 이벤트 핸들러
  const handleFullscreenChange = useCallback(() => {
    // 전체화면이 끝났을 때 비디오 재생 재개
    if (!document.fullscreenElement && videoRef.current && streamRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, []);

  // 카메라를 활성화하고 QR 스캐너 시작
  const activateCamera = async () => {
    if (!mountedRef.current || !videoRef.current) return;

    try {
      // 기존 스트림이 있다면 정리
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: { ideal: "environment" }, // 후면 카메라
        },
        audio: false,
      });

      if (!mountedRef.current || !videoRef.current) {
        // 컴포넌트가 언마운트된 경우 스트림 정리
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      // 비디오 메타데이터가 로드된 후 재생
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current && mountedRef.current) {
          videoRef.current.play().catch(console.error);
        }
      };

      // 짧은 지연 후 QR Scanner 초기화 (비디오가 안정적으로 재생되도록)
      setTimeout(() => {
        if (!mountedRef.current || !videoRef.current) return;

        // QR Scanner 초기화
        if (qrScannerRef.current) {
          qrScannerRef.current.stop();
          qrScannerRef.current.destroy();
        }

        qrScannerRef.current = new QrScanner(
          videoRef.current,
          handleScanSuccess,
          {
            onDecodeError: (error) => {
              // "No QR code found" 에러는 무시 (정상적인 상황)
              if (error !== "No QR code found" && mountedRef.current) {
                console.error("QR Scanner decode error: ", error);
              }
            },
            returnDetailedScanResult: true,
            highlightScanRegion: false, // 커스텀 UI 사용
            highlightCodeOutline: false,
            maxScansPerSecond: 5,
          },
        );

        qrScannerRef.current
          .start()
          .then(() => {
            if (mountedRef.current) {
              setIsLoading(false);
            }
          })
          .catch((err) => {
            console.error("QR Scanner start error:", err);
            if (mountedRef.current) {
              setError("QR 스캐너를 시작할 수 없습니다.");
              setIsLoading(false);
            }
          });
      }, 500); // 500ms 지연
    } catch (err: any) {
      console.error("Error accessing camera: ", err);
      if (mountedRef.current) {
        if (err.name === "OverconstrainedError") {
          setError("카메라 설정을 지원하지 않습니다.");
        } else if (err.name === "NotAllowedError") {
          setError(
            "카메라 접근이 거부되었습니다. 카메라 접근을 허용하고 다시 시도해주세요.",
          );
        } else if (err.name === "NotFoundError") {
          setError("카메라를 찾을 수 없습니다.");
        } else {
          setError("카메라 접근 중 오류가 발생했습니다.");
        }
        setHasCamera(false);
        setIsLoading(false);
      }
    }
  };

  // 카메라 및 스캐너 정지
  const stopCamera = useCallback(() => {
    // QR Scanner 정지
    if (qrScannerRef.current) {
      try {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      } catch (e) {
        console.warn("Error stopping QR scanner:", e);
      }
      qrScannerRef.current = null;
    }

    // 비디오 스트림 정지
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // 비디오 요소 정리
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
    }
  }, []);

  useEffect(() => {
    // 전체화면 이벤트 리스너 추가
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    activateCamera();

    // 컴포넌트 언마운트 시 정리
    return () => {
      mountedRef.current = false;
      stopCamera();

      // 이벤트 리스너 제거
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, [stopCamera, handleFullscreenChange]);

  const handleCancel = useCallback(() => {
    stopCamera();
    onCancel();
  }, [stopCamera, onCancel]);

  if (!hasCamera || error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
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
  */

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
              controls={false}
              webkit-playsinline="true"
              style={{
                WebkitTransform: "translateZ(0)",
                transform: "translateZ(0)",
              }}
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
                paymentAmount: 123,
              });
              onScanSuccess(testQRData);
            }}
            className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-button font-semibold cursor-pointer shadow-lg"
          >
            QR 인식 성공 (테스트)
          </button>
        </div>

        {/* 로딩 오버레이 */}
        {/* {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
            <div className="text-white text-center flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p>카메라를 준비하는 중...</p>
            </div>
          </div>
        )} */}

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
