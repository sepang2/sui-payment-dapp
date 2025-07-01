import React from "react";

interface QRScannerProps {
  onCancel: () => void;
  onScanSuccess: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onCancel, onScanSuccess }) => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-white rounded-lg relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-500"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-500"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-500"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-500"></div>
          </div>
        </div>
        <div className="absolute top-0 inset-x-0 p-6">
          <h2 className="text-white text-center text-xl font-bold">
            QR 코드를 스캔해주세요
          </h2>
        </div>
        {/* 데모 목적으로 QR 코드 인식 성공 버튼 추가 */}
        <div className="absolute inset-x-0 bottom-32 flex justify-center">
          <button
            onClick={onScanSuccess}
            className="bg-indigo-600 text-white py-2 px-4 rounded-button cursor-pointer whitespace-nowrap"
          >
            QR 인식 성공 (데모)
          </button>
        </div>
      </div>
      <div className="p-6">
        <button
          onClick={onCancel}
          className="w-full bg-white text-indigo-600 py-3 rounded-button font-semibold cursor-pointer whitespace-nowrap"
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
