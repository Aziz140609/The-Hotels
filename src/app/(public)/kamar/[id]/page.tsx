import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GoldDivider } from '@/components/ui/gold-divider';
import { MOCK_GALLERY, MOCK_ROOM_TYPES } from '@/components/features/mock-data';
import { formatRupiah } from '@/lib/format';

export default async function KamarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = MOCK_ROOM_TYPES.find((r) => r.id === Number(id)) ?? MOCK_ROOM_TYPES[0];

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
              <Image src={room.foto} alt={room.nama} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 80vw" />
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
              <span className="text-[10px] uppercase tracking-widest text-muted-ivory">{room.kategori}</span>
              <h1 className="mt-2 font-serif text-3xl font-normal text-ivory">{room.nama}</h1>
              <p className="mt-4 text-[15px] font-light leading-6 text-muted-ivory">{room.deskripsi}</p>

              <div className="mt-6 space-y-3 border-y border-gold/20 py-6">
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-ivory">Luas</span>
                  <span className="text-ivory">{room.luas}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-ivory">Kapasitas</span>
                  <span className="text-ivory">{room.kapasitas} Tamu</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-ivory">Tipe Ranjang</span>
                  <span className="text-ivory">{room.ranjang}</span>
                </div>
              </div>

              <div className="mt-6">
                <span className="text-[10px] uppercase tracking-widest text-muted-ivory">Mulai dari</span>
                <p className="mt-1 font-serif text-3xl text-gold">{formatRupiah(room.hargaPerMalam)}<span className="ml-1 text-sm font-light text-muted-ivory">/ malam</span></p>
              </div>

              <Link href={`/login?next=/kamar/${room.id}`} className="mt-6 block">
                <Button className="w-full py-4">Pesan Sekarang</Button>
              </Link>

              <div className="mt-6">
                <span className="mb-3 block text-[11px] uppercase tracking-widest text-ivory">Fasilitas</span>
                <ul className="space-y-2">
                  {room.fasilitas.map((f) => (
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
