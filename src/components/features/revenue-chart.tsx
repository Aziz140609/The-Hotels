import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export interface RevenuePoint {
  tanggal: string;
  pendapatan: number;
}

const WIDTH = 700;
const LEFT = 40;
const RIGHT = 660;
const TOP = 30;
const BASELINE = 230;

function shortRupiah(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}rb`;
  return String(value);
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const values = data.map((d) => d.pendapatan);
  const max = Math.max(...values, 1);
  const step = data.length > 1 ? (RIGHT - LEFT) / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = LEFT + i * step;
    const y = BASELINE - (d.pendapatan / max) * (BASELINE - TOP);
    return { x, y, ...d };
  });

  const linePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPoints =
    points.length > 0
      ? `${LEFT},${BASELINE} ${linePoints} ${points[points.length - 1].x.toFixed(1)},${BASELINE}`
      : '';

  const peak = points.reduce((best, p) => (p.pendapatan > best.pendapatan ? p : best), points[0]);
  const average = values.reduce((a, b) => a + b, 0) / (values.length || 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-3 text-[12px] text-muted-ivory">
        <span>Rp {max.toLocaleString('id-ID')}</span>
        <span className="italic text-gold">Rata-rata Harian: Rp {Math.round(average).toLocaleString('id-ID')}</span>
      </div>

      <div className="relative aspect-[21/9] max-h-[340px] min-h-[220px] w-full">
        <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 240">
          <defs>
            <linearGradient id="revenueGrad" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#C9A96E" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[20, 75, 130, 185].map((y) => (
            <line key={y} x1="0" x2="700" y1={y} y2={y} stroke="#C9A96E" strokeWidth="0.75" strokeDasharray="2 3" strokeOpacity="0.2" />
          ))}
          <line x1="0" x2="700" y1={BASELINE} y2={BASELINE} stroke="#C9A96E" strokeWidth="1" strokeOpacity="0.3" />

          {areaPoints && <polygon fill="url(#revenueGrad)" points={areaPoints} />}
          {linePoints && <polyline fill="none" points={linePoints} stroke="#C9A96E" strokeWidth="2" />}

          {points.map((p) => (
            <circle
              key={p.tanggal}
              cx={p.x}
              cy={p.y}
              r={p === peak ? 5 : 4.5}
              fill={p === peak ? '#0B2B26' : '#F5F0E6'}
              stroke="#C9A96E"
              strokeWidth={p === peak ? 2.5 : 2}
            />
          ))}
        </svg>

        {peak && peak.pendapatan > 0 && (
          <div className="absolute top-2 hidden -translate-x-1/2 border border-gold/40 bg-emerald-950 px-3 py-1.5 md:block" style={{ left: `${(peak.x / WIDTH) * 100}%` }}>
            <div className="text-[9px] uppercase tracking-widest text-gold">PUNCAK RESERVASI</div>
            <div className="font-serif text-lg text-ivory">Rp {peak.pendapatan.toLocaleString('id-ID')}</div>
          </div>
        )}
      </div>

      <div className="grid border-t border-gold/20 pt-4 text-center" style={{ gridTemplateColumns: `repeat(${Math.max(points.length, 1)}, minmax(0, 1fr))` }}>
        {points.map((p) => (
          <div key={p.tanggal} className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-ivory">
              {format(parseISO(p.tanggal), 'EEE', { locale: localeId })}
            </span>
            <span className="mt-1 text-[12px] text-gold">{shortRupiah(p.pendapatan)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
