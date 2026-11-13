'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { submitContact } from '@/lib/actions/contact';
import { toast } from 'sonner';

const FIELD =
  'mt-2 w-full bg-transparent font-sans text-[15px] font-light text-ivory placeholder:text-muted-ivory/50 focus:outline-none';

interface Errors {
  nama?: string[];
  email?: string[];
  subjek?: string[];
  pesan?: string[];
}

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setErrors({});
    setIsSubmitting(true);

    const result = await submitContact({
      nama: fd.get('nama'),
      email: fd.get('email'),
      subjek: fd.get('subjek'),
      pesan: fd.get('pesan'),
      website: fd.get('website'),
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setErrors((result.fieldErrors ?? {}) as Errors);
      toast.error(result.message);
      return;
    }

    form.reset();
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-4 border border-gold/30 bg-emerald-900/60 p-8">
        <CheckCircle2 className="h-8 w-8 text-success" strokeWidth={1.25} />
        <h3 className="font-serif text-2xl text-ivory">Pesan Terkirim</h3>
        <p className="text-[15px] font-light leading-6 text-muted-ivory">
          Terima kasih telah menghubungi kami. Tim concierge akan membalas melalui email Anda dalam 1×24 jam.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-2 text-[12px] uppercase tracking-label text-gold hover:text-ivory"
        >
          Kirim pesan lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <label className="block border-b border-gold/50 pb-2 focus-within:border-gold">
          <span className="text-[11px] font-medium uppercase tracking-label text-gold">Nama</span>
          <input type="text" name="nama" required placeholder="Nama Anda" className={FIELD} />
          {errors.nama && <span className="mt-1 block text-[12px] text-danger">{errors.nama[0]}</span>}
        </label>
        <label className="block border-b border-gold/50 pb-2 focus-within:border-gold">
          <span className="text-[11px] font-medium uppercase tracking-label text-gold">Email</span>
          <input type="email" name="email" required placeholder="email@anda.com" className={FIELD} />
          {errors.email && <span className="mt-1 block text-[12px] text-danger">{errors.email[0]}</span>}
        </label>
      </div>
      <label className="block border-b border-gold/50 pb-2 focus-within:border-gold">
        <span className="text-[11px] font-medium uppercase tracking-label text-gold">Subjek</span>
        <input type="text" name="subjek" required placeholder="Subjek pesan" className={FIELD} />
        {errors.subjek && <span className="mt-1 block text-[12px] text-danger">{errors.subjek[0]}</span>}
      </label>
      <label className="block border-b border-gold/50 pb-2 focus-within:border-gold">
        <span className="text-[11px] font-medium uppercase tracking-label text-gold">Pesan</span>
        <textarea name="pesan" required rows={4} placeholder="Tulis pesan Anda di sini..." className={`${FIELD} resize-y`} />
        {errors.pesan && <span className="mt-1 block text-[12px] text-danger">{errors.pesan[0]}</span>}
      </label>
      <label className="hidden" aria-hidden="true">
        <span>Website</span>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center bg-gold px-8 py-3.5 font-sans text-[12px] font-medium uppercase tracking-label text-emerald-900 transition-colors duration-300 hover:bg-gold/90 disabled:opacity-60"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
        </button>
      </div>
    </form>
  );
}

