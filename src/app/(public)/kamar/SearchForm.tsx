'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

interface SearchFormProps {
  initialParams: {
    checkin?: string;
    checkout?: string;
    guests?: string;
    type?: string;
    price?: string;
    sort?: string;
  };
}

export function SearchForm({ initialParams }: SearchFormProps) {
  const router = useRouter();
  
  const defaultCheckin = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const defaultCheckout = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return format(tomorrow, 'yyyy-MM-dd');
  }, []);
  
  const [checkin, setCheckin] = useState(initialParams.checkin || defaultCheckin);
  const [checkout, setCheckout] = useState(initialParams.checkout || defaultCheckout);
  const [guests, setGuests] = useState(initialParams.guests || '1');
  const [type, setType] = useState(initialParams.type || '');
  const [price, setPrice] = useState(initialParams.price || '');
  const sort = initialParams.sort || 'asc';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minCheckin = format(new Date(), 'yyyy-MM-dd');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkin || !checkout) return;
    if (new Date(checkout) <= new Date(checkin)) return;
    
    setIsSubmitting(true);
    const params = new URLSearchParams();
    params.set('checkin', checkin);
    params.set('checkout', checkout);
    params.set('guests', guests);
    if (type) params.set('type', type);
    if (price) params.set('price', price);
    if (sort) params.set('sort', sort);
    
    router.replace(`/kamar?${params.toString()}`);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-12 border border-gold/20 bg-emerald-800/50 p-5 shadow-xl">
      <div className="grid grid-cols-1 divide-y divide-gold/20 md:grid-cols-2 md:divide-y-0 lg:grid-cols-6 lg:divide-x">
        <div className="flex cursor-pointer flex-col justify-center p-5 transition-colors hover:bg-emerald-800">
          <span className="text-[10px] uppercase tracking-widest text-gold">Tanggal Masuk</span>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="date"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
              min={minCheckin}
              className="flex-1 bg-transparent border-b border-gold/50 focus:border-gold focus:outline-none text-ivory placeholder:text-muted-ivory/50 py-1 text-[15px] font-light"
            />
            <CalendarDays className="h-5 w-5 text-gold" strokeWidth={1.25} />
          </div>
        </div>
        <div className="flex cursor-pointer flex-col justify-center p-5 transition-colors hover:bg-emerald-800">
          <span className="text-[10px] uppercase tracking-widest text-gold">Tanggal Keluar</span>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="date"
              value={checkout}
              onChange={(e) => setCheckout(e.target.value)}
              min={minCheckin}
              className="flex-1 bg-transparent border-b border-gold/50 focus:border-gold focus:outline-none text-ivory placeholder:text-muted-ivory/50 py-1 text-[15px] font-light"
            />
            <CalendarDays className="h-5 w-5 text-gold" strokeWidth={1.25} />
          </div>
        </div>
        <div className="flex flex-col justify-center p-5 transition-colors hover:bg-emerald-800">
          <span className="text-[10px] uppercase tracking-widest text-gold">Jumlah Tamu</span>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="mt-2 cursor-pointer appearance-none bg-transparent pr-6 border-b border-gold/50 focus:border-gold focus:outline-none text-[15px] text-ivory"
          >
            {[1,2,3,4,5,6,7,8,9,10].map((g) => (
              <option key={g} value={String(g)} className="bg-emerald-800">{g} Tamu</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col justify-center p-5 transition-colors hover:bg-emerald-800">
          <label htmlFor="room-type" className="text-[10px] uppercase tracking-widest text-gold">Kategori</label>
          <select
            id="room-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-2 cursor-pointer appearance-none bg-transparent pr-6 border-b border-gold/50 focus:border-gold focus:outline-none text-[15px] text-ivory"
          >
            <option value="" className="bg-emerald-800">Semua Tipe</option>
            <option value="1" className="bg-emerald-800">Standard</option>
            <option value="2" className="bg-emerald-800">Deluxe</option>
            <option value="3" className="bg-emerald-800">Suite</option>
          </select>
        </div>
        <div className="flex flex-col justify-center p-5 transition-colors hover:bg-emerald-800">
          <label htmlFor="price" className="text-[10px] uppercase tracking-widest text-gold">Rentang Harga</label>
          <select
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-2 cursor-pointer appearance-none bg-transparent pr-6 border-b border-gold/50 focus:border-gold focus:outline-none text-[15px] text-ivory"
          >
            <option value="" className="bg-emerald-800">Semua Harga</option>
            <option value="lt500" className="bg-emerald-800">{'<'}&nbsp;Rp500.000</option>
            <option value="500-800" className="bg-emerald-800">Rp500.000 - Rp800.000</option>
            <option value="gt800" className="bg-emerald-800">{'>'}&nbsp;Rp800.000</option>
          </select>
        </div>
        <div className="flex items-center justify-center bg-gold p-4 transition-colors hover:bg-gold/90">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex h-full min-h-[52px] w-full items-center justify-center gap-2 text-[12px] uppercase tracking-[0.25em] text-emerald-900 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Mencari...' : 'Cari'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}