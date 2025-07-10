import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

// 고유 ID 생성 함수
function generateUniqueId(): string {
  return randomBytes(16).toString("hex");
}

// Store 정보 조회 (지갑 주소로)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: {
        walletAddress: walletAddress,
      },
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Error fetching store:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Store 정보 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, walletAddress, lumaLink } = body;

    if (!name || !walletAddress) {
      return NextResponse.json({ error: "Name and wallet address are required" }, { status: 400 });
    }

    // 이미 등록된 지갑 주소인지 확인
    const existingStore = await prisma.store.findUnique({
      where: {
        walletAddress: walletAddress,
      },
    });

    if (existingStore) {
      return NextResponse.json({ error: "Store already exists for this wallet address" }, { status: 409 });
    }

    // 고유 ID 생성 (중복 체크 포함)
    let uniqueId: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      uniqueId = generateUniqueId();
      const existingWithId = await prisma.store.findUnique({
        where: { uniqueId },
      });
      if (!existingWithId) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ error: "Failed to generate unique ID" }, { status: 500 });
    }

    // 새 Store 등록
    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        walletAddress: walletAddress,
        uniqueId: uniqueId!,
        lumaLink: lumaLink?.trim() || null,
      },
    });

    return NextResponse.json({ store }, { status: 201 });
  } catch (error) {
    console.error("Error creating store:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Store 정보 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, walletAddress, lumaLink, qrCode } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (lumaLink !== undefined) updateData.lumaLink = lumaLink?.trim() || null;
    if (qrCode !== undefined) updateData.qrCode = qrCode;

    const store = await prisma.store.update({
      where: {
        walletAddress: walletAddress,
      },
      data: updateData,
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Error updating store:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
