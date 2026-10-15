import { HOTEL } from '@/lib/constants';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="bg-emerald-900 text-ivory">
      <section className="bg-emerald-800/40 px-6 py-20 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Hubungi Kami</span>
          <h1 className="mt-2 font-serif text-4xl font-normal tracking-tight md:text-5xl">Contact</h1>
          <div className="mt-4 h-px w-16 bg-gold" />
          <p className="mt-6 max-w-xl text-[15px] font-light leading-6 text-muted-ivory">
            Tim concierge kami siap membantu Anda dengan reservasi, pertanyaan, atau kebutuhan khusus lainnya.
          </p>
        </div>
      </section>

      <section className="bg-emerald-900 px-6 py-16 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="mb-8 font-serif text-3xl font-normal">Kirim Pesan</h2>
            <form className="space-y-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <label className="block border-b border-gold/50 pb-2 focus-within:border-gold">
                  <span className="text-[11px] font-medium uppercase tracking-label text-gold">Nama</span>
                  <input type="text" name="nama" required className="mt-2 w-full bg-transparent font-sans text-[15px] font-light text-ivory placeholder:text-muted-ivory/50 focus:outline-none" placeholder="Nama Anda" />
                </label>
                <label className="block border-b border-gold/50 pb-2 focus-within:border-gold">
                  <span className="text-[11px] font-medium uppercase tracking-label text-gold">Email</span>
                  <input type="email" name="email" required className="mt-2 w-full bg-transparent font-sans text-[15px] font-light text-ivory placeholder:text-muted-ivory/50 focus:outline-none" placeholder="email@anda.com" />
                </label>
              </div>
              <label className="block border-b border-gold/50 pb-2 focus-within:border-gold">
                <span className="text-[11px] font-medium uppercase tracking-label text-gold">Subjek</span>
                <input type="text" name="subjek" required className="mt-2 w-full bg-transparent font-sans text-[15px] font-light text-ivory placeholder:text-muted-ivory/50 focus:outline-none" placeholder="Subjek pesan" />
              </label>
              <label className="block border-b border-gold/50 pb-2 focus-within:border-gold">
                <span className="text-[11px] font-medium uppercase tracking-label text-gold">Pesan</span>
                <textarea name="pesan" required rows={5} className="mt-2 w-full resize-y bg-transparent font-sans text-[15px] font-light text-ivory placeholder:text-muted-ivory/50 focus:outline-none" placeholder="Tulis pesan Anda di sini..." />
              </label>
              <label className="hidden" aria-hidden="true">
                <span>Website</span>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
              <div>
                <button type="submit" className="inline-flex items-center justify-center bg-gold px-8 py-3.5 font-sans text-[12px] font-medium uppercase tracking-label text-emerald-900 transition-colors duration-300 hover:bg-gold/90">
                  Kirim Pesan
                </button>
              </div>
            </form>
          </div>

          <aside className="lg:col-span-5">
            <h2 className="mb-8 font-serif text-3xl font-normal">Informasi Kontak</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4 border-b border-gold/20 pb-6">
                <MapPin className="mt-1 h-5 w-5 text-gold" strokeWidth={1.25} />
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gold">Alamat</span>
                  <p className="mt-1 text-[15px] font-light text-ivory">{HOTEL.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 border-b border-gold/20 pb-6">
                <Phone className="mt-1 h-5 w-5 text-gold" strokeWidth={1.25} />
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gold">Telepon</span>
                  <p className="mt-1 text-[15px] font-light text-ivory">{HOTEL.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 border-b border-gold/20 pb-6">
                <Mail className="mt-1 h-5 w-5 text-gold" strokeWidth={1.25} />
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gold">Email</span>
                  <p className="mt-1 text-[15px] font-light text-ivory">{HOTEL.email}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
