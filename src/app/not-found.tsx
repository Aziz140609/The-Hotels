import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="flex min-h-screen flex-col items-center justify-center bg-emerald-950 px-6 text-center">
    <p className="font-sans text-[11px] uppercase tracking-label text-gold">Kesalahan 404</p>
    <h1 className="mt-4 font-serif text-6xl text-ivory">Halaman Tidak Ditemukan</h1>
    <p className="mt-4 max-w-md text-sm font-light leading-6 text-muted-ivory">Halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia.</p>
    <Link href="/"><Button className="mt-8" variant="outline">Kembali ke Beranda</Button></Link>
  </main>;
}
