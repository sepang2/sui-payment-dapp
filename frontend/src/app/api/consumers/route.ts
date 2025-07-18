import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Consumer 정보 조회 (지갑 주소로)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    const consumer = await prisma.consumer.findUnique({
      where: {
        walletAddress: walletAddress,
      },
    });

    return NextResponse.json({ consumer });
  } catch (error) {
    console.error("Error fetching consumer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Consumer 정보 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    // 이미 등록된 지갑 주소인지 확인
    const existingConsumer = await prisma.consumer.findUnique({
      where: {
        walletAddress: walletAddress,
      },
    });

    if (existingConsumer) {
      return NextResponse.json({ error: "Consumer already exists for this wallet address" }, { status: 409 });
    }

    // 새 Consumer 등록
    const consumer = await prisma.consumer.create({
      data: {
        name: name?.trim() || null,
        walletAddress: walletAddress,
      },
    });

    return NextResponse.json({ consumer }, { status: 201 });
  } catch (error) {
    console.error("Error creating consumer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Consumer 정보 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name?.trim() || null;

    const consumer = await prisma.consumer.update({
      where: {
        walletAddress: walletAddress,
      },
      data: updateData,
    });

    return NextResponse.json({ consumer });
  } catch (error) {
    console.error("Error updating consumer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
