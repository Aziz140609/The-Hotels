import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { GoldDivider } from '@/components/ui/gold-divider';
import { BookingForm } from '@/components/features/booking-form';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth';
import { MOCK_GALLERY } from '@/components/features/mock-data';
import { formatRupiah } from '@/lib/format';

export const metadata = {
  title: 'Detail Kamar | The Hotels',
};

interface RoomTypeRow {
  id: number;
  nama: string;
  deskripsi: string | null;
  harga_per_malam: number;
  kapasitas: number;
  fasilitas: string[];
  foto_url: string | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkin?: string; checkout?: string; guests?: string }>;
}

export default async function KamarDetailPage({ params, searchParams }: PageProps) {
  await connection();
  const { id } = await params;
  const sp = await searchParams;
  const roomTypeId = Number(id);
  if (!Number.isInteger(roomTypeId) || roomTypeId <= 0) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from('room_types')
    .select('id, nama, deskripsi, harga_per_malam, kapasitas, fasilitas, foto_url')
    .eq('id', roomTypeId)
    .single();

  const room = data as RoomTypeRow | null;
  if (!room) notFound();

  const foto = room.foto_url || `/images/room-${room.nama.toLowerCase().split(' ')[0]}.svg`;
  const guests = sp.guests ? Number(sp.guests) : 1;
  const user = await getSessionUser();
  const showKw = room.kapasitas <= 2 ? 'King Size' : room.kapasitas === 3 ? 'Grand King' : '2 King Master';
  const showLuas = room.kapasitas <= 2 ? '42 m²' : room.kapasitas === 3 ? '65 m²' : '110 m²';
  const showView = room.kapasitas <= 2 ? 'Inner Zen Courtyard' : room.kapasitas === 3 ? 'Taman Tropis Privat' : 'Plunge Pool & Paviliun';

  return (
    <main className="bg-emerald-900 px-6 py-10 text-ivory lg:px-20">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6 flex items-center gap-2 text-[12px] text-muted-ivory">
          <Link href="/kamar" className="hover:text-gold">Ruangan</Link>
          <span>/</span>
          <span className="text-gold">{room.nama}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image src={foto} alt={room.nama} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 80vw" />
            </div>
            <div className="mt-4 grid grid-cols-5 gap-3">
              {MOCK_GALLERY.map((src, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden">
                  <Image src={src} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="20vw" />
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="border border-gold/30 bg-emerald-800/50 p-6 lg:sticky lg:top-24">
              <span className="text-[10px] uppercase tracking-widest text-muted-ivory">Koleksi Heritage</span>
              <h1 className="mt-2 font-serif text-3xl font-normal text-ivory">{room.nama}</h1>
              <p className="mt-4 text-[15px] font-light leading-6 text-muted-ivory">{room.deskripsi}</p>

              <div className="mt-6 space-y-3 border-y border-gold/20 py-6">
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-ivory">Luas</span>
                  <span className="text-ivory">{showLuas}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-ivory">Kapasitas</span>
                  <span className="text-ivory">{room.kapasitas} Tamu</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-ivory">Tipe Ranjang</span>
                  <span className="text-ivory">{showKw}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-ivory">Pemandangan</span>
                  <span className="text-ivory">{showView}</span>
                </div>
              </div>

              <div className="mt-6">
                <span className="text-[10px] uppercase tracking-widest text-muted-ivory">Mulai dari</span>
                <p className="mt-1 font-serif text-3xl text-gold">
                  {formatRupiah(room.harga_per_malam)}
                  <span className="ml-1 text-sm font-light text-muted-ivory">/ malam</span>
                </p>
              </div>

              <BookingForm
                roomTypeId={room.id}
                maxGuests={room.kapasitas}
                hargaPerMalam={room.harga_per_malam}
                initialCheckIn={sp.checkin}
                initialCheckOut={sp.checkout}
                initialGuests={guests}
                isAuthenticated={Boolean(user)}
              />

              <div className="mt-6">
                <span className="mb-3 block text-[11px] uppercase tracking-widest text-ivory">Fasilitas</span>
                <ul className="space-y-2">
                  {room.fasilitas?.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px] font-light text-muted-ivory">
                      <span className="text-gold">—</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <GoldDivider className="mx-auto mt-16" />
    </main>
  );
}
