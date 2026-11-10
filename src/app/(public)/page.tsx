import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MOCK_BOOKING_STEPS, MOCK_FACILITIES } from '@/components/features/mock-data';
import { LandingRoomTypes, LandingRoomTypesSkeleton } from '@/components/features/landing-room-types';
import { Button } from '@/components/ui/button';
import { GoldDivider } from '@/components/ui/gold-divider';
import { HOTEL } from '@/lib/constants';
import { MapPin, Clock, Phone, Wifi, Waves, Utensils, Sparkles, Car, ConciergeBell } from 'lucide-react';

const FACILITY_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  WiFi: Wifi,
  'Kolam Renang': Waves,
  Restoran: Utensils,
  Spa: Sparkles,
  Parkir: Car,
  'Layanan Kamar': ConciergeBell,
};

export default function LandingPage() {
  return (
    <main className="bg-emerald-900">
      <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/hero.svg" alt="" fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/80 via-emerald-900/40 to-emerald-900" />
        </div>
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <span className="mb-4 font-sans text-[11px] uppercase tracking-[0.3em] text-gold opacity-90">
            Sanctuary of Surakarta
          </span>
          <h1 className="font-sans text-[11px] uppercase tracking-[0.18em] text-ivory select-none" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', letterSpacing: '0.18em' }}>
            THE HOTELS
          </h1>
          <div className="my-6 h-px w-24 bg-gold opacity-75" />
          <p className="mb-8 max-w-xl font-serif text-2xl italic tracking-wider text-ivory opacity-95">
            &ldquo;Ketenangan dalam kemewahan&rdquo;
          </p>
          <Link href="#tipe-kamar">
            <Button variant="outline" className="px-10 py-4 text-[12px]">
              LIHAT KAMAR
            </Button>
          </Link>
        </div>
        <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold opacity-80">Scroll</span>
          <div className="relative h-10 w-px overflow-hidden bg-ivory/20">
            <div className="h-1/2 w-full animate-scroll-pulse bg-gold" />
          </div>
        </div>
      </section>

      <section className="bg-ivory px-6 py-24 text-emerald-900 lg:px-20" id="tentang-kami">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="relative aspect-[4/5] overflow-hidden bg-emerald-800/20 lg:col-span-5">
            <Image src="/images/about-1.svg" alt="Pavilion Atrium" fill className="transition-transform duration-1000 hover:scale-102 object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
            <div className="absolute bottom-4 left-4 border border-gold/30 bg-emerald-900/85 px-4 py-2">
              <span className="text-[9px] uppercase tracking-[0.2em] text-gold">Pavilion Atrium</span>
            </div>
          </div>
          <div className="flex flex-col justify-center lg:col-span-7 lg:pl-8">
            <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">Tentang Kami</span>
            <h2 className="mb-6 font-serif text-4xl font-normal leading-[1.15] tracking-tight text-emerald-900 md:text-5xl">
              Kemewahan yang tenang
            </h2>
            <p className="mb-10 max-w-2xl text-lg font-light leading-7 text-emerald-900/80">
              Tersembunyi di jantung historis Surakarta, The Hotels menghadirkan suaka eksklusif yang memadukan keanggunan arsitektur warisan Jawa dengan ketenangan spasial kontemporer. Kami merawat privasi mutlak Anda melalui pengalaman menginap yang meditatif, hening, dan penuh kesadaran personal. Di setiap sudutnya, kemewahan terwujud bukan dalam kemeriahan, melainkan dalam ketenangan yang tak terusik.
            </p>
            <div className="grid grid-cols-3 items-center border-y border-gold/30 py-6">
              <div className="flex flex-col border-l border-gold/30 pl-4">
                <span className="font-serif text-3xl text-emerald-900">16</span>
                <span className="mt-1 text-[11px] uppercase tracking-widest text-emerald-900">Kamar</span>
                <span className="mt-0.5 text-[11px] font-light text-emerald-900/60">Exclusive sanctuary</span>
              </div>
              <div className="flex flex-col border-l border-gold/30 px-4">
                <span className="font-serif text-3xl text-emerald-900">24 Jam</span>
                <span className="mt-1 text-[11px] uppercase tracking-widest text-emerald-900">Layanan</span>
                <span className="mt-0.5 text-[11px] font-light text-emerald-900/60">Bespoke butler service</span>
              </div>
              <div className="flex flex-col border-l border-gold/30 px-4">
                <span className="font-serif text-3xl text-emerald-900">5★</span>
                <span className="mt-1 text-[11px] uppercase tracking-widest text-emerald-900">Pelayanan</span>
                <span className="mt-0.5 text-[11px] font-light text-emerald-900/60">World-class hospitality</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-900 px-6 py-24 text-ivory lg:px-20" id="tipe-kamar">
        <div className="mx-auto flex max-w-7xl flex-col">
          <div className="mb-12 flex flex-col border-b border-gold/20 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="mb-2 block text-[11px] uppercase tracking-[0.3em] text-gold">Tipe Kamar</span>
              <h2 className="font-serif text-4xl font-normal tracking-tight text-ivory md:text-5xl">Pilihan Kamar</h2>
            </div>
            <p className="mt-4 max-w-md text-[15px] font-light leading-6 text-muted-ivory md:mt-0">
              Setiap ruangan dirancang sebagai suaka privat dengan material alami, linen sutra organik, dan pemandangan taman tropis yang hening.
            </p>
          </div>
          <Suspense fallback={<LandingRoomTypesSkeleton />}>
            <LandingRoomTypes />
          </Suspense>
        </div>
      </section>

      <section className="bg-ivory px-6 py-24 text-emerald-900 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">Fasilitas</span>
            <h2 className="mt-2 font-serif text-4xl font-normal tracking-tight text-emerald-900 md:text-5xl">
              Kenyamanan Tanpa Cela
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-gold" />
          </div>
          <div className="grid grid-cols-2 border-y border-gold/30 md:grid-cols-3 lg:grid-cols-6">
            {MOCK_FACILITIES.map((facility) => {
              const Icon = FACILITY_ICONS[facility.nama] ?? Sparkles;
              return (
                <div
                  key={facility.nama}
                  className="flex flex-col items-center justify-center border-l border-gold/30 px-2 py-12 text-center transition-colors duration-300 hover:bg-emerald-900/5 first:border-l-0"
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center text-gold">
                    <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-emerald-900">{facility.nama}</span>
                  <span className="mt-1 text-[11px] font-light text-emerald-900/50">{facility.deskripsi}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-emerald-900 px-6 py-24 text-ivory lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.3em] text-gold">Cara Booking</span>
            <h2 className="mt-2 font-serif text-4xl font-normal tracking-tight text-ivory md:text-5xl">
              Pesan dalam 4 langkah
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-gold opacity-70" />
          </div>
          <div className="relative w-full">
            <div className="absolute top-7 left-12 right-12 z-0 hidden h-px bg-gold/30 lg:block" />
            <div className="relative z-10 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
              {MOCK_BOOKING_STEPS.map((step, i) => (
                <div key={step.judul} className="group flex flex-col items-start pr-4">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center border border-gold bg-emerald-900 transition-colors duration-300 group-hover:bg-gold">
                    <span className="font-serif text-2xl text-gold transition-colors duration-300 group-hover:text-emerald-900">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-normal tracking-wide text-ivory">
                    {step.judul}
                  </h3>
                  <p className="text-[15px] font-light leading-6 text-muted-ivory">{step.deskripsi}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory px-6 py-24 text-emerald-900 lg:px-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-5">
            <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">Lokasi</span>
            <h2 className="mb-6 font-serif text-4xl font-normal leading-[1.15] tracking-tight text-emerald-900 md:text-5xl">
              Temukan Kami
            </h2>
            <p className="mb-8 text-[15px] font-light leading-7 text-emerald-900/80">
              Terletak di kawasan terlindung yang tenang di Surakarta, berjarak sejenak dari situs bersejarah Keraton Kasunanan dan pusat batik tradisional Laweyan.
            </p>
            <div className="mb-8 space-y-4 border-y border-gold/30 py-6">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-gold" strokeWidth={1.25} />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-900">Alamat Suaka</span>
                  <span className="text-[15px] text-emerald-900">{HOTEL.address}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-gold" strokeWidth={1.25} />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-900">Jam Operasional</span>
                  <span className="text-[15px] text-emerald-900">Resepsionis & Butler 24 Jam</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-gold" strokeWidth={1.25} />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-900">Kontak Langsung</span>
                  <span className="text-[15px] text-emerald-900">{HOTEL.phone}</span>
                </div>
              </div>
            </div>
            <div>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-emerald-900 px-8 py-3.5 text-[12px] uppercase tracking-[0.25em] text-emerald-900 transition-colors duration-300 hover:bg-emerald-900 hover:text-ivory"
              >
                Petunjuk Arah
              </a>
            </div>
          </div>
          <div className="relative h-[460px] overflow-hidden border border-gold/30 bg-emerald-800/20 lg:col-span-7">
            <Image src="/images/lobby.svg" alt="Lokasi The Hotels Surakarta" fill className="object-cover grayscale contrast-125 brightness-90" sizes="(max-width: 1024px) 100vw, 60vw" />
            <div className="pointer-events-none absolute inset-0 bg-emerald-900/20" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 animate-bounce items-center justify-center border border-gold bg-emerald-900">
                  <MapPin className="h-5 w-5 text-gold" strokeWidth={1.25} />
                </div>
                <div className="mt-2 border border-gold/40 bg-emerald-900/95 px-3 py-1">
                  <span className="text-[9px] uppercase tracking-widest text-gold">The Hotels Surakarta</span>
                </div>
              </div>
            </div>
            <div className="absolute right-4 bottom-4 border border-gold/30 bg-emerald-900/90 px-3 py-1.5">
              <span className="text-[9px] uppercase tracking-wider text-muted-ivory">7°33&apos;56.2&quot;S 110°49&apos;32.8&quot;E</span>
            </div>
          </div>
        </div>
      </section>

      <GoldDivider className="mx-auto" />
    </main>
  );
}
