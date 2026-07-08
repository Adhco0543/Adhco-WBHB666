import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, log, checklist, projectId, teamId } = body;

    switch (action) {
      case 'log_incident':
        return NextResponse.json(await db.logSafetyIncident(log));
      case 'get_logs':
        return NextResponse.json(await db.getProjectSafetyLogs(projectId));
      case 'create_checklist':
        return NextResponse.json(await db.createSafetyChecklist(checklist));
      case 'check_alerts':
        return NextResponse.json(await db.checkComplianceAlerts(teamId));
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
