import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";

/**
 * SUI를 MIST 단위로 변환
 */
export function suiToMist(sui: number): string {
  return (sui * Number(MIST_PER_SUI)).toString();
}

/**
 * MIST를 SUI 단위로 변환
 */
export function mistToSui(mist: string): number {
  return Number(mist) / Number(MIST_PER_SUI);
}

/**
 * SUI 전송 트랜잭션 생성
 */
export function createSuiTransferTransaction(
  recipient: string,
  amount: number,
): Transaction {
  const tx = new Transaction();

  const [coin] = tx.splitCoins(tx.gas, [suiToMist(amount)]);
  tx.transferObjects([coin], recipient);

  return tx;
}

/**
 * 트랜잭션 결과 포맷팅
 */
export function formatTransactionDigest(digest: string): string {
  return `${digest.slice(0, 6)}...${digest.slice(-6)}`;
}
