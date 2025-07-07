"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { networkConfig } from "../utils/network";
import { DarkModeProvider } from "../contexts/DarkModeContext";
import ThemeWrapper from "./ThemeWrapper";
import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";

// React Query client 생성
const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider>
          <DarkModeProvider>
            <ThemeWrapper>{children}</ThemeWrapper>
          </DarkModeProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
