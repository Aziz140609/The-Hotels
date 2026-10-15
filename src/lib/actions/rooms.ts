'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/lib/errors';
import { searchParamsSchema } from '@/lib/validators';
import { mapError } from '@/lib/errors';
import { getCurrentUser } from '@/lib/auth';

export async function searchRoomTypes(
  params: Record<string, string | string[] | undefined>
): Promise<ActionResult<{
  rooms: {
    id: number;
    nama: string;
    deskripsi: string | null;
    harga_per_malam: number;
    kapasitas: number;
    fasilitas: string[];
    foto_url: string | null;
    sisa_kamar: number;
  }[];
  searchParams: {
    checkin: string;
    checkout: string;
    guests: number;
    type?: number;
    price?: string;
    sort?: string;
  };
}>> {
  const user = await getCurrentUser();
  
  const parsed = searchParamsSchema.safeParse(params);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Parameter pencarian tidak valid', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { checkin, checkout, guests, type, price, sort } = parsed.data;
  const supabase = await createClient();

  let minPrice: number | null = null;
  let maxPrice: number | null = null;
  if (price === 'lt500') maxPrice = 499999;
  else if (price === '500-800') { minPrice = 500000; maxPrice = 800000; }
  else if (price === 'gt800') minPrice = 800001;

  const { data, error } = await supabase.rpc('search_available_room_types', {
    p_check_in: checkin,
    p_check_out: checkout,
    p_guests: guests,
    p_room_type_id: type ?? null,
    p_min_price: minPrice,
    p_max_price: maxPrice,
    p_sort: sort ?? 'harga_asc',
  });

  if (error) return { ok: false, ...mapError(error) };

  return { ok: true, data: { rooms: data ?? [], searchParams: { checkin, checkout, guests, type, price, sort } } };
}