import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, teamId, modelType, config } = body;

    switch (action) {
      case 'get_predictions':
        return NextResponse.json(await db.getPredictions(teamId, modelType));
      case 'save_integration':
        return NextResponse.json(await db.saveIntegrationConfig(config));
      case 'get_integrations':
        return NextResponse.json(await db.getTeamIntegrations(teamId));
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
