"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { networkConfig } from "../utils/network";
import { DarkModeProvider } from "../contexts/DarkModeContext";
import ThemeWrapper from "./ThemeWrapper";
import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";
import { getI18nInstance } from "../i18n";
import { I18nextProvider } from "react-i18next";

// React Query client 생성
const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
  initialLanguage: string;
}

export function Providers({ children, initialLanguage }: ProvidersProps) {
  const i18nInstance = getI18nInstance(initialLanguage);

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <DarkModeProvider>
            <I18nextProvider i18n={i18nInstance}>
              <ThemeWrapper>{children}</ThemeWrapper>
            </I18nextProvider>
          </DarkModeProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
