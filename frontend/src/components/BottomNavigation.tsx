"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";

interface BottomNavigationProps {
  visible: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ visible }) => {
  const router = useRouter();
  const pathname = usePathname();

  if (!visible) return null;

  const handleHomeClick = () => {
    router.push("/");
  };

  const handleExploreClick = () => {
    router.push("/explore");
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-center">
        <div className="w-full max-w-md mx-auto flex justify-around">
          <button 
            onClick={handleHomeClick}
            className={`py-3 px-4 flex flex-col items-center cursor-pointer whitespace-nowrap ${
              isActive("/") ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <i className="fas fa-home text-xl"></i>
            <span className="text-xs mt-1">홈</span>
          </button>
          <button className="py-3 px-4 flex flex-col items-center text-gray-500 dark:text-gray-400 cursor-pointer whitespace-nowrap">
            <i className="fas fa-exchange-alt text-xl"></i>
            <span className="text-xs mt-1">거래</span>
          </button>
          <button 
            onClick={handleExploreClick}
            className={`py-3 px-4 flex flex-col items-center cursor-pointer whitespace-nowrap ${
              isActive("/explore") ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <i className="fas fa-compass text-xl"></i>
            <span className="text-xs mt-1">탐색</span>
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
