import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import dummyContracts from "@/data/dummyContracts";

export async function GET(req: NextRequest) {
  try {
    const supabase = supabaseServer();
    
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error('[Admin API] Contracts fetch error:', error);
      // Return dummy data as fallback
      return NextResponse.json(dummyContracts, { status: 200 });
    }

    const mapped = (data || []).map((row: any) => ({
      id: row.id,
      crop: row.crop,
      quantity: row.quantity,
      unit: row.unit,
      strikePrice: row.strike_price,
      deliveryWindow: row.deliverywindow,
      status: row.status,
      createdAt: row.created_at,
      farmerId: row.farmer_id,
      buyerId: row.buyer_id,
      pdfUrl: row.pdf_url,
      anchorTxHash: row.anchor_tx_hash,
      anchorExplorerUrl: row.anchor_explorer_url,
    }));

    return NextResponse.json(mapped.length > 0 ? mapped : dummyContracts, { status: 200 });
  } catch (error: any) {
    console.error("[Admin API] Contracts GET error:", error);
    // Return dummy data as fallback on error
    return NextResponse.json(dummyContracts, { status: 200 });
  }
}

