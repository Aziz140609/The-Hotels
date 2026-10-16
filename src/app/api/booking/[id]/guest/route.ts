import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { bookingGuestSchema } from '@/lib/validators';
import { mapError } from '@/lib/errors';

interface BookingRow {
  id: number;
  status: string;
  user_id: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, code: 'UNAUTHENTICATED', message: 'Silakan masuk terlebih dahulu.' }, { status: 401 });

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, user_id')
    .eq('id', parseInt(id))
    .single();

  if (!booking || (booking as BookingRow).user_id !== user.id) {
    return NextResponse.json({ ok: false, code: 'NOT_FOUND', message: 'Booking tidak ditemukan.' }, { status: 404 });
  }
  if ((booking as BookingRow).status !== 'pending') {
    return NextResponse.json({ ok: false, code: 'CONFLICT', message: 'Booking tidak bisa diubah.' }, { status: 409 });
  }

  const body = await request.json();
  const parsed = bookingGuestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: 'VALIDATION', message: 'Data tamu tidak valid', fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { error } = await supabase
    .from('bookings')
    .update({
      nama_tamu: parsed.data.nama,
      email_tamu: parsed.data.email,
      no_hp_tamu: parsed.data.hp,
      catatan: parsed.data.catatan,
    })
    .eq('id', parseInt(id));

  if (error) return NextResponse.json({ ok: false, ...mapError(error) }, { status: 500 });

  return NextResponse.json({ ok: true, data: undefined });
}