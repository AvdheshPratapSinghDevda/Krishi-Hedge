import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "krishi-hedge-admin-secret-key-change-in-production";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      return NextResponse.json({
        authenticated: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          user_type: decoded.user_type,
        },
      });
    } catch (jwtError) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error: any) {
    console.error("[Admin Me] Error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
