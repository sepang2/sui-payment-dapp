import { useState, useCallback } from "react";

interface User {
  id: string;
  name: string;
  description: string | null;
  walletAddress: string;
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
}

export const useUser = (): UseUserReturn => {
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

  return {
    user,
    isNewUser,
    isLoading,
    error,
    checkUser,
    clearUser,
  };
};
