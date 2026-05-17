import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, inventory, supplier, teamId } = body;

    switch (action) {
      case 'update':
        return NextResponse.json(await db.updateMaterialInventory(inventory));
      case 'get_reorder':
        return NextResponse.json(await db.getMaterialsNeedingReorder(teamId));
      case 'create_supplier':
        return NextResponse.json(await db.createMaterialSupplier(supplier));
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
