import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 특정 거래의 상태 업데이트 (승인/거절)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, storeWalletAddress } = body;
    const transactionId = parseInt(id);

    // 필수 필드 검증
    if (!status || !storeWalletAddress || !transactionId) {
      return NextResponse.json(
        { error: "Status, storeWalletAddress, and transaction ID are required" },
        { status: 400 }
      );
    }

    // 유효한 상태 값인지 검증
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Status must be either 'APPROVED' or 'REJECTED'" }, { status: 400 });
    }

    // 거래 존재 여부 및 권한 확인
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        store: {
          walletAddress: storeWalletAddress,
        },
      },
      include: {
        store: {
          select: {
            name: true,
            walletAddress: true,
          },
        },
        consumer: {
          select: {
            name: true,
            walletAddress: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found or you don't have permission to modify it" },
        { status: 404 }
      );
    }

    // 이미 처리된 거래인지 확인
    if (transaction.status !== "PENDING") {
      return NextResponse.json(
        { error: `Transaction is already ${transaction.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // 거래 상태 업데이트
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
      include: {
        store: {
          select: {
            name: true,
            walletAddress: true,
          },
        },
        consumer: {
          select: {
            name: true,
            walletAddress: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `Transaction ${status.toLowerCase()} successfully`,
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating transaction status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 특정 거래 조회
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const transactionId = parseInt(id);

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        store: {
          select: {
            name: true,
            walletAddress: true,
          },
        },
        consumer: {
          select: {
            name: true,
            walletAddress: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
