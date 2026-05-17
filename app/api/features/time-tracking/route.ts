import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, entry, projectId, startDate, endDate } = body;

    switch (action) {
      case 'create_entry':
        return NextResponse.json(await db.createTimeEntry(entry));
      case 'get_entries':
        return NextResponse.json(await db.getTimeEntries(projectId, startDate, endDate));
      case 'calculate_labor_cost':
        return NextResponse.json(await db.calculateProjectLaborCost(projectId));
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
