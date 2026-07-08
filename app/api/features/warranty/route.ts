import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, warranty, claim, projectId } = body;

    switch (action) {
      case 'create':
        return NextResponse.json(await db.createWarranty(warranty));
      case 'get_warranties':
        return NextResponse.json(await db.getProjectWarranties(projectId));
      case 'create_claim':
        return NextResponse.json(await db.createWarrantyClaim(claim));
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
