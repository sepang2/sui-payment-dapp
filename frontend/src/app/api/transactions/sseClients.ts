export type SSEClient = {
  send: (data: string) => void;
  close: () => void;
};

export const clients: SSEClient[] = [];

export function notifyNewTransaction(transaction: any) {
  for (const client of clients) {
    client.send(JSON.stringify(transaction));
  }
}
