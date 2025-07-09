import { useState, useCallback, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { UserType } from "../utils/constants";

interface User {
  id: string;
  name: string;
  description: string | null;
  walletAddress: string;
  userType: UserType;
  qrCode: string | null;
  lumaUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UseUserReturn {
  user: User | null;
  isNewUser: boolean;
  isLoading: boolean;
  error: string | null;
  checkUser: (walletAddress: string) => Promise<void>;
  clearUser: () => void;
  isStore: boolean;
  isConsumer: boolean;
}

export const useUser = (): UseUserReturn => {
  const account = useCurrentAccount();
  const [user, setUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkUser = useCallback(async (walletAddress: string) => {
    if (!walletAddress) {
      setUser(null);
      setIsNewUser(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users?walletAddress=${encodeURIComponent(walletAddress)}`);

      if (!response.ok) {
        throw new Error("Failed to fetch user information");
      }

      const data = await response.json();

      if (data.user) {
        setUser(data.user);
        setIsNewUser(false);
      } else {
        setUser(null);
        setIsNewUser(true);
      }
    } catch (err) {
      console.error("Error checking user:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setUser(null);
      setIsNewUser(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
    setIsNewUser(false);
    setError(null);
  }, []);

  // 지갑 연결 상태 변화 감지 및 자동 사용자 정보 확인
  useEffect(() => {
    if (account?.address) {
      checkUser(account.address);
    } else {
      clearUser();
    }
  }, [account?.address, checkUser, clearUser]);

  // 유저 타입 체크 헬퍼 함수
  const isStore = Boolean(user?.userType === UserType.STORE);
  const isConsumer = Boolean(user?.userType === UserType.CONSUMER);

  return {
    user,
    isNewUser,
    isLoading,
    error,
    checkUser,
    clearUser,
    isStore,
    isConsumer,
  };
};
