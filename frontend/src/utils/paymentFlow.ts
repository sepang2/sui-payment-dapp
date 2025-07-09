export interface PaymentFlowData {
  scanResult?: {
    walletAddress: string;
    name: string;
  };
  amount?: string;
  receiverWalletAddress?: string;
  receiverName?: string;

  // 새로운 결제 플로우 속성들
  name?: string;
  walletAddress?: string;
  step?: "scan" | "amount" | "confirm" | "success";
}

const PAYMENT_FLOW_KEY = "payment-flow-data";

export const savePaymentFlowData = (data: Partial<PaymentFlowData>) => {
  const existing = getPaymentFlowData();
  const updated = { ...existing, ...data };
  localStorage.setItem(PAYMENT_FLOW_KEY, JSON.stringify(updated));
};

export const getPaymentFlowData = (): PaymentFlowData => {
  try {
    const data = localStorage.getItem(PAYMENT_FLOW_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const clearPaymentFlowData = () => {
  localStorage.removeItem(PAYMENT_FLOW_KEY);
  localStorage.removeItem("payment-flow-active");
  localStorage.removeItem("qr-scan-result");
};

export const setPaymentFlowActive = (active: boolean) => {
  if (active) {
    localStorage.setItem("payment-flow-active", "true");
  } else {
    localStorage.removeItem("payment-flow-active");
  }
};

export const isPaymentFlowActive = (): boolean => {
  return localStorage.getItem("payment-flow-active") === "true";
};

export const isNewPaymentFlowActive = (): boolean => {
  const flowData = getPaymentFlowData();
  return !!flowData.step;
};
