import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get('role'); // 'farmer' or 'buyer'
    const userId = searchParams.get('userId');
    const farmerId = searchParams.get('farmerId');
    const buyerId = searchParams.get('buyerId');
    const contractType = searchParams.get('type'); // 'FARMER_OFFER' or 'BUYER_DEMAND'
    const status = searchParams.get('status'); // 'CREATED', 'ACCEPTED', etc.

    const supabase = supabaseServer();
    let query = supabase
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false });

    // Filter by contract type
    if (contractType) {
      query = query.eq('contract_type', contractType);
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by role
    if (role === 'farmer' || farmerId) {
      const id = farmerId || userId;
      if (id) {
        query = query.eq('farmer_id', id);
      }
    } else if (role === 'buyer' || buyerId) {
      const id = buyerId || userId;
      if (id) {
        // Buyers see contracts they've accepted
        query = query.eq('buyer_id', id);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('[CONTRACTS] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return empty array if no data (not an error)
    if (!data || data.length === 0) {
      return NextResponse.json([], { status: 200 });
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
      documentHash: (row as any).document_hash,
      hedgeType: (row as any).hedge_type || 'fixed_price',
      premiumPerQtl: (row as any).premium_per_qtl ?? null,
      ipfsCid: (row as any).ipfs_cid ?? null,
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch (error: any) {
    console.error("[CONTRACTS] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      crop,
      quantity,
      unit,
      targetPrice,
      deliveryWindow,
      userId,
      hedgeType,
      premiumPerQtl,
      contractType, // 'FARMER_OFFER' or undefined for legacy
    } = body || {};

    console.log('[CONTRACTS] POST request:', { crop, quantity, unit, targetPrice, deliveryWindow, userId, contractType });

    if (!crop || !quantity || !unit || !targetPrice || !deliveryWindow) {
      console.error('[CONTRACTS] Missing required fields:', { crop, quantity, unit, targetPrice, deliveryWindow });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate UUID format - farmer_id must be valid UUID or null
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidUUID = userId && uuidRegex.test(userId);
    
    if (userId && !isValidUUID) {
      console.warn('[CONTRACTS] Invalid UUID format for userId, setting to null:', userId);
    }

    const supabase = supabaseServer();
    const insertRow: any = {
      crop,
      quantity: Number(quantity),
      unit,
      strike_price: Number(targetPrice),
      deliverywindow: deliveryWindow,
      status: "CREATED",
      farmer_id: isValidUUID ? userId : null,
      contract_type: contractType || 'FARMER_OFFER', // Default to FARMER_OFFER
    };

    // Optional F&O-style hedge fields (columns must exist in Supabase contracts table)
    if (hedgeType) {
      insertRow.hedge_type = hedgeType;
    }
    if (typeof premiumPerQtl === 'number' && !Number.isNaN(premiumPerQtl)) {
      insertRow.premium_per_qtl = premiumPerQtl;
    }

    console.log('[CONTRACTS] Inserting:', insertRow);

    const { data, error } = await supabase
      .from("contracts")
      .insert(insertRow)
      .select("*")
      .single();

    if (error) {
      console.error('[CONTRACTS] Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[CONTRACTS] Success:', data);

    const contract = {
      id: data.id,
      crop: data.crop,
      quantity: data.quantity,
      unit: data.unit,
      strikePrice: data.strike_price,
      deliveryWindow: data.deliverywindow,
      status: data.status,
      createdAt: data.created_at,
      pdfUrl: data.pdf_url,
      anchorTxHash: data.anchor_tx_hash,
      anchorExplorerUrl: data.anchor_explorer_url,
      hedgeType: (data as any).hedge_type || 'fixed_price',
      premiumPerQtl: (data as any).premium_per_qtl ?? null,
    };

    // Send in-app notification to farmer
    if (userId) {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Contract Created',
        message: `Your ${crop} contract for ${quantity} ${unit} has been created successfully.`,
        type: 'contract',
        read: false,
      });
    }

    return NextResponse.json(contract, { status: 201 });
  } catch (e: any) {
    console.error('[CONTRACTS] Exception:', e);
    return NextResponse.json({ error: e.message || "Invalid JSON" }, { status: 400 });
  }
}
