import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { notifyNewTransaction } from "./sseClients";

const prisma = new PrismaClient();

// Transaction 조회 (Consumer 또는 Store별)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");
    const userType = searchParams.get("userType"); // "consumer" or "store"
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!walletAddress || !userType) {
      return NextResponse.json({ error: "Wallet address and user type are required" }, { status: 400 });
    }

    let transactions;

    if (userType === "consumer") {
      // Consumer의 거래 내역 조회
      const consumer = await prisma.consumer.findUnique({
        where: { walletAddress },
      });

      if (!consumer) {
        return NextResponse.json({ error: "Consumer not found" }, { status: 404 });
      }

      transactions = await prisma.transaction.findMany({
        where: { consumerId: consumer.id },
        include: {
          store: {
            select: {
              name: true,
              walletAddress: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      });
    } else if (userType === "store") {
      // Store의 거래 내역 조회
      const store = await prisma.store.findUnique({
        where: { walletAddress },
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      transactions = await prisma.transaction.findMany({
        where: { storeId: store.id },
        include: {
          consumer: {
            select: {
              name: true,
              walletAddress: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      });
    } else {
      return NextResponse.json({ error: "Invalid user type. Must be 'consumer' or 'store'" }, { status: 400 });
    }

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Transaction 저장
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, txHash, fromAddress, toAddress } = body;

    if (!amount || !txHash || !fromAddress || !toAddress) {
      return NextResponse.json({ error: "Amount, txHash, fromAddress, and toAddress are required" }, { status: 400 });
    }

    // Consumer 찾기
    const consumer = await prisma.consumer.findUnique({
      where: { walletAddress: fromAddress },
    });

    if (!consumer) {
      return NextResponse.json({ error: "Consumer not found" }, { status: 404 });
    }

    // Store 찾기
    const store = await prisma.store.findUnique({
      where: { walletAddress: toAddress },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Transaction 저장 (기본 상태: PENDING)
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        txHash,
        consumerId: consumer.id,
        storeId: store.id,
        fromAddress,
        toAddress,
        status: "PENDING", // 새 거래는 항상 보류 상태로 시작
      },
      include: {
        consumer: {
          select: {
            name: true,
            walletAddress: true,
          },
        },
        store: {
          select: {
            name: true,
            walletAddress: true,
          },
        },
      },
    });

    // SSE로 알림 보내기
    notifyNewTransaction(transaction);

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);

    // 중복 txHash 에러 처리
    if ((error as any).code === "P2002" && (error as any).meta?.target?.includes("txHash")) {
      return NextResponse.json({ error: "Transaction with this hash already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
