import React from "react";

interface PaymentSuccessProps {
  amount: string;
  merchantName: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  amount,
  merchantName,
}) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 gap-4">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
        <i className="fas fa-check text-3xl text-green-600 dark:text-green-400"></i>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        결제 완료!
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {merchantName}에 {amount} SUI를 성공적으로 결제했습니다.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        잠시 후 메인 화면으로 돌아갑니다...
      </p>
    </div>
  );
};

export default PaymentSuccess;
