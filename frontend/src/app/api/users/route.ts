import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserType } from "@prisma/client";

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
    const { name, description, lumaUrl, walletAddress, qrCode, userType } = body;

    if (!name || !walletAddress) {
      return NextResponse.json({ error: "Name and wallet address are required" }, { status: 400 });
    }

    // userType 유효성 검사
    if (userType && !Object.values(UserType).includes(userType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
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
        userType: userType || UserType.CONSUMER, // 기본값은 CONSUMER
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
    const { name, description, lumaUrl, walletAddress, qrCode, userType } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    // userType 유효성 검사
    if (userType && !Object.values(UserType).includes(userType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (lumaUrl !== undefined) updateData.lumaUrl = lumaUrl?.trim() || null;
    if (qrCode) updateData.qrCode = qrCode;
    if (userType) updateData.userType = userType;

    const user = await prisma.user.update({
      where: {
        walletAddress: walletAddress,
      },
      data: updateData,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
