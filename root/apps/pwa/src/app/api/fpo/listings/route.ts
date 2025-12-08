/**
 * FPO Commodity Listings API
 * GET /api/fpo/listings - Get all commodity listings with filters
 * POST /api/fpo/listings - Create new commodity listing
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const fpoId = searchParams.get('fpo_id');
    const commodity = searchParams.get('commodity');
    const status = searchParams.get('status') || 'active';
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = createClient();

    let query = supabase
      .from('fpo_commodity_listings')
      .select(`
        *,
        fpo:fpos(
          id,
          fpo_name,
          district,
          state,
          phone,
          email,
          certifications,
          is_verified
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (fpoId) {
      query = query.eq('fpo_id', fpoId);
    }

    if (commodity) {
      query = query.ilike('commodity_name', `%${commodity}%`);
    }

    if (minPrice) {
      query = query.gte('price_per_unit', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price_per_unit', parseFloat(maxPrice));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, count: data?.length || 0 });
  } catch (e: any) {
    console.error('[FPO Listings] GET error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fpo_id,
      commodity_name,
      variety,
      grade,
      available_quantity,
      unit,
      price_per_unit,
      min_order_quantity,
      price_negotiable,
      quality_parameters,
      certifications,
      harvest_date,
      available_from,
      available_until,
      storage_location,
      delivery_options,
      images
    } = body;

    if (!fpo_id || !commodity_name || !available_quantity || !unit || !price_per_unit) {
      return NextResponse.json(
        { error: 'Missing required fields: fpo_id, commodity_name, available_quantity, unit, price_per_unit' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const insertData = {
      fpo_id,
      commodity_name,
      variety,
      grade,
      available_quantity,
      unit,
      price_per_unit,
      min_order_quantity,
      price_negotiable: price_negotiable !== false,
      quality_parameters,
      certifications: certifications || [],
      harvest_date,
      available_from: available_from || new Date().toISOString().split('T')[0],
      available_until,
      storage_location,
      delivery_options: delivery_options || ['FPO Warehouse'],
      images: images || [],
      status: 'active'
    };

    const { data, error } = await supabase
      .from('fpo_commodity_listings')
      .insert(insertData)
      .select(`
        *,
        fpo:fpos(
          id,
          fpo_name,
          district,
          state
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e: any) {
    console.error('[FPO Listings] POST error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('fpo_commodity_listings')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        fpo:fpos(
          id,
          fpo_name,
          district,
          state
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error('[FPO Listings] PATCH error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const supabase = createClient();

    const { error } = await supabase
      .from('fpo_commodity_listings')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Listing deleted successfully' });
  } catch (e: any) {
    console.error('[FPO Listings] DELETE error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
