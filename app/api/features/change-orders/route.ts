import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, order, projectId, quote, payment, subcontractorId } = body;

    switch (action) {
      case 'create_order':
        return NextResponse.json(await db.createChangeOrder(order));
      case 'get_orders':
        return NextResponse.json(await db.getProjectChangeOrders(projectId));
      case 'request_quote':
        return NextResponse.json(await db.requestSubcontractorQuote(quote));
      case 'schedule_payment':
        return NextResponse.json(await db.scheduleSubcontractorPayment(payment));
      case 'get_subcontractors':
        return NextResponse.json(await db.getTeamSubcontractors(order.team_id));
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
