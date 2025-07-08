import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        lumaUrl: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        lumaUrl: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching luma links:", error);
    return NextResponse.json({ error: "Failed to fetch luma links" }, { status: 500 });
  }
}
