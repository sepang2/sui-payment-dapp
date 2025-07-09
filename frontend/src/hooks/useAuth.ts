import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useUser } from "./useUser";
import { UserType } from "../utils/constants";
import { isNewPaymentFlowActive } from "../utils/paymentFlow";

interface UseAuthOptions {
  requiredUserType?: UserType;
  redirectTo?: string;
  allowNewUser?: boolean;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
  user: any;
  account: any;
  isStore: boolean;
  isConsumer: boolean;
}

export const useAuth = (options: UseAuthOptions = {}): UseAuthReturn => {
  const { requiredUserType, redirectTo, allowNewUser = false } = options;
  const router = useRouter();
  const account = useCurrentAccount();
  const { user, isNewUser, isLoading: userLoading, isStore, isConsumer } = useUser();

  const isAuthenticated = !!account;
  const isAuthorized = !requiredUserType || Boolean(user && user.userType === requiredUserType);

  useEffect(() => {
    // 새로운 결제 플로우가 활성화되어 있으면 리다이렉트하지 않음
    if (isNewPaymentFlowActive()) {
      return;
    }

    // 지갑이 연결되지 않은 경우
    if (!isAuthenticated) {
      if (redirectTo) {
        router.push(redirectTo);
      }
      return;
    }

    // 사용자 정보 로딩 중이면 대기
    if (userLoading) {
      return;
    }

    // 신규 사용자이고 신규 사용자를 허용하지 않는 경우
    if (isNewUser && !allowNewUser) {
      router.push("/");
      return;
    }

    // 사용자가 있지만 권한이 없는 경우
    if (user && requiredUserType && !isAuthorized) {
      // 권한에 따라 적절한 페이지로 리다이렉트
      if (user.userType === UserType.STORE) {
        router.push("/store/home");
      } else {
        router.push("/consumer/home");
      }
      return;
    }
  }, [isAuthenticated, userLoading, isNewUser, user, isAuthorized, requiredUserType, allowNewUser, redirectTo, router]);

  return {
    isAuthenticated,
    isAuthorized,
    isLoading: userLoading,
    user,
    account,
    isStore,
    isConsumer,
  };
};

// 상점 전용 페이지용 훅
export const useStoreAuth = (): UseAuthReturn => {
  return useAuth({
    requiredUserType: UserType.STORE,
    allowNewUser: false,
  });
};

// 소비자 전용 페이지용 훅
export const useConsumerAuth = (): UseAuthReturn => {
  return useAuth({
    requiredUserType: UserType.CONSUMER,
    allowNewUser: false,
  });
};

// 일반 인증 (신규 사용자 허용)
export const useGeneralAuth = (): UseAuthReturn => {
  return useAuth({
    allowNewUser: true,
  });
};
