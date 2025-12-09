import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Fetch all hedge contracts or filter by user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    
    const supabase = await createClient();
    
    let query = supabase
      .from('hedge_contracts')
      .select(`
        *,
        farmer:profiles!hedge_contracts_farmer_id_fkey(id, full_name, phone),
        fpo:fpos(id, name, registration_number)
      `)
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('farmer_id', userId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching hedge contracts:', error);
      return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new hedge contract
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      commodity,
      quantity,
      hedgeType,
      strikePrice,
      expiryMonths,
      fpoId,
      notes,
      premium
    } = body;
    
    // Validate required fields
    if (!commodity || !quantity || !strikePrice || !hedgeType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Get current user (farmer)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + parseInt(expiryMonths));
    
    // Get current market price from ML API or use strike price as fallback
    let currentMarketPrice = parseFloat(strikePrice);
    try {
      const mlResponse = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity,
          state: 'average',
          district: 'average',
          market: 'average'
        })
      });
      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        currentMarketPrice = mlData.predicted_price || currentMarketPrice;
      }
    } catch (mlError) {
      console.log('ML API not available, using strike price as market price');
    }
    
    // Create hedge contract
    const { data: contract, error } = await supabase
      .from('hedge_contracts')
      .insert({
        farmer_id: user.id,
        fpo_id: fpoId || null,
        commodity,
        quantity: parseFloat(quantity),
        hedge_type: hedgeType,
        strike_price: parseFloat(strikePrice),
        current_market_price: currentMarketPrice,
        premium: parseFloat(premium),
        contract_date: new Date().toISOString(),
        expiry_date: expiryDate.toISOString(),
        status: 'open',
        notes: notes || null,
        potential_buyers: 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating hedge contract:', error);
      return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
    }
    
    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
