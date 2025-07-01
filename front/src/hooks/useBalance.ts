import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { mistToSui } from "../utils/transaction";

export function useBalance() {
  const account = useCurrentAccount();

  const { data, isPending, error, refetch } = useSuiClientQuery(
    "getBalance",
    {
      owner: account?.address as string,
      coinType: "0x2::sui::SUI",
    },
    {
      enabled: !!account?.address,
    },
  );

  const balance = data ? mistToSui(data.totalBalance) : 0;

  return {
    balance,
    balanceData: data,
    isPending,
    error,
    refetch,
    isConnected: !!account,
  };
}
