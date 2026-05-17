import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, projectId, teamId, docId, startDate, endDate } = body;

    switch (action) {
      case 'upload':
        return NextResponse.json(await db.uploadDocument(data));
      case 'get_project_docs':
        return NextResponse.json(await db.getProjectDocuments(projectId));
      case 'list_all':
        return NextResponse.json(await db.getProjectDocuments(projectId));
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
