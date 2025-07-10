"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useUser } from "../hooks/useUser";
import Header from "../components/Header";
import UserRegistration from "../components/UserRegistration";
import WalletConnectionPrompt from "../components/common/WalletConnectionPrompt";
import { UserType } from "../utils/constants";

export default function Home() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { user, isNewUser, isLoading: userLoading } = useUser();
  const [showRegistration, setShowRegistration] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const walletConnected = !!account;

  // 앱 초기화 상태 관리
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // 지갑 연결 상태 변화 감지
  useEffect(() => {
    if (!account?.address) {
      setShowRegistration(false);
    }
  }, [account?.address]);

  // 신규 가입자인 경우 등록 화면 표시
  useEffect(() => {
    if (walletConnected && isNewUser && !userLoading && !isInitializing) {
      setShowRegistration(true);
    }
  }, [walletConnected, isNewUser, userLoading, isInitializing]);

  // 등록된 사용자의 경우 타입에 따라 리다이렉트
  useEffect(() => {
    if (user && !userLoading && !showRegistration && !isInitializing) {
      if (user.userType === UserType.STORE) {
        router.push("/store/home");
      } else if (user.userType === UserType.CONSUMER) {
        router.push("/consumer/home");
      }
    }
  }, [user, userLoading, showRegistration, isInitializing, router]);

  const handleRegistrationComplete = (userType: UserType) => {
    setShowRegistration(false);
    // 사용자 유형에 따라 즉시 해당 홈으로 이동
    if (userType === UserType.STORE) {
      router.push("/store/home");
    } else if (userType === UserType.CONSUMER) {
      router.push("/consumer/home");
    }
  };

  const handleRegistrationCancel = () => {
    setShowRegistration(false);

    // 지갑 연결 해제 로직
    try {
      const keysToRemove = [
        "sui-dapp-kit:wallet-connection-info",
        "sui-dapp-kit:last-wallet",
        "walletconnect",
        "sui_wallet",
        "sui-wallet-adapter",
        "wallet-standard:app",
        "wallet-standard:wallet",
      ];

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      sessionStorage.clear();
      window.location.href = "/"; // '/' 페이지로 리다이렉트
    } catch (error) {
      console.error("Error during disconnect:", error);
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <Header walletConnected={walletConnected} walletAddress={account?.address} />

      {/* 메인 콘텐츠 */}
      <main className="pb-20">
        {/* 초기화 중 */}
        {isInitializing && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">지갑 연결을 확인하는 중...</p>
            </div>
          </div>
        )}

        {/* 사용자 정보 로딩 중 */}
        {walletConnected && userLoading && !isInitializing && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">사용자 정보를 확인하는 중...</p>
            </div>
          </div>
        )}

        {/* 사용자 등록 화면 */}
        {showRegistration && (
          <UserRegistration
            walletAddress={account?.address || ""}
            onRegistrationComplete={handleRegistrationComplete}
            onCancel={handleRegistrationCancel}
          />
        )}

        {/* 지갑 연결 화면 - 지갑이 연결되지 않은 경우만 표시 */}
        {!walletConnected && !isInitializing && <WalletConnectionPrompt />}
      </main>
    </div>
  );
}
