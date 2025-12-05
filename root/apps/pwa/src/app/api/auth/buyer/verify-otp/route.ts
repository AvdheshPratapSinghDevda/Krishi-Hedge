import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
    }

    const supabase = supabaseServer();
    
    // Get buyer with OTP
    const { data: buyer, error } = await supabase
      .from("buyers")
      .select("*")
      .eq("phone", phone)
      .single();

    if (error || !buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    // Check OTP expiry
    const otpExpiry = new Date(buyer.otp_expires_at);
    if (otpExpiry < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // Verify OTP
    if (buyer.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Clear OTP after successful verification
    await supabase
      .from("buyers")
      .update({ otp: null, otp_expires_at: null })
      .eq("phone", phone);

    // Return buyer session data
    return NextResponse.json({ 
      success: true,
      buyer: {
        id: buyer.id,
        phone: buyer.phone,
        name: buyer.name,
        organization_name: buyer.organization_name,
        buyer_type: buyer.buyer_type,
        onboarded: buyer.onboarded || false
      }
    });
  } catch (error: any) {
    console.error("[BUYER AUTH] Verify OTP error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
