import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatRupiah } from '@/lib/format';
import { ShuffleCard } from '@/components/ui/shuffle-card';

interface RoomTypeWithCount {
  id: number;
  nama: string;
  harga_per_malam: number;
  kapasitas: number;
  fasilitas: string[];
  foto_url: string | null;
  total_kamar: number;
}

function fallbackPhoto(nama: string): string {
  const slug = nama.toLowerCase().replace(/\s+/g, '-');
  return ['standard', 'deluxe', 'suite'].includes(slug) ? `/images/room-${slug}.png` : '/images/room-standard.png';
}

export async function LandingRoomTypes() {
  const supabase = await createClient();

  const [{ data: types }, { data: rooms }] = await Promise.all([
    supabase
      .from('room_types')
      .select('id, nama, harga_per_malam, kapasitas, fasilitas, foto_url')
      .order('harga_per_malam', { ascending: true }),
    supabase.from('rooms').select('room_type_id'),
  ]);

  const counts = new Map<number, number>();
  for (const r of rooms ?? []) counts.set(r.room_type_id, (counts.get(r.room_type_id) ?? 0) + 1);

  const items: RoomTypeWithCount[] = (types ?? []).map((t) => ({
    ...t,
    total_kamar: counts.get(t.id) ?? 0,
  }));

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-[15px] text-muted-ivory">
        Belum ada tipe kamar. Silakan cek kembali nanti.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
      {items.map((room, idx) => (
        <ShuffleCard key={room.id} index={idx} total={items.length} className="flex">
          <article
            className="group relative flex flex-col w-full overflow-hidden border border-gold/20 bg-emerald-800/40 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-gold/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <Image
                src={room.foto_url || fallbackPhoto(room.nama)}
                alt={room.nama}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-emerald-900/20 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="border border-gold/30 bg-emerald-900/90 px-3 py-1 text-[9px] uppercase tracking-widest text-gold transition-colors duration-300 group-hover:border-gold">
                  {room.kapasitas} Tamu
                </span>
              </div>
            </div>
            <div className="flex grow flex-col p-6">
              <span className="text-[10px] uppercase tracking-widest text-muted-ivory">
                {room.total_kamar > 0 ? `${room.total_kamar} kamar tersedia` : 'Stok terbatas'}
              </span>
              <h3 className="mt-1 mb-2 font-serif text-2xl font-normal text-ivory transition-colors duration-300 group-hover:text-gold">{room.nama}</h3>
              <p className="mb-6 text-[15px] tracking-wide text-gold">
                Mulai {formatRupiah(room.harga_per_malam)}{' '}
                <span className="text-[12px] text-muted-ivory">/ malam</span>
              </p>
              <Link
                href={`/kamar/${room.id}`}
                className="mt-auto inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold transition-colors duration-300 hover:text-ivory"
              >
                Lihat Detail
                <span className="text-[16px] transition-transform duration-300 group-hover:translate-x-2">→</span>
              </Link>
            </div>
          </article>
        </ShuffleCard>
      ))}
    </div>
  );
}

export function LandingRoomTypesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col border border-gold/20 bg-emerald-800/40">
          <div className="aspect-[3/4] w-full animate-pulse bg-emerald-800/60" />
          <div className="space-y-3 p-6">
            <div className="h-3 w-24 animate-pulse bg-emerald-800/60" />
            <div className="h-6 w-40 animate-pulse bg-emerald-800/60" />
            <div className="h-4 w-28 animate-pulse bg-emerald-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
