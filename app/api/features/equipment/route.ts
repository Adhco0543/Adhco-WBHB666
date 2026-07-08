import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, equipment, teamId, maintenance } = body;

    switch (action) {
      case 'create':
        return NextResponse.json(await db.createEquipment(equipment));
      case 'get_equipment':
        return NextResponse.json(await db.getTeamEquipment(teamId));
      case 'log_maintenance':
        return NextResponse.json(await db.logEquipmentMaintenance(maintenance));
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
