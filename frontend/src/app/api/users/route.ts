import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 사용자 정보 조회 (지갑 주소로)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        walletAddress: walletAddress,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 사용자 정보 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, lumaUrl, walletAddress, qrCode } = body;

    if (!name || !walletAddress) {
      return NextResponse.json({ error: "Name and wallet address are required" }, { status: 400 });
    }

    // 이미 등록된 지갑 주소인지 확인
    const existingUser = await prisma.user.findUnique({
      where: {
        walletAddress: walletAddress,
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists for this wallet address" }, { status: 409 });
    }

    // 새 사용자 등록
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        lumaUrl: lumaUrl?.trim() || null,
        walletAddress: walletAddress,
        qrCode: qrCode || null,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 사용자 정보 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, lumaUrl, walletAddress, qrCode } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: {
        walletAddress: walletAddress,
      },
      data: {
        ...(name && { name: name.trim() }),
        description: description?.trim() || null,
        lumaUrl: lumaUrl?.trim() || null,
        ...(qrCode && { qrCode }),
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
