import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const supabase = supabaseServer();
    
    // Check if buyer exists
    const { data: existingBuyer } = await supabase
      .from("buyers")
      .select("*")
      .eq("phone", phone)
      .single();

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    if (existingBuyer) {
      // Update existing buyer's OTP
      await supabase
        .from("buyers")
        .update({ otp, otp_expires_at: expiresAt, updated_at: new Date().toISOString() })
        .eq("phone", phone);
    } else {
      // Create new buyer
      await supabase.from("buyers").insert({
        phone,
        otp,
        otp_expires_at: expiresAt,
        onboarded: false,
        profile_completed: false,
        created_at: new Date().toISOString(),
      });
    }

    // TODO: In production, send OTP via SMS (Twilio, etc.)
    console.log(`[BUYER AUTH] OTP for ${phone}: ${otp}`);

    return NextResponse.json({ 
      success: true, 
      message: "OTP sent successfully",
      // Remove in production! Only for demo
      otp: process.env.NODE_ENV === "development" ? otp : undefined
    });
  } catch (error: any) {
    console.error("[BUYER AUTH] Send OTP error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
