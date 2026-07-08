import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, message, request_data, projectId, requestId, status, response } = body;

    switch (action) {
      case 'create_message':
        return NextResponse.json(await db.createClientMessage(message));
      case 'get_messages':
        return NextResponse.json(await db.getProjectMessages(projectId));
      case 'create_request':
        return NextResponse.json(await db.createClientRequest(request_data));
      case 'update_request':
        return NextResponse.json(await db.updateRequestStatus(requestId, status, response));
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
