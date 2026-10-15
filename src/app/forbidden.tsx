import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Forbidden() {
  return <main className="flex min-h-screen flex-col items-center justify-center bg-emerald-950 px-6 text-center">
    <p className="font-sans text-[11px] uppercase tracking-label text-gold">Akses Ditolak</p>
    <h1 className="mt-4 font-serif text-6xl text-ivory">403</h1>
    <p className="mt-4 max-w-md text-sm font-light leading-6 text-muted-ivory">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
    <Link href="/"><Button className="mt-8" variant="outline">Kembali ke Beranda</Button></Link>
  </main>;
}
