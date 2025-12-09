import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// GET: Fetch all buyer demand contracts (for farmers to browse)
export async function GET(req: NextRequest) {
  try {
    const supabase = supabaseServer();
    const { searchParams } = new URL(req.url);
    const farmerId = searchParams.get('farmerId');
    const buyerId = searchParams.get('buyerId');
    
    let query = supabase
      .from("contracts")
      .select("*")
      .eq('contract_type', 'BUYER_DEMAND');

    // If farmerId is provided, fetch accepted demands for that farmer
    // If buyerId is provided, fetch all demands created by that buyer
    // Otherwise, fetch available demands for browsing
    if (farmerId) {
      query = query.eq('farmer_id', farmerId).eq('status', 'ACCEPTED');
    } else if (buyerId) {
      query = query.eq('buyer_id', buyerId);
    } else {
      query = query.eq('status', 'CREATED');
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error('[BUYER-DEMANDS] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (data || []).map((row: any) => ({
      id: row.id,
      crop: row.crop,
      quantity: row.quantity,
      unit: row.unit,
      strikePrice: row.strike_price,
      deliveryWindow: row.deliverywindow,
      status: row.status,
      contractType: row.contract_type,
      contract_type: row.contract_type,
      buyerId: row.buyer_id,
      farmerId: row.farmer_id,
      createdAt: row.created_at,
      acceptedAt: row.accepted_at,
      accepted_at: row.accepted_at,
      ipfsCid: row.ipfs_cid,
      ipfs_cid: row.ipfs_cid,
      documentHash: row.document_hash,
      pdfUrl: row.pdf_url,
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch (error: any) {
    console.error("[BUYER-DEMANDS] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new buyer demand contract
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { crop, quantity, unit, strikePrice, deliveryWindow, buyerId } = body || {};

    console.log('[BUYER-DEMANDS] POST request:', { crop, quantity, unit, strikePrice, deliveryWindow, buyerId });

    if (!crop || !quantity || !unit || !strikePrice || !deliveryWindow) {
      console.error('[BUYER-DEMANDS] Missing required fields');
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = supabaseServer();
    const insertRow = {
      crop,
      quantity: Number(quantity),
      unit,
      strike_price: Number(strikePrice),
      deliverywindow: deliveryWindow,
      contract_type: 'BUYER_DEMAND',
      status: "CREATED",
      buyer_id: buyerId || null,
    };

    console.log('[BUYER-DEMANDS] Inserting:', insertRow);

    const { data, error } = await supabase
      .from("contracts")
      .insert(insertRow)
      .select("*")
      .single();

    if (error) {
      console.error('[BUYER-DEMANDS] Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[BUYER-DEMANDS] Success:', data);

    const demand = {
      id: data.id,
      crop: data.crop,
      quantity: data.quantity,
      unit: data.unit,
      strikePrice: data.strike_price,
      deliveryWindow: data.deliverywindow,
      status: data.status,
      contractType: data.contract_type,
      buyerId: data.buyer_id,
      createdAt: data.created_at,
    };

    // Send in-app notification to buyer
    if (buyerId) {
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: buyerId,
        title: 'Demand Contract Created',
        message: `Your demand for ${quantity} ${unit} of ${crop} at ₹${strikePrice}/${unit} has been posted. Farmers can now see and accept it.`,
        type: 'contract',
        metadata: { contractId: data.id }
      });
      if (notifError) console.error('Notification error:', notifError);
    }

    return NextResponse.json(demand, { status: 201 });
  } catch (error: any) {
    console.error("[BUYER-DEMANDS] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
