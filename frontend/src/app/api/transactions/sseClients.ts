export type SSEClient = {
  send: (data: string) => void;
  close: () => void;
  walletAddress: string;
  userType: "consumer" | "store";
};

export const clients: SSEClient[] = [];

export function notifyNewTransaction(transaction: any) {
  for (const client of clients) {
    client.send(JSON.stringify(transaction));
  }
}

export function notifyTransactionStatusUpdate(
  transaction: any,
  consumerWalletAddress: string
) {
  // 특정 consumer에게만 알림 전송
  const consumerClients = clients.filter(
    (client) => client.walletAddress === consumerWalletAddress && client.userType === "consumer"
  );
  
  for (const client of consumerClients) {
    client.send(JSON.stringify({
      type: "transaction_status_update",
      transaction
    }));
  }
}
