"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../hooks/useUser";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Header from "../../components/Header";
import BottomNavigation from "../../components/BottomNavigation";

export default function ProfileRedirectPage() {
  const account = useCurrentAccount();
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.userType) {
      if (user.userType === "STORE") {
        router.push("/store/profile");
      } else if (user.userType === "CONSUMER") {
        router.push("/consumer/home");
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
