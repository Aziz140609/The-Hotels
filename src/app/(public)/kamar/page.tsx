import Image from 'next/image';
import Link from 'next/link';
import { MOCK_ROOM_TYPES } from '@/components/features/mock-data';
import { Button } from '@/components/ui/button';
import { GoldDivider } from '@/components/ui/gold-divider';
import { formatRupiah } from '@/lib/format';

export default function KamarPage() {
  return (
    <main className="bg-emerald-900 px-6 py-10 text-ivory lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Kamar Kami</span>
          <h1 className="mt-2 font-serif text-4xl font-normal tracking-tight text-ivory md:text-5xl">Ruangan</h1>
          <div className="my-3 h-px w-16 bg-gold/40" />
          <p className="text-[15px] font-light text-muted-ivory">Temukan kamar yang sempurna untuk Anda</p>
        </div>

        <div className="mb-12 border border-gold/20 bg-emerald-800/50 p-5 shadow-xl">
          <form className="grid grid-cols-1 divide-y divide-gold/20 md:grid-cols-2 md:divide-y-0 lg:grid-cols-6 lg:divide-x">
            <div className="flex cursor-pointer flex-col justify-center p-5 transition-colors hover:bg-emerald-800">
              <span className="text-[10px] uppercase tracking-widest text-gold">Tanggal Masuk</span>
              <span className="mt-2 font-serif text-xl text-ivory">18 Okt 2026</span>
            </div>
            <div className="flex cursor-pointer flex-col justify-center p-5 transition-colors hover:bg-emerald-800">
              <span className="text-[10px] uppercase tracking-widest text-gold">Tanggal Keluar</span>
              <span className="mt-2 font-serif text-xl text-ivory">21 Okt 2026</span>
            </div>
            <div className="flex cursor-pointer flex-col justify-center p-5 transition-colors hover:bg-emerald-800">
              <span className="text-[10px] uppercase tracking-widest text-gold">Jumlah Tamu</span>
              <span className="mt-2 text-[15px] font-light text-ivory">2 Dewasa, 0 Anak</span>
            </div>
            <div className="flex flex-col justify-center p-5 transition-colors hover:bg-emerald-800">
              <label htmlFor="room-type" className="text-[10px] uppercase tracking-widest text-gold">Kategori</label>
              <select id="room-type" className="mt-2 cursor-pointer appearance-none bg-transparent pr-6 text-[15px] text-ivory focus:outline-none">
                <option className="bg-emerald-800">Semua Tipe</option>
                <option className="bg-emerald-800">Standard</option>
                <option className="bg-emerald-800">Deluxe</option>
                <option className="bg-emerald-800">Suite</option>
              </select>
            </div>
            <div className="flex flex-col justify-center p-5 transition-colors hover:bg-emerald-800">
              <label htmlFor="price" className="text-[10px] uppercase tracking-widest text-gold">Rentang Harga</label>
              <select id="price" className="mt-2 cursor-pointer appearance-none bg-transparent pr-6 text-[15px] text-ivory focus:outline-none">
                <option className="bg-emerald-800">Semua Harga</option>
                <option className="bg-emerald-800">&lt; Rp500.000</option>
                <option className="bg-emerald-800">Rp500.000 - Rp800.000</option>
                <option className="bg-emerald-800">&gt; Rp800.000</option>
              </select>
            </div>
            <div className="flex items-center justify-center bg-gold p-4 transition-colors hover:bg-gold/90">
              <button type="submit" className="flex h-full min-h-[52px] w-full items-center justify-center gap-2 text-[12px] uppercase tracking-[0.25em] text-emerald-900">
                <span>Cari</span>
                <span className="text-base">↗</span>
              </button>
            </div>
          </form>
        </div>

        <div className="mb-6 flex flex-col gap-4 border-b border-emerald-900/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-2xl text-emerald-900">3 Tipe Kamar</span>
            <span className="text-[11px] uppercase tracking-widest text-emerald-900/60">Tersedia untuk Tanggal Pilihan</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider text-emerald-900/70">Urutkan</span>
            <select className="cursor-pointer appearance-none bg-transparent py-1 pr-6 text-[11px] uppercase tracking-wider text-emerald-900 focus:outline-none">
              <option>Harga Terendah</option>
              <option>Harga Tertinggi</option>
            </select>
          </div>
        </div>

        <div className="space-y-16">
          {MOCK_ROOM_TYPES.map((room, index) => (
            <article key={room.id} className={`group grid grid-cols-1 bg-emerald-800/40 shadow-xl lg:grid-cols-12 ${index === 1 ? 'bg-emerald-800/60' : ''}`}>
              <div className={`relative h-[420px] overflow-hidden lg:h-[580px] lg:col-span-7 ${index === 1 ? 'order-1 lg:order-2' : ''}`}>
                <Image src={room.foto} alt={room.nama} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 60vw" />
                <div className={`absolute top-6 ${index === 1 ? 'right-6 border-r border-gold' : 'left-6 border-l border-gold'} bg-emerald-900/90 px-4 py-2`}>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gold">
                    0{index + 1} / Koleksi Heritage
                  </span>
                </div>
              </div>
              <div className={`flex flex-col justify-between bg-emerald-800/40 p-8 lg:p-12 lg:col-span-5 ${index === 1 ? 'order-2 lg:order-1' : ''}`}>
                <div>
                  <div className="mb-4 flex items-baseline justify-between">
                    <span className="text-[11px] uppercase tracking-widest text-gold">{room.kategori}</span>
                    <div className="text-right">
                      <span className="block text-[10px] uppercase text-muted-ivory">Mulai dari</span>
                      <span className="font-serif text-2xl text-gold">{formatRupiah(room.hargaPerMalam)}</span>
                      <span className="text-[12px] font-light text-muted-ivory"> / malam</span>
                    </div>
                  </div>
                  <h2 className="mb-4 font-serif text-4xl font-normal tracking-tight text-ivory">{room.nama}</h2>
                  <p className="mb-8 text-[15px] font-light leading-6 text-muted-ivory">{room.deskripsi}</p>
                  <div className="mb-8 grid grid-cols-2 gap-4 border-y border-gold/20 py-6">
                    <div className="space-y-1">
                      <span className="block text-[10px] uppercase text-gold/80">Luas Ruang</span>
                      <span className="text-[15px] text-ivory">{room.luas}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] uppercase text-gold/80">Kapasitas</span>
                      <span className="text-[15px] text-ivory">{room.kapasitas} Dewasa</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] uppercase text-gold/80">Tipe Ranjang</span>
                      <span className="text-[15px] text-ivory">{room.ranjang}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] uppercase text-gold/80">Pemandangan</span>
                      <span className="text-[15px] text-ivory">{room.pemandangan}</span>
                    </div>
                  </div>
                  <div className="mb-10">
                    <span className="mb-3 block text-[11px] uppercase tracking-widest text-ivory">Fasilitas Utama</span>
                    <ul className="grid grid-cols-2 gap-y-2 text-muted-ivory">
                      {room.fasilitas.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-[13px] font-light">
                          <span className="text-gold text-sm">—</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
                  <Link href={`/kamar/${room.id}`} className="flex-1">
                    <Button className="w-full">Pesan Sekarang</Button>
                  </Link>
                  <Link href={`/kamar/${room.id}`}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Lihat Detail
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <GoldDivider className="mx-auto mt-16" />
    </main>
  );
}
