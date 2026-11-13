import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeRedirect } from '@/lib/redirect';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeRedirect(searchParams.get('next'));

  // Get true origin behind proxy (ngrok / reverse proxy)
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  const baseOrigin = host ? `${proto}://${host}` : origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${baseOrigin}${next}`);
    }
  }

  return NextResponse.redirect(`${baseOrigin}/login`);
}
