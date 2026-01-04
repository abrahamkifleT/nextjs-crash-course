import connectToDatabase from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ message: "Successfully connected to MongoDB!" });
  } catch (error) {
    console.error("Database connection failed:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
