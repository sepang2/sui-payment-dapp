import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// uniqueId로 Store 정보 조회
export async function GET(request: NextRequest, { params }: { params: Promise<{ uniqueId: string }> }) {
  try {
    const { uniqueId } = await params;

    if (!uniqueId) {
      return NextResponse.json({ error: "Unique ID is required" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: {
        uniqueId: uniqueId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        walletAddress: true,
        uniqueId: true,
        lumaLink: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Error fetching store by uniqueId:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
