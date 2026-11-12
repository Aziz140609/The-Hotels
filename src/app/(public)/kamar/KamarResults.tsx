'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GoldDivider } from '@/components/ui/gold-divider';
import { EmptyState } from '@/components/ui/empty-state';
import { ShuffleCard } from '@/components/ui/shuffle-card';
import { formatRupiah } from '@/lib/format';
import type { ActionResult } from '@/lib/errors';

interface RoomData {
  id: number;
  nama: string;
  deskripsi: string | null;
  harga_per_malam: number;
  kapasitas: number;
  fasilitas: string[];
  foto_url: string | null;
  sisa_kamar: number;
}

interface KamarResultsProps {
  result: ActionResult<{
    rooms: RoomData[];
    searchParams: {
      checkin: string;
      checkout: string;
      guests: number;
      type?: number;
      price?: string;
      sort?: string;
    };
  }>;
  searchParams: {
    checkin?: string;
    checkout?: string;
    guests?: string;
    type?: string;
    price?: string;
    sort?: string;
  };
}

function RoomCard({ room, index, searchParams }: { room: RoomData; index: number; searchParams: URLSearchParams }) {
  const foto = room.foto_url || `/images/room-${room.nama.toLowerCase().replace(' ', '-')}.png`;
  const query = searchParams.toString();
  return (
    <article
      key={room.id}
      className={`group grid grid-cols-1 bg-emerald-800/40 border border-transparent shadow-xl transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)] lg:grid-cols-12 ${
        index === 1 ? 'bg-emerald-800/60' : ''
      }`}
    >
      <div className={`relative h-[420px] overflow-hidden lg:h-[580px] lg:col-span-7 ${index === 1 ? 'order-1 lg:order-2' : ''}`}>
        <Image src={foto} alt={room.nama} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 60vw" />
        <div className={`absolute top-6 ${index === 1 ? 'right-6 border-r border-gold' : 'left-6 border-l border-gold'} bg-emerald-900/90 px-4 py-2`}>
          <span className="text-[10px] uppercase tracking-[0.2em] text-gold">
            0{index + 1} / Koleksi Heritage
          </span>
        </div>
      </div>
      <div className={`flex flex-col justify-between bg-emerald-800/40 p-8 lg:p-12 lg:col-span-5 ${index === 1 ? 'order-2 lg:order-1' : ''}`}>
        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-widest text-gold">{room.sisa_kamar > 0 ? 'Tersedia' : 'Penuh'}</span>
            <div className="text-right">
              <span className="block text-[10px] uppercase text-muted-ivory">Mulai dari</span>
              <span className="font-serif text-2xl text-gold">{formatRupiah(room.harga_per_malam)}</span>
              <span className="text-[12px] font-light text-muted-ivory"> / malam</span>
            </div>
          </div>
          <h2 className="mb-4 font-serif text-4xl font-normal tracking-tight text-ivory">{room.nama}</h2>
          <p className="mb-8 text-[15px] font-light leading-6 text-muted-ivory">{room.deskripsi}</p>
          <div className="mb-8 grid grid-cols-2 gap-4 border-y border-gold/20 py-6">
            <div className="space-y-1">
              <span className="block text-[10px] uppercase text-gold/80">Luas Ruang</span>
              <span className="text-[15px] text-ivory">{room.kapasitas === 2 ? '42 m²' : room.kapasitas === 3 ? '65 m²' : '110 m²'}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] uppercase text-gold/80">Kapasitas</span>
              <span className="text-[15px] text-ivory">{room.kapasitas} Dewasa</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] uppercase text-gold/80">Tipe Ranjang</span>
              <span className="text-[15px] text-ivory">{room.kapasitas === 2 ? 'King Size' : room.kapasitas === 3 ? 'Grand King' : '2 King Master'}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] uppercase text-gold/80">Pemandangan</span>
              <span className="text-[15px] text-ivory">{room.kapasitas === 2 ? 'Inner Zen Courtyard' : room.kapasitas === 3 ? 'Taman Tropis Privat' : 'Plunge Pool & Paviliun'}</span>
            </div>
          </div>
          <div className="mb-10">
            <span className="mb-3 block text-[11px] uppercase tracking-widest text-ivory">Fasilitas Utama</span>
            <ul className="grid grid-cols-2 gap-y-2 text-muted-ivory">
              {room.fasilitas?.map((f: string) => (
                <li key={f} className="flex items-center gap-2 text-[13px] font-light">
                  <span className="text-gold text-sm">—</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
          <Link href={`/kamar/${room.id}?${query}`} className="flex-1">
            <Button className="w-full" disabled={room.sisa_kamar === 0}>{room.sisa_kamar > 0 ? 'Pesan Sekarang' : 'Penuh'}</Button>
          </Link>
          <Link href={`/kamar/${room.id}?${query}`}>
            <Button variant="outline" className="w-full sm:w-auto">Lihat Detail</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function KamarResults({ result, searchParams }: KamarResultsProps) {
  const router = useRouter();
  const params = new URLSearchParams(searchParams as Record<string, string>);
  
  if (!result.ok) {
    return (
      <div className="text-center py-12">
        <p className="text-danger mb-4">{result.message}</p>
        <p className="text-muted-ivory">Silakan coba lagi atau ubah parameter pencarian.</p>
      </div>
    );
  }

  const { rooms, searchParams: validatedParams } = result.data;
  const availableRooms = rooms.filter((r) => r.sisa_kamar > 0);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    params.set('sort', e.target.value);
    router.push(`/kamar?${params.toString()}`);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 border-b border-emerald-900/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-2xl text-emerald-900">{rooms.length} Tipe Kamar</span>
          <span className="text-[11px] uppercase tracking-widest text-emerald-900/60">
            {validatedParams.checkin && validatedParams.checkout
              ? `Tersedia untuk ${validatedParams.checkin} - ${validatedParams.checkout}`
              : 'Tersedia untuk Tanggal Pilihan'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-wider text-emerald-900/70">Urutkan</span>
          <select 
            defaultValue={validatedParams.sort || 'asc'}
            onChange={handleSortChange}
            className="cursor-pointer appearance-none bg-transparent py-1 pr-6 text-[11px] uppercase tracking-wider text-emerald-900 focus:outline-none"
          >
            <option value="asc">Harga Terendah</option>
            <option value="desc">Harga Tertinggi</option>
          </select>
        </div>
      </div>

      {result.data.rooms.length === 0 ? (
        <EmptyState
          title="Belum ada tipe kamar"
          description="Tidak ada data kamar yang tersedia saat ini."
        />
      ) : availableRooms.length === 0 ? (
        <EmptyState
          title="Tidak ada kamar yang tersedia"
          description="Semua kamar sudah terisi untuk tanggal yang dipilih. Silakan ubah tanggal atau tipe kamar."
        />
      ) : (
        <div className="space-y-16">
          {availableRooms.map((room, i) => (
            <ShuffleCard key={room.id} index={i} total={availableRooms.length} staggerMs={150}>
              <RoomCard room={room} index={i} searchParams={new URLSearchParams(searchParams as Record<string, string>)} />
            </ShuffleCard>
          ))}
        </div>
      )}

      <GoldDivider className="mx-auto mt-16" />
    </>
  );
}