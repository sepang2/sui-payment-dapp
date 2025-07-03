import React from "react";

interface BottomNavigationProps {
  visible: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-center">
        <div className="w-full max-w-md mx-auto flex justify-around">
          <button className="py-3 px-4 flex flex-col items-center text-indigo-600 dark:text-indigo-400 cursor-pointer whitespace-nowrap">
            <i className="fas fa-home text-xl"></i>
            <span className="text-xs mt-1">홈</span>
          </button>
          <button className="py-3 px-4 flex flex-col items-center text-gray-500 dark:text-gray-400 cursor-pointer whitespace-nowrap">
            <i className="fas fa-exchange-alt text-xl"></i>
            <span className="text-xs mt-1">거래</span>
          </button>
          <button className="py-3 px-4 flex flex-col items-center text-gray-500 dark:text-gray-400 cursor-pointer whitespace-nowrap">
            <i className="fas fa-qrcode text-xl"></i>
            <span className="text-xs mt-1">스캔</span>
          </button>
          <button className="py-3 px-4 flex flex-col items-center text-gray-500 dark:text-gray-400 cursor-pointer whitespace-nowrap">
            <i className="fas fa-cog text-xl"></i>
            <span className="text-xs mt-1">설정</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
