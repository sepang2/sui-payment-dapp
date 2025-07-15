import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 환불 트랜잭션 해시 저장 및 상태 변경 API
export async function POST(req: NextRequest) {
  try {
    const { transactionId, refundTxHash } = await req.json();

    if (!transactionId || !refundTxHash) {
      return NextResponse.json({ error: "transactionId and refundTxHash are required" }, { status: 400 });
    }

    // 트랜잭션 조회
    const transaction = await prisma.transaction.findUnique({
      where: { id: Number(transactionId) },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json(
        { error: `Transaction is already ${transaction.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // 환불 트랜잭션 해시 저장 및 상태 변경
    const updatedTransaction = await prisma.transaction.update({
      where: { id: Number(transactionId) },
      data: {
        refundTxHash,
        status: "REJECTED",
      },
    });

    return NextResponse.json({ success: true, transaction: updatedTransaction });
  } catch (error) {
    // 중복 refundTxHash 에러 처리
    if ((error as any).code === "P2002" && (error as any).meta?.target?.includes("refundTxHash")) {
      return NextResponse.json({ error: "Refund transaction hash already exists" }, { status: 409 });
    }
    console.error("Error processing refund:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
