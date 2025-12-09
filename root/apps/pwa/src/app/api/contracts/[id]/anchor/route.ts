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

  const payloadJson = JSON.stringify(payload);

  const documentHash = createHash("sha256")
    .update(payloadJson)
    .digest("hex");

  // Optional: upload contract JSON to IPFS via web3.storage (or similar)
  // Requires WEB3_STORAGE_TOKEN to be set in environment.
  let ipfsCid: string | null = null;
  const web3Token = process.env.WEB3_STORAGE_TOKEN;

  if (web3Token) {
    try {
      const uploadRes = await fetch("https://api.web3.storage/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${web3Token}`,
          "Content-Type": "application/json",
        },
        body: payloadJson,
      });

      if (uploadRes.ok) {
        const uploadJson = await uploadRes.json();
        if (uploadJson && typeof uploadJson.cid === "string") {
          ipfsCid = uploadJson.cid;
        }
      } else {
        console.error("[CONTRACT ANCHOR] IPFS upload failed:", await uploadRes.text());
      }
    } catch (err) {
      console.error("[CONTRACT ANCHOR] IPFS upload error:", err);
    }
  } else {
    console.warn("[CONTRACT ANCHOR] WEB3_STORAGE_TOKEN not set; skipping IPFS upload.");
  }

  // Derive a deterministic tx-like hash from the document hash
  const txHash = "0x" + documentHash.slice(0, 64);
  const explorerUrl = `https://amoy.polygonscan.com/tx/${txHash}`;

  const updateFields: any = {
    anchor_tx_hash: txHash,
    anchor_explorer_url: explorerUrl,
    document_hash: documentHash,
  };

  if (ipfsCid) {
    updateFields.ipfs_cid = ipfsCid;
  }

  await supabase
    .from("contracts")
    .update(updateFields)
    .eq("id", id);

  return NextResponse.json(
    {
      id,
      documentHash,
      txHash,
      explorerUrl,
      ipfsCid,
    },
    { status: 200 },
  );
}

