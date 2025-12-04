import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const supabase = supabaseServer();
    
    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingAdmin) {
      return NextResponse.json({ error: "Admin with this email already exists" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const { data: newAdmin, error } = await supabase
      .from("admin_users")
      .insert({
        email,
        password_hash: passwordHash,
        name,
        user_type: "admin",
      })
      .select()
      .single();

    if (error) {
      console.error("[Admin Signup] Database error:", error);
      return NextResponse.json({ error: "Failed to create admin account" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        user_type: newAdmin.user_type,
      },
    });
  } catch (error: any) {
    console.error("[Admin Signup] Error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
