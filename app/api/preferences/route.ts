import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences from database
    const { data: userPreferences, error } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', user.id)
      .single();

    if (error || !userPreferences?.preferences) {
      return NextResponse.json({ error: 'No preferences found' }, { status: 404 });
    }

    return NextResponse.json({ preferences: userPreferences.preferences });
  } catch (error) {
    console.error('Error loading preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await request.json();

    // Validate preferences
    if (
      !preferences.businessType ||
      !preferences.primaryFocus ||
      !Array.isArray(preferences.primaryFocus)
    ) {
      return NextResponse.json(
        { error: 'Invalid preferences format' },
        { status: 400 }
      );
    }

    // Update user preferences in database
    const { data, error } = await supabase
      .from('users')
      .update({
        preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ preferences: data.preferences });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
