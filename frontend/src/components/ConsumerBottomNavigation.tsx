"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface ConsumerBottomNavigationProps {
  visible: boolean;
}

export default function ConsumerBottomNavigation({ visible }: ConsumerBottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (!visible) return null;

  const menuItems = [
    {
      id: "home",
      label: "홈",
      icon: "fas fa-home",
      path: "/consumer/home",
    },
    {
      id: "transactions",
      label: "거래",
      icon: "fas fa-exchange-alt",
      path: "/consumer/transactions",
    },
    {
      id: "explore",
      label: "탐색",
      icon: "fas fa-search",
      path: "/consumer/explore",
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around py-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <i className={`${item.icon} text-lg mb-1`}></i>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
