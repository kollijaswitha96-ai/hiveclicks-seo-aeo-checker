import { NextRequest, NextResponse } from "next/server";
import { runFullAudit } from "@/lib/auditEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid website URL is required." },
        { status: 400 }
      );
    }

    const result = await runFullAudit(url);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Audit API Error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to audit website. Please check the URL and try again.",
      },
      { status: 500 }
    );
  }
}
