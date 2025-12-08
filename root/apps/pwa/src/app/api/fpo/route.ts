/**
 * FPO API - Get all FPOs or single FPO by ID
 * GET /api/fpo - List all FPOs with filters
 * GET /api/fpo?id=<uuid> - Get single FPO details
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const fpoId = searchParams.get('id');
    const district = searchParams.get('district');
    const state = searchParams.get('state');
    const crop = searchParams.get('crop');
    const verified = searchParams.get('verified');

    const supabase = supabaseServer();

    // Get single FPO by ID
    if (fpoId) {
      const { data, error } = await supabase
        .from('fpos')
        .select('*')
        .eq('id', fpoId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json({ success: true, data });
    }

    // List FPOs with filters
    let query = supabase
      .from('fpos')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (district) {
      query = query.eq('district', district);
    }

    if (state) {
      query = query.eq('state', state);
    }

    if (crop) {
      query = query.contains('primary_crops', [crop]);
    }

    if (verified === 'true') {
      query = query.eq('is_verified', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, count: data?.length || 0 });
  } catch (e: any) {
    console.error('[FPO API] GET error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * POST /api/fpo - Register new FPO
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fpo_name,
      registration_number,
      phone,
      email,
      district,
      state,
      fpo_type,
      primary_crops,
      admin_contact_person,
      description
    } = body;

    if (!fpo_name || !registration_number || !phone || !district || !state) {
      return NextResponse.json(
        { error: 'Missing required fields: fpo_name, registration_number, phone, district, state' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    const insertData = {
      fpo_name,
      registration_number,
      phone,
      email,
      district,
      state,
      fpo_type: fpo_type || 'Producer Company',
      primary_crops: primary_crops || [],
      admin_contact_person,
      description,
      is_verified: false,
      is_active: true,
      profile_completed: false
    };

    const { data, error } = await supabase
      .from('fpos')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'FPO with this registration number or phone already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e: any) {
    console.error('[FPO API] POST error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * PATCH /api/fpo - Update FPO details
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'FPO ID is required' }, { status: 400 });
    }

    const supabase = supabaseServer();

    // Don't allow updating certain protected fields via this endpoint
    const {
      created_at,
      updated_at,
      is_verified,
      verification_date,
      ...safeUpdates
    } = updates;

    const { data, error } = await supabase
      .from('fpos')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error('[FPO API] PATCH error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
