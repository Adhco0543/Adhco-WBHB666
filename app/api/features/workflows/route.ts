import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, workflow, teamId, workflowId, entityType, entityId } = body;

    switch (action) {
      case 'create':
        return NextResponse.json(await db.createWorkflow(workflow));
      case 'get_workflows':
        return NextResponse.json(await db.getTeamWorkflows(teamId));
      case 'execute':
        return NextResponse.json(await db.executeWorkflow(workflowId, entityType, entityId));
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
