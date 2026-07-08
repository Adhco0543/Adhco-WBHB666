import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, projectId, teamId } = body;

    switch (action) {
      case 'calculate':
        return NextResponse.json(await db.calculateProjectProfitability(projectId));
      case 'report':
        return NextResponse.json(await db.getTeamProfitabilityReport(teamId));
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
