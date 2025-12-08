import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST: Create match request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contractId, offeredPrice, message } = body;
    
    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID required' }, { status: 400 });
    }
    
    const supabase = createClient();
    
    // Get current user (buyer)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if contract exists and is open
    const { data: contract, error: contractError } = await supabase
      .from('hedge_contracts')
      .select('id, status, farmer_id, strike_price')
      .eq('id', contractId)
      .single();
    
    if (contractError || !contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    if (contract.status !== 'open') {
      return NextResponse.json({ error: 'Contract not available' }, { status: 400 });
    }
    
    // Create match request
    const { data: match, error } = await supabase
      .from('hedge_contract_matches')
      .insert({
        contract_id: contractId,
        buyer_id: user.id,
        offered_price: offeredPrice || contract.strike_price,
        message: message || null,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating match:', error);
      return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
    }
    
    // Update potential buyers count
    await supabase.rpc('increment_potential_buyers', { contract_id: contractId });
    
    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Get match requests for a contract or buyer
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');
    const buyerId = searchParams.get('buyerId');
    
    const supabase = createClient();
    
    let query = supabase
      .from('hedge_contract_matches')
      .select(`
        *,
        contract:hedge_contracts(*),
        buyer:profiles!hedge_contract_matches_buyer_id_fkey(id, full_name, business_name, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (contractId) {
      query = query.eq('contract_id', contractId);
    }
    
    if (buyerId) {
      query = query.eq('buyer_id', buyerId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching matches:', error);
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Accept/reject match request
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { matchId, action } = body; // action: 'accept' | 'reject'
    
    if (!matchId || !action) {
      return NextResponse.json({ error: 'Match ID and action required' }, { status: 400 });
    }
    
    const supabase = createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get match details
    const { data: match, error: matchError } = await supabase
      .from('hedge_contract_matches')
      .select('*, contract:hedge_contracts(farmer_id)')
      .eq('id', matchId)
      .single();
    
    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    
    // Verify user is the farmer
    if (match.contract.farmer_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    if (action === 'accept') {
      // Update match status
      await supabase
        .from('hedge_contract_matches')
        .update({ status: 'accepted' })
        .eq('id', matchId);
      
      // Update contract status to matched
      await supabase
        .from('hedge_contracts')
        .update({
          status: 'matched',
          buyer_id: match.buyer_id,
          matched_date: new Date().toISOString()
        })
        .eq('id', match.contract_id);
      
      // Reject other pending matches for this contract
      await supabase
        .from('hedge_contract_matches')
        .update({ status: 'rejected' })
        .eq('contract_id', match.contract_id)
        .neq('id', matchId)
        .eq('status', 'pending');
      
      return NextResponse.json({ message: 'Match accepted', status: 'matched' });
    } else if (action === 'reject') {
      await supabase
        .from('hedge_contract_matches')
        .update({ status: 'rejected' })
        .eq('id', matchId);
      
      return NextResponse.json({ message: 'Match rejected' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
