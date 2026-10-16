export interface OccupancyItem {
  room_type_id: number;
  nama: string;
  total: number;
  terisi: number;
}

export function AdminOccupancy({ items }: { items: OccupancyItem[] }) {
  const totalUnits = items.reduce((sum, i) => sum + i.total, 0);

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between border-b border-gold/25 pb-3">
        <div>
          <span className="mb-1 block text-[10px] uppercase tracking-[0.24em] text-gold">INVENTARIS KAMAR</span>
          <h2 className="font-serif text-2xl text-ivory">Okupansi Hari Ini</h2>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-ivory">Total: {totalUnits} Unit</span>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-sm text-muted-ivory">Belum ada tipe kamar terdaftar.</p>
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            const percent = item.total > 0 ? Math.round((item.terisi / item.total) * 100) : 0;
            const available = Math.max(0, item.total - item.terisi);
            return (
              <div key={item.room_type_id}>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-[15px] font-light text-ivory">{item.nama}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-muted-ivory">{item.terisi} / {item.total} Terisi</span>
                    <span className="text-[10px] tracking-widest text-gold">({percent}%)</span>
                  </div>
                </div>
                <div className="h-1 w-full overflow-hidden bg-gold/20">
                  <div className="h-full bg-gold transition-all duration-700 ease-out" style={{ width: `${percent}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-muted-ivory">
                  <span>{item.total} kamar</span>
                  <span>{available} Kamar Siap Huni</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
