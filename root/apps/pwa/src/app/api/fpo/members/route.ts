/**
 * FPO Members API
 * GET /api/fpo/members - Get FPO members
 * POST /api/fpo/members - Join FPO (farmer sends request)
 * PATCH /api/fpo/members - Update member status (approve/reject)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const fpoId = searchParams.get('fpo_id');
    const farmerPhone = searchParams.get('farmer_phone');
    const status = searchParams.get('status');

    const supabase = await createClient();

    let query = supabase
      .from('fpo_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (fpoId) {
      query = query.eq('fpo_id', fpoId);
    }

    if (farmerPhone) {
      query = query.eq('farmer_phone', farmerPhone);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, count: data?.length || 0 });
  } catch (e: any) {
    console.error('[FPO Members] GET error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fpo_id,
      farmer_phone,
      farmer_name,
      membership_type,
      land_contributed_hectares
    } = body;

    if (!fpo_id || !farmer_phone) {
      return NextResponse.json(
        { error: 'Missing required fields: fpo_id, farmer_phone' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if already a member
    const { data: existing } = await supabase
      .from('fpo_members')
      .select('id, status')
      .eq('fpo_id', fpo_id)
      .eq('farmer_phone', farmer_phone)
      .single();

    if (existing) {
      return NextResponse.json(
        { 
          error: 'Already a member of this FPO', 
          status: existing.status 
        },
        { status: 409 }
      );
    }

    const insertData = {
      fpo_id,
      farmer_phone,
      farmer_name,
      membership_type: membership_type || 'regular',
      land_contributed_hectares,
      status: 'pending',
      join_date: new Date().toISOString().split('T')[0]
    };

    const { data, error } = await supabase
      .from('fpo_members')
      .insert(insertData)
      .select(`
        *,
        fpo:fpos(
          id,
          fpo_name,
          admin_contact_person,
          admin_phone
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Membership request sent. Pending FPO approval.' 
    }, { status: 201 });
  } catch (e: any) {
    console.error('[FPO Members] POST error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, approved_by } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id, status' },
        { status: 400 }
      );
    }

    if (!['pending', 'active', 'suspended', 'exited'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, active, suspended, or exited' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const updateData: any = { status };

    if (status === 'active') {
      updateData.approved_by = approved_by;
      updateData.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('fpo_members')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        fpo:fpos(
          id,
          fpo_name,
          total_members
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error('[FPO Members] PATCH error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
