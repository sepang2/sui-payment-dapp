import React from "react";
import ReactDOM from "react-dom/client";
import "../global.css";
import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import { networkConfig } from "./utils/network.ts";
import { DarkModeProvider } from "./contexts/DarkModeContext.tsx";
import ThemeWrapper from "./components/ThemeWrapper.tsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DarkModeProvider>
      <ThemeWrapper>
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
            <WalletProvider autoConnect>
              <App />
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </ThemeWrapper>
    </DarkModeProvider>
  </React.StrictMode>,
);
