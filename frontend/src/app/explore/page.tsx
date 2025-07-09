"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../hooks/useUser";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Header from "../../components/Header";
import BottomNavigation from "../../components/BottomNavigation";

export default function ExploreRedirectPage() {
  const account = useCurrentAccount();
  const { user, isLoading, checkUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (account?.address) {
      checkUser(account.address);
    }
  }, [account?.address, checkUser]);

  useEffect(() => {
    if (!isLoading && user && user.userType) {
      if (user.userType === "CONSUMER") {
        router.push("/consumer/explore");
      } else if (user.userType === "STORE") {
        // 상점은 explore 페이지가 없으므로 home으로 리다이렉트
        router.push("/store/home");
      }
    }
  }, [isLoading, user, router]);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <Header walletConnected={!!account} walletAddress={account?.address} />
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">페이지를 이동하는 중...</p>
        </div>
      </div>
      <BottomNavigation visible={true} />
    </div>
  );
}
