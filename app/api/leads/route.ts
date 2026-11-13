import { NextRequest, NextResponse } from "next/server";
import { saveLead, getAllLeads, convertLeadsToCsv } from "@/lib/leadStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, website, company, phone, scores } = body;

    if (!name || !email || !website) {
      return NextResponse.json(
        { error: "Name, email, and website are required." },
        { status: 400 }
      );
    }

    const saved = await saveLead({
      name,
      email,
      website,
      company,
      phone,
      scores,
    });

    return NextResponse.json({ success: true, lead: saved });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to record lead." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");
    const leads = await getAllLeads();

    if (format === "csv") {
      const csv = convertLeadsToCsv(leads);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="hiveclicks_leads_${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve leads." },
      { status: 500 }
    );
  }
}
