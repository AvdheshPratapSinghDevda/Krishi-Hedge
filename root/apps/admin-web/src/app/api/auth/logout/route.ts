import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });

    // Clear the admin token cookie
    response.cookies.delete("admin_token");

    return response;
  } catch (error: any) {
    console.error("[Admin Logout] Error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
