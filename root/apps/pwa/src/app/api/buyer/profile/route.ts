import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");

    if (!buyerId) {
      return NextResponse.json({ error: "Buyer ID required" }, { status: 400 });
    }

    const supabase = supabaseServer();
    
    const { data: buyer, error } = await supabase
      .from("buyers")
      .select("*")
      .eq("id", buyerId)
      .single();

    if (error || !buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    return NextResponse.json(buyer);
  } catch (error: any) {
    console.error("[BUYER] Get profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buyerId, ...updates } = body;

    if (!buyerId) {
      return NextResponse.json({ error: "Buyer ID required" }, { status: 400 });
    }

    const supabase = supabaseServer();
    
    const { data, error } = await supabase
      .from("buyers")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", buyerId)
      .select()
      .single();

    if (error) {
      console.error("[BUYER] Update profile error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BUYER] Update profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
