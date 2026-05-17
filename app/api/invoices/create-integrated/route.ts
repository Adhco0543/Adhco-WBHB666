import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimiting';
import { createAuditLog } from '@/lib/auditLogging';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitError = await checkRateLimit(req, RATE_LIMITS.INVOICE_CREATE);
  if (rateLimitError) return rateLimitError;

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { team_id, ...invoiceData } = body;

    // Create invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        ...invoiceData,
        team_id,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await createAuditLog(
      team_id,
      user.id,
      'CREATE',
      'invoice',
      invoice.id,
      { new_invoice: invoice }
    );

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimitError = await checkRateLimit(req, RATE_LIMITS.API_GENERAL);
  if (rateLimitError) return rateLimitError;

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = req.nextUrl.searchParams.get('team_id');

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
