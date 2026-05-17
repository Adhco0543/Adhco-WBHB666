import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, expense, projectId } = body;

    switch (action) {
      case 'create':
        return NextResponse.json(await db.createExpense(expense));
      case 'get_expenses':
        return NextResponse.json(await db.getProjectExpenses(projectId));
      case 'calculate_total':
        return NextResponse.json(await db.calculateTotalExpenses(projectId));
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
