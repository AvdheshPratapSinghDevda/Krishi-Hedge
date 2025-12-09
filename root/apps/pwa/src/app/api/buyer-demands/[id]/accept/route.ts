import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { sendNotification } from "@/lib/notifications";
import { processAcceptedContract } from "@/lib/contractUtils";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { farmerId } = body || {};

    console.log('[BUYER-DEMAND-ACCEPT] Farmer accepting demand:', { id, farmerId });

    const supabase = supabaseServer();
    
    // Update the contract with farmer acceptance
    const { data, error } = await supabase
      .from('contracts')
      .update({ 
        status: 'ACCEPTED',
        farmer_id: farmerId,
        accepted_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('contract_type', 'BUYER_DEMAND')
      .eq('status', 'CREATED')
      .select()
      .single();

    if (error) {
      console.error('[BUYER-DEMAND-ACCEPT] Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Demand contract not found or already accepted' }, { status: 404 });
    }

    console.log('[BUYER-DEMAND-ACCEPT] Success:', data);

    // Generate and upload contract to IPFS (async, don't wait)
    processAcceptedContract(data.id, supabase).then(result => {
      if (result.success) {
        console.log('[BUYER-DEMAND-ACCEPT] Contract PDF generated and uploaded to IPFS:', result.cid);
      } else {
        console.error('[BUYER-DEMAND-ACCEPT] Failed to generate PDF:', result.error);
      }
    }).catch(err => console.error('[BUYER-DEMAND-ACCEPT] PDF generation error:', err));

    // Send notification to buyer
    if (data.buyer_id) {
      await sendNotification(
        data.buyer_id,
        'Demand Accepted! 🎉',
        `A farmer has accepted your demand for ${data.quantity} ${data.unit} of ${data.crop} at ₹${data.strike_price}/${data.unit}.`,
        'contract',
        { contractId: data.id, farmerId }
      );

      // Push notification
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/push/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.buyer_id,
            title: 'Demand Accepted! 🎉',
            message: `A farmer accepted your demand for ${data.quantity} ${data.unit} of ${data.crop}.`,
            url: `/contracts/${data.id}`,
            requireInteraction: true,
          }),
        });
      } catch (pushError) {
        console.error('[PUSH] Failed to send push notification:', pushError);
      }
    }

    // Send notification to farmer
    if (farmerId) {
      await sendNotification(
        farmerId,
        'Contract Accepted!',
        `You accepted a buyer demand for ${data.quantity} ${data.unit} of ${data.crop} at ₹${data.strike_price}/${data.unit}.`,
        'contract',
        { contractId: data.id, buyerId: data.buyer_id }
      );
    }

    return NextResponse.json({ 
      success: true,
      contract: {
        id: data.id,
        status: data.status,
        farmerId: data.farmer_id,
        buyerId: data.buyer_id
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error("[BUYER-DEMAND-ACCEPT] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
