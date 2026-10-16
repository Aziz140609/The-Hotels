import { HOTEL } from '@/lib/constants';
import { MapPin, Phone, Mail } from 'lucide-react';
import { ContactForm } from './ContactForm';

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
            <ContactForm />
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
