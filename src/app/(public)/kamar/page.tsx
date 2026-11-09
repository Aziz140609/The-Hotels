import { Metadata } from 'next';
import { connection } from 'next/server';
import { searchRoomTypes } from '@/lib/actions/rooms';
import { KamarResults } from './KamarResults';
import { SearchForm } from './SearchForm';

export const metadata: Metadata = {
  title: 'Ruangan | The Hotels',
  description: 'Cari dan pesan kamar di The Hotels Surakarta',
};

interface PageProps {
  searchParams: Promise<{
    checkin?: string;
    checkout?: string;
    guests?: string;
    type?: string;
    price?: string;
    sort?: string;
  }>;
}

export default async function KamarPage({ searchParams }: PageProps) {
  await connection();
  const params = await searchParams;
  const result = await searchRoomTypes(params);

  return (
    <main className="bg-emerald-900 px-6 py-10 text-ivory lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Kamar Kami</span>
          <h1 className="mt-2 font-serif text-4xl font-normal tracking-tight text-ivory md:text-5xl">Ruangan</h1>
          <div className="my-3 h-px w-16 bg-gold/40" />
          <p className="text-[15px] font-light text-muted-ivory">Temukan kamar yang sempurna untuk Anda</p>
        </div>

        <SearchForm initialParams={params} />

        <KamarResults result={result} searchParams={params} />
      </div>
    </main>
  );
}