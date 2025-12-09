import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id;
    
    const supabase = await createClient();
    
    const { data: contract, error } = await supabase
      .from('hedge_contracts')
      .select(`
        *,
        farmer:profiles!hedge_contracts_farmer_id_fkey(id, full_name, phone),
        buyer:profiles!hedge_contracts_buyer_id_fkey(id, full_name, business_name, phone),
        fpo:fpos(id, name, registration_number)
      `)
      .eq('id', contractId)
      .single();
    
    if (error) {
      console.error('Error fetching contract:', error);
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    return NextResponse.json(contract);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
