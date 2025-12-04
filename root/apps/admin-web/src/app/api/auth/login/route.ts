import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseServer } from "@/lib/supabaseServer";

const JWT_SECRET = process.env.JWT_SECRET || "krishi-hedge-admin-secret-key-change-in-production";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const supabase = supabaseServer();
    
    // Fetch admin user from admin_users table
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Update last login
    await supabase
      .from("admin_users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", admin.id);

    // Create JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        user_type: admin.user_type,
        name: admin.name
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        user_type: admin.user_type,
      },
    });

    console.log('[Admin Login] Setting cookie with token');

    // Set HTTP-only cookie
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: false, // Set to false for localhost development
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log('[Admin Login] Login successful for:', admin.email);

    return response;
  } catch (error: any) {
    console.error("[Admin Login] Error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
