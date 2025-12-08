import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("phone, otp_code, otp_expires_at")
      .eq("phone", phone)
      .single();

    if (existingProfile) {
      // Update existing profile's OTP
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          otp_code: otp, 
          otp_expires_at: expiresAt 
        })
        .eq("phone", phone);
      
      if (updateError) {
        console.error("[AUTH] Error updating OTP:", updateError);
        return NextResponse.json({ error: "Failed to update OTP" }, { status: 500 });
      }
    } else {
      // Store OTP temporarily for new users
      console.log(`[AUTH] New user - OTP will be verified before profile creation`);
    }

    // TODO: In production, send OTP via SMS (Twilio, MSG91, etc.)
    console.log(`[AUTH] OTP for ${phone}: ${otp}`);

    // Store in session/temp for verification
    const tempOtpData = {
      phone,
      otp,
      expiresAt,
      timestamp: Date.now()
    };

    return NextResponse.json({ 
      success: true, 
      message: "OTP sent successfully",
      // ONLY for development - remove in production
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
      sessionData: Buffer.from(JSON.stringify(tempOtpData)).toString('base64')
    });
  } catch (error: any) {
    console.error("[AUTH] Send OTP error:", error);
    return NextResponse.json({ error: error.message || "Failed to send OTP" }, { status: 500 });
  }
}
