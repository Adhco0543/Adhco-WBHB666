import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, approval, projectId, approvalId, approverId, approved, notes } = body;

    switch (action) {
      case 'create':
        return NextResponse.json(await db.createProjectApproval(approval));
      case 'get_approvals':
        return NextResponse.json(await db.getProjectApprovals(projectId));
      case 'update_status':
        return NextResponse.json(await db.updateApprovalStatus(approvalId, approverId, approved, notes));
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
