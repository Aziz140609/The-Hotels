import Image from 'next/image';
import { GoldDivider } from '@/components/ui/gold-divider';
import { HOTEL } from '@/lib/constants';

export default function AboutPage() {
  return (
    <main className="bg-emerald-900 text-ivory">
      <section className="bg-emerald-800/40 px-6 py-20 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Kisah Kami</span>
          <h1 className="mt-2 font-serif text-4xl font-normal tracking-tight md:text-5xl">Tentang The Hotels</h1>
          <div className="mt-4 h-px w-16 bg-gold" />
        </div>
      </section>

      <section className="bg-ivory px-6 py-24 text-emerald-900 lg:px-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="relative aspect-[4/5] overflow-hidden lg:col-span-5">
            <Image src="/images/about-2.svg" alt="Arsitektur The Hotels" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
          </div>
          <div className="lg:col-span-7 lg:pl-8">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">Filosofi Kami</span>
            <h2 className="mb-6 font-serif text-4xl font-normal leading-[1.15] md:text-5xl">Warisan Jawa, Ketenangan Modern</h2>
            <p className="mb-6 text-lg font-light leading-7 text-emerald-900/80">
              The Hotels lahir dari kecintaan pada keanggunan arsitektur warisan Jawa. Setiap dirancang sebagai suaka privat
              yang memadukan material alami, linen sutra organik, dan pemandangan taman tropis yang hening.
            </p>
            <p className="text-lg font-light leading-7 text-emerald-900/80">
              Kami percaya kemewahan sejati bukan tentang kemeriahan, tetapi tentang ketenangan yang tak terusik —
              privasi mutak, pelayanan personal, dan pengalaman yang meditatif.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-emerald-900 px-6 py-24 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.3em] text-gold">Galeri</span>
            <h2 className="font-serif text-4xl font-normal md:text-5xl">Suasana The Hotels</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {['about-1', 'about-2', 'about-3', 'about-4'].map((img, i) => (
              <div key={i} className={`relative overflow-hidden ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`}>
                <Image src={`/images/${img}.svg`} alt={`Galeri ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory px-6 py-24 text-emerald-900 lg:px-20">
        <div className="mx-auto max-w-7xl text-center">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.3em] text-gold">Nilai Kami</span>
          <h2 className="mb-12 font-serif text-4xl font-normal md:text-5xl">Komitmen Kami</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { judul: 'Garansi Tarif Terbaik', deskripsi: 'Pesan langsung dengan jaminan harga terendah serta fleksibilitas pengubahan tanggal dan pembatalan tanpa denda tersembunyi.' },
              { judul: 'Bespoke Butler Service', deskripsi: 'Setiap reservasi didampingi butler terdedikasi sepanjang masa inap untuk memenuhi seluruh preferensi Anda.' },
              { judul: 'Privasi Mutlak', deskripsi: 'Lingkungan hening terisolasi dari hiruk-pikuk kota Surakarta, dirancang demi ketenangan jiwa yang paripurna.' },
            ].map((v) => (
              <div key={v.judul} className="border-l border-gold/40 bg-emerald-900/5 p-8 text-left">
                <h3 className="mb-3 font-serif text-xl text-emerald-900">{v.judul}</h3>
                <p className="text-[15px] font-light leading-6 text-emerald-900/70">{v.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GoldDivider className="mx-auto" />
    </main>
  );
}
