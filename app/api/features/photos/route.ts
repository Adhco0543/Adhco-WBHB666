import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, photo, projectId, phase, comparison } = body;

    switch (action) {
      case 'upload':
        return NextResponse.json(await db.uploadProjectPhoto(photo));
      case 'get_photos':
        return NextResponse.json(await db.getProjectPhotos(projectId, phase));
      case 'create_comparison':
        return NextResponse.json(await db.createBeforeAfterComparison(comparison));
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
