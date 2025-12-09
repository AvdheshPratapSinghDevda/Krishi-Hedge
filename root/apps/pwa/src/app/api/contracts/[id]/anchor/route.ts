import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { createHash } from "crypto";

// Compute a real SHA-256 hash of the contract data and derive a deterministic
// demo transaction hash + Polygon Amoy explorer URL. In production, this is
// where you would call a signing service to submit an on-chain transaction.

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Contract not found" }, { status: 404 });
  }

  const payload = {
    id: data.id,
    crop: data.crop,
    quantity: data.quantity,
    unit: data.unit,
    strike_price: data.strike_price,
    deliverywindow: data.deliverywindow,
    status: data.status,
    farmer_id: data.farmer_id,
    buyer_id: data.buyer_id,
    // fpo_id is optional; only present if you extend the schema
    fpo_id: (data as any).fpo_id ?? null,
    created_at: data.created_at,
  };

  const documentHash = createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  // Derive a deterministic tx-like hash from the document hash
  const txHash = "0x" + documentHash.slice(0, 64);
  const explorerUrl = `https://amoy.polygonscan.com/tx/${txHash}`;

  await supabase
    .from("contracts")
    .update({ anchor_tx_hash: txHash, anchor_explorer_url: explorerUrl, document_hash: documentHash })
    .eq("id", id);

  return NextResponse.json(
    {
      id,
      documentHash,
      txHash,
      explorerUrl,
    },
    { status: 200 },
  );
}

