import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, sessionData } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Decode session data
    let storedOtp = null;
    let storedExpiry = null;
    
    if (sessionData) {
      try {
        const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString());
        storedOtp = decoded.otp;
        storedExpiry = decoded.expiresAt;
      } catch (e) {
        console.error("Failed to decode session data");
      }
    }
    
    // Check existing profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("phone", phone)
      .single();

    let otpToVerify = storedOtp;
    let expiryToCheck = storedExpiry;

    if (profile && profile.otp_code) {
      otpToVerify = profile.otp_code;
      expiryToCheck = profile.otp_expires_at;
    }

    if (!otpToVerify) {
      return NextResponse.json({ error: "OTP not found. Please request a new one." }, { status: 404 });
    }

    // Check OTP expiry
    const otpExpiry = new Date(expiryToCheck);
    if (otpExpiry < new Date()) {
      return NextResponse.json({ error: "OTP expired. Please request a new one." }, { status: 400 });
    }

    // ACTUALLY VERIFY OTP - This was broken!
    if (otpToVerify !== otp) {
      console.log(`[AUTH] OTP mismatch: Expected ${otpToVerify}, got ${otp}`);
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    console.log(`[AUTH] ✅ OTP verified successfully for ${phone}`);

    // Clear OTP after successful verification
    if (profile) {
      await supabase
        .from("profiles")
        .update({ otp_code: null, otp_expires_at: null })
        .eq("phone", phone);
    }

    // Return user session data
    return NextResponse.json({ 
      success: true,
      user: profile ? {
        id: profile.id,
        phone: profile.phone,
        userType: profile.user_type,
        fullName: profile.full_name,
        businessName: profile.business_name,
        isOnboarded: !!profile.full_name || !!profile.business_name
      } : {
        phone,
        isOnboarded: false,
        isNewUser: true
      }
    });
  } catch (error: any) {
    console.error("[AUTH] Verify OTP error:", error);
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 });
  }
}
