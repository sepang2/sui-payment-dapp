import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      where: {
        lumaLink: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        lumaLink: true,
      },
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error("Error fetching luma links:", error);
    return NextResponse.json({ error: "Failed to fetch luma links" }, { status: 500 });
  }
}
