// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState } from "react";

const TempPage: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [scanningQR, setScanningQR] = useState<boolean>(false);
  const [enteringAmount, setEnteringAmount] = useState<boolean>(false);
  const [confirmingPayment, setConfirmingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("0");
  // const [walletBalance, setWalletBalance] = useState<number>(1.234);
  // const [exchangeRate, setExchangeRate] = useState<number>(3500);
  const [merchantName, setMerchantName] = useState<string>("");

  const walletBalance = 1.234;
  const exchangeRate = 3500;

  const connectWallet = () => {
    setWalletConnected(true);
  };
  const startQRScan = () => {
    setScanningQR(true);
  };
  const handleQRScanSuccess = () => {
    setScanningQR(false);
    setEnteringAmount(true);
    setMerchantName("커피숍 ABC");
  };
  const cancelQRScan = () => {
    setScanningQR(false);
  };
  const handleKeypadPress = (key: string) => {
    if (key === "backspace") {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else if (key === "clear") {
      setAmount("0");
    } else {
      setAmount((prev) => {
        if (prev === "0") return key;
        return prev + key;
      });
    }
  };
  const proceedToConfirmation = () => {
    setEnteringAmount(false);
    setConfirmingPayment(true);
  };
  const cancelPayment = () => {
    setEnteringAmount(false);
    setConfirmingPayment(false);
    setAmount("0");
  };
  const confirmPayment = () => {
    setConfirmingPayment(false);
    setPaymentSuccess(true);
    // 5초 후 초기 화면으로 돌아가기
    setTimeout(() => {
      setPaymentSuccess(false);
      setAmount("0");
    }, 5000);
  };
  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  const renderMainDashboard = () => (
    <div className="flex flex-col items-center p-6 max-w-md mx-auto">
      <div className="w-full bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-700 mb-2">SUI 잔액</h2>
        <div>
          <p className="text-3xl font-bold text-indigo-600">
            {walletBalance.toFixed(3)} SUI
          </p>
          <p className="text-sm text-gray-500">
            ≈ {(walletBalance * exchangeRate).toLocaleString()} KRW
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 w-full">
        <button
          onClick={startQRScan}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-button text-lg font-semibold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <i className="fas fa-qrcode"></i>
          QR 코드 스캔하기
        </button>
        <button className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-4 px-6 rounded-button text-lg font-semibold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap">
          <i className="fas fa-plus-circle"></i>
          SUI 충전하기
        </button>
      </div>
      <div className="mt-8 w-full">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          최근 거래 내역
        </h3>
        <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">커피숍 ABC</p>
              <p className="text-sm text-gray-500">2025-07-01 09:30</p>
            </div>
            <p className="text-red-500 font-medium">-0.125 SUI</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">레스토랑 XYZ</p>
              <p className="text-sm text-gray-500">2025-06-30 19:45</p>
            </div>
            <p className="text-red-500 font-medium">-0.350 SUI</p>
          </div>
        </div>
      </div>
    </div>
  );
  const renderQRScanner = () => (
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
            onClick={handleQRScanSuccess}
            className="bg-indigo-600 text-white py-2 px-4 rounded-button cursor-pointer whitespace-nowrap"
          >
            QR 인식 성공 (데모)
          </button>
        </div>
      </div>
      <div className="p-6">
        <button
          onClick={cancelQRScan}
          className="w-full bg-white text-indigo-600 py-3 rounded-button font-semibold cursor-pointer whitespace-nowrap"
        >
          취소
        </button>
      </div>
    </div>
  );
  const renderAmountInput = () => (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">결제 금액 입력</h2>
          <p className="text-sm text-gray-500">{merchantName}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <p className="text-sm text-gray-500 mb-1">결제 금액</p>
          <p className="text-4xl font-bold text-indigo-600">{amount} SUI</p>
          <p className="text-sm text-gray-500 mt-1">
            ≈ ${(parseFloat(amount) * 10).toFixed(2)} USD
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeypadPress(num.toString())}
              className="bg-white border border-gray-200 rounded-button py-4 text-xl font-semibold cursor-pointer whitespace-nowrap"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleKeypadPress("clear")}
            className="bg-white border border-gray-200 rounded-button py-4 text-xl font-semibold cursor-pointer whitespace-nowrap"
          >
            C
          </button>
          <button
            onClick={() => handleKeypadPress("0")}
            className="bg-white border border-gray-200 rounded-button py-4 text-xl font-semibold cursor-pointer whitespace-nowrap"
          >
            0
          </button>
          <button
            onClick={() => handleKeypadPress("backspace")}
            className="bg-white border border-gray-200 rounded-button py-4 text-xl font-semibold cursor-pointer whitespace-nowrap"
          >
            <i className="fas fa-backspace"></i>
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={cancelPayment}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-button font-semibold cursor-pointer whitespace-nowrap"
          >
            취소
          </button>
          <button
            onClick={proceedToConfirmation}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-button font-semibold cursor-pointer whitespace-nowrap"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
  const renderPaymentConfirmation = () => {
    const originalAmount = parseFloat(amount);
    const discount = originalAmount * 0.05; // 5% 할인 가정
    const finalAmount = originalAmount - discount;
    return (
      <div className="fixed inset-0 bg-white flex flex-col">
        <div className="p-6 flex-1">
          <h2 className="text-xl font-bold text-gray-800 mb-6">결제 확인</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-lg font-bold">{merchantName}</p>
            </div>
            <div className="border-t border-gray-200 my-3"></div>
            <div className="flex justify-between mb-2">
              <p className="text-gray-600">원래 금액</p>
              <p className="font-medium">{originalAmount.toFixed(3)} SUI</p>
            </div>
            <div className="flex justify-between mb-2 text-green-600">
              <p>할인 (5%)</p>
              <p>-{discount.toFixed(3)} SUI</p>
            </div>
            <div className="border-t border-gray-200 my-3"></div>
            <div className="flex justify-between">
              <p className="text-lg font-bold">최종 결제 금액</p>
              <p className="text-lg font-bold text-indigo-600">
                {finalAmount.toFixed(3)} SUI
              </p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-wallet text-indigo-600"></i>
              </div>
              <div>
                <p className="font-medium">Slush Wallet</p>
                <p className="text-sm text-gray-500">
                  잔액: {walletBalance.toFixed(3)} SUI
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex gap-3">
            <button
              onClick={cancelPayment}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-button font-semibold cursor-pointer whitespace-nowrap"
            >
              취소
            </button>
            <button
              onClick={confirmPayment}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-button font-semibold cursor-pointer whitespace-nowrap"
            >
              결제할래요
            </button>
          </div>
        </div>
      </div>
    );
  };
  const renderPaymentSuccess = () => (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <i className="fas fa-check text-3xl text-green-600"></i>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">결제 완료!</h2>
      <p className="text-gray-600 mb-6">
        {merchantName}에 {amount} SUI를 성공적으로 결제했습니다.
      </p>
      <p className="text-sm text-gray-500">
        잠시 후 메인 화면으로 돌아갑니다...
      </p>
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-2">
              <i className="fas fa-wallet text-white"></i>
            </div>
            <h1 className="text-xl font-bold text-gray-800">SUI 페이</h1>
          </div>
          {!walletConnected ? (
            <button
              onClick={connectWallet}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-button text-sm font-medium cursor-pointer whitespace-nowrap"
            >
              지갑 연결
            </button>
          ) : (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <p className="text-sm text-gray-600">
                {formatWalletAddress("0x1a2b3c4d5e6f7890")}
              </p>
            </div>
          )}
        </div>
      </header>
      {/* 메인 콘텐츠 */}
      <main className="pb-20">
        {!walletConnected ? (
          <div className="flex flex-col items-center justify-center p-6 h-[80vh] max-w-md mx-auto">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-wallet text-4xl text-indigo-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              SUI 페이에 오신 것을 환영합니다
            </h2>
            <p className="text-gray-600 text-center mb-8">
              SUI 블록체인을 이용한 간편한 결제 서비스입니다. 시작하려면 Slush
              Wallet을 연결해주세요.
            </p>
            <button
              onClick={connectWallet}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-button text-lg font-semibold cursor-pointer whitespace-nowrap"
            >
              Slush Wallet 연결하기
            </button>
          </div>
        ) : (
          renderMainDashboard()
        )}
        {/* QR 코드 스캔 화면 */}
        {scanningQR && renderQRScanner()}
        {/* 결제 금액 입력 화면 */}
        {enteringAmount && renderAmountInput()}
        {/* 결제 확인 화면 */}
        {confirmingPayment && renderPaymentConfirmation()}
        {/* 결제 성공 화면 */}
        {paymentSuccess && renderPaymentSuccess()}
      </main>
      {/* 하단 네비게이션 */}
      {walletConnected &&
        !scanningQR &&
        !enteringAmount &&
        !confirmingPayment &&
        !paymentSuccess && (
          <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200">
            <div className="max-w-md mx-auto flex justify-around">
              <button className="py-3 px-4 flex flex-col items-center text-indigo-600 cursor-pointer whitespace-nowrap">
                <i className="fas fa-home text-xl"></i>
                <span className="text-xs mt-1">홈</span>
              </button>
              <button className="py-3 px-4 flex flex-col items-center text-gray-500 cursor-pointer whitespace-nowrap">
                <i className="fas fa-exchange-alt text-xl"></i>
                <span className="text-xs mt-1">거래</span>
              </button>
              <button className="py-3 px-4 flex flex-col items-center text-gray-500 cursor-pointer whitespace-nowrap">
                <i className="fas fa-qrcode text-xl"></i>
                <span className="text-xs mt-1">스캔</span>
              </button>
              <button className="py-3 px-4 flex flex-col items-center text-gray-500 cursor-pointer whitespace-nowrap">
                <i className="fas fa-cog text-xl"></i>
                <span className="text-xs mt-1">설정</span>
              </button>
            </div>
          </nav>
        )}
    </div>
  );
};
export default TempPage;
