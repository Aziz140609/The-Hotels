/**
 * The Hotels - Automated Video Demonstration Script
 * Menggunakan Playwright + Chromium untuk merekam demonstrasi sistem secara otomatis
 * Dilengkapi dengan Virtual Mouse Cursor, Subtitle Penjelasan, dan Navigasi Lengkap.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const BASE_URL = process.env.BASE_URL || process.argv[2] || 'http://localhost:3000';
const RECORDINGS_DIR = path.join(__dirname, '..', 'recordings');

// Pastikan folder recordings ada
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

// Helper: Tunggu durasi ms
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Cek apakah server aktif
function checkServer(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2500, () => {
      req.abort();
      resolve(false);
    });
  });
}

// Injeksi Kursor Virtual & Banner Subtitle ke Halaman
async function setupVisualOverlay(page) {
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      // 1. Virtual Cursor
      if (!document.getElementById('demo-virtual-cursor')) {
        const cursor = document.createElement('div');
        cursor.id = 'demo-virtual-cursor';
        cursor.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(201, 169, 110, 0.85);
          border: 2px solid #ffffff;
          box-shadow: 0 0 14px rgba(201, 169, 110, 0.9), 0 2px 8px rgba(0,0,0,0.5);
          pointer-events: none;
          z-index: 999999;
          transition: transform 0.25s ease-out, opacity 0.2s, background-color 0.15s;
          transform: translate(-100px, -100px);
        `;
        document.body.appendChild(cursor);
      }

      // 2. Banner Subtitle Demonstrasi
      if (!document.getElementById('demo-subtitle-banner')) {
        const banner = document.createElement('div');
        banner.id = 'demo-subtitle-banner';
        banner.style.cssText = `
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(8, 32, 28, 0.92);
          border: 1px solid rgba(201, 169, 110, 0.6);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.7);
          padding: 12px 24px;
          border-radius: 9999px;
          z-index: 999998;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: system-ui, -apple-system, sans-serif;
          backdrop-filter: blur(12px);
          transition: opacity 0.3s ease, transform 0.3s ease;
          opacity: 0;
          pointer-events: none;
        `;
        banner.innerHTML = `
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#C9A96E; box-shadow:0 0 8px #C9A96E;"></span>
          <div style="text-align:left;">
            <p id="demo-subtitle-title" style="margin:0; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.14em; color:#C9A96E;">The Hotels</p>
            <p id="demo-subtitle-desc" style="margin:0; font-size:13px; font-weight:400; color:#F5F0E6;"></p>
          </div>
        `;
        document.body.appendChild(banner);
      }
    });
  });
}

// Tampilkan teks penjelasan pada video
async function setSubtitle(page, title, desc, duration = 3000) {
  try {
    await page.evaluate(({ t, d }) => {
      const banner = document.getElementById('demo-subtitle-banner');
      const titleEl = document.getElementById('demo-subtitle-title');
      const descEl = document.getElementById('demo-subtitle-desc');
      if (banner && titleEl && descEl) {
        titleEl.textContent = t;
        descEl.textContent = d;
        banner.style.opacity = '1';
        banner.style.transform = 'translateX(-50%) translateY(0)';
      }
    }, { t: title, d: desc });

    if (duration > 0) {
      await sleep(duration);
    }
  } catch (e) {
    // Abaikan jika halaman sedang reload
  }
}

// Gerakkan kursor virtual ke elemen tertentu
async function moveCursor(page, x, y, click = false) {
  try {
    await page.evaluate(({ px, py, isClick }) => {
      const cursor = document.getElementById('demo-virtual-cursor');
      if (cursor) {
        cursor.style.transform = `translate(${px}px, ${py}px)`;
        if (isClick) {
          cursor.style.backgroundColor = '#ffffff';
          setTimeout(() => {
            cursor.style.backgroundColor = 'rgba(201, 169, 110, 0.85)';
          }, 150);
        }
      }
    }, { px: x, py: y, isClick: click });
    await sleep(200);
  } catch (e) {}
}

// Gerakkan kursor ke selector dan klik
async function smoothClick(page, selector) {
  try {
    const el = await page.$(selector);
    if (el) {
      const box = await el.boundingBox();
      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await moveCursor(page, x, y, true);
        await sleep(150);
        await el.click();
        return;
      }
    }
  } catch (e) {}
  try {
    await page.click(selector);
  } catch (e) {}
}

// Scroll halus
async function smoothScroll(page, distance, steps = 15, stepDelay = 60) {
  for (let i = 0; i < steps; i++) {
    await page.evaluate((d) => window.scrollBy({ top: d, behavior: 'smooth' }), distance / steps);
    await sleep(stepDelay);
  }
  await sleep(400);
}

// ==========================================
// UTAMA: Skenario Perekaman Demonstrasi
// ==========================================
async function runDemo() {
  console.log('====================================================');
  console.log('  THE HOTELS - PEREKAMAN DEMONSTRASI OTOMATIS');
  console.log('====================================================');
  console.log(`Target URL: ${BASE_URL}`);

  const isUp = await checkServer(BASE_URL);
  if (!isUp) {
    console.error(`\n❌ Error: Server tidak dapat dihubungi di ${BASE_URL}`);
    console.log('Tips: Pastikan server lokal Anda aktif dengan "npm run dev" di terminal lain,');
    console.log('atau jalankan dengan URL online Vercel Anda, contoh:');
    console.log('  node scripts/record-demo.js https://the-hotels-five.vercel.app\n');
    process.exit(1);
  }

  console.log('✓ Server aktif dan siap.');
  console.log('✓ Menjalankan browser Chromium (Edge/Chrome engine)...');

  // Launch browser dengan video recording
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true, // Berjalan di background tanpa mengganggu layar
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1366, height: 768 },
    },
  });

  const page = await context.newPage();
  await setupVisualOverlay(page);

  console.log('▶ [01/06] Merekam Landing Page (Beranda & Suasana)...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await sleep(1500);

  await setSubtitle(page, 'Koleksi Kemewahan Tunggal', 'Selamat Datang di The Hotels — Hotel Berbintang Tunggal');
  await moveCursor(page, 680, 40); // Sorot Navbar
  await sleep(1200);

  await setSubtitle(page, 'Desain & Identitas', 'Nuansa Luxury Deep Emerald & Champagne Gold');
  await smoothScroll(page, 450); // Scroll ke tipe kamar
  await sleep(1500);

  await setSubtitle(page, 'Tipe Kamar Unggulan', 'Dilengkapi Animasi Staggered & Ambient Border Glow');
  await smoothScroll(page, 450); // Scroll ke bento grid galeri
  await sleep(1500);

  await setSubtitle(page, 'Galeri Suasana', '5 Foto Estetika Warisan Budaya & Kenyamanan Modern');
  await smoothScroll(page, 450); // Scroll ke fasilitas
  await sleep(1200);

  await setSubtitle(page, 'Fasilitas Eksklusif', 'Layanan Concierge 24 Jam, Spa, & Ruang Pertemuan');
  await smoothScroll(page, 550); // Scroll ke form kontak
  await sleep(1500);

  await setSubtitle(page, 'Layanan Pertanyaan', 'Form Kontak Langsung Terhubung ke Database Admin');
  await smoothScroll(page, -1800, 20, 40); // Kembali ke atas
  await sleep(1000);

  console.log('▶ [02/06] Merekam Halaman Ruangan & Pencarian Filter...');
  await setSubtitle(page, 'Navigasi Tamu', 'Membuka Menu Ruangan untuk Cek Ketersediaan Kamar');
  await page.goto(`${BASE_URL}/kamar`, { waitUntil: 'networkidle' });
  await sleep(1500);

  await setSubtitle(page, 'Pencarian & Filter Pintar', 'Pilih Tanggal, Kapasitas Tamu, dan Kategori Kamar');
  await smoothScroll(page, 200);
  await moveCursor(page, 320, 240); // Form tanggal
  await sleep(1500);

  await setSubtitle(page, 'Katalog Kamar Heritage', 'Informasi Detail Kapasitas, Fasilitas, & Tarif per Malam');
  await smoothScroll(page, 500);
  await sleep(1500);

  console.log('▶ [03/06] Merekam Detail Kamar & Formulir Reservasi...');
  // Buka detail kamar pertama (id: 1 atau 2)
  await setSubtitle(page, 'Detail Kamar', 'Melihat Spesifikasi Kamar dan Memulai Pemesanan');
  const viewDetailBtn = await page.$('a[href^="/kamar/"]');
  if (viewDetailBtn) {
    const href = await viewDetailBtn.getAttribute('href');
    await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle' });
  } else {
    await page.goto(`${BASE_URL}/kamar/1`, { waitUntil: 'networkidle' });
  }
  await sleep(1500);

  await setSubtitle(page, 'Spesifikasi & Fasilitas', 'Galeri Foto Kamar, Tipe Ranjang, dan Pemandangan');
  await smoothScroll(page, 400);
  await sleep(1500);

  await setSubtitle(page, 'Pemesanan Kamar', 'Formulir Reservasi Tanggal Check-in & Check-out');
  await smoothScroll(page, 200);
  await sleep(1500);

  console.log('▶ [04/06] Merekam Panel Admin Console...');
  await setSubtitle(page, 'Admin Console', 'Beralih ke Dashboard Manajemen Hotel');
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
  await sleep(1500);

  await setSubtitle(page, 'Ringkasan Dashboard', 'Statistik Okupansi Kamar & Pendapatan Real-time');
  await moveCursor(page, 1150, 40); // Sorot akun admin di topbar
  await sleep(1500);

  await setSubtitle(page, 'Akun Admin Aktif', 'Identitas Login Ditampilkan Transparan di Header');
  await smoothScroll(page, 350);
  await sleep(1500);

  console.log('▶ [05/06] Merekam Manajemen Kamar & Booking Admin...');
  await setSubtitle(page, 'Manajemen Tipe Kamar', 'CRUD Tipe Kamar, Tarif, & Unggah Foto');
  await page.goto(`${BASE_URL}/admin/tipe-kamar`, { waitUntil: 'networkidle' });
  await sleep(1500);

  await setSubtitle(page, 'Manajemen Kamar Fisik', 'Pemantauan Nomor Kamar & Status Kesiapan');
  await page.goto(`${BASE_URL}/admin/kamar`, { waitUntil: 'networkidle' });
  await sleep(1500);

  await setSubtitle(page, 'Daftar Reservasi & Validasi', 'Status Pemesanan, Filter Tanggal, & Validasi Check-in');
  await page.goto(`${BASE_URL}/admin/booking`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await smoothScroll(page, 200);
  await sleep(1500);

  await setSubtitle(page, 'Pesan Tamu Masuk', 'Menerima dan Mengelola Pesan Konsultasi dari Landing Page');
  await page.goto(`${BASE_URL}/admin/pesan`, { waitUntil: 'networkidle' });
  await sleep(1500);

  console.log('▶ [06/06] Merekam Laporan Pendapatan & Ekspor...');
  await setSubtitle(page, 'Laporan Keuangan & Hunian', 'Laporan Rekapitulasi dengan Ekspor PDF, Excel, & Cetak');
  await page.goto(`${BASE_URL}/admin/laporan`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await smoothScroll(page, 300);
  await sleep(2000);

  // Penutup
  await setSubtitle(page, 'The Hotels', 'Demonstrasi Selesai — Sistem Siap untuk Ujian Kompetensi', 3000);

  console.log('✓ Menyimpan rekaman video...');
  await page.close();
  await context.close();
  await browser.close();

  // Cari file webm terbaru di folder recordings
  const files = fs.readdirSync(RECORDINGS_DIR).filter((f) => f.endsWith('.webm'));
  if (files.length > 0) {
    // Sortir berdasarkan tanggal modifikasi
    const latestFile = files
      .map((f) => ({ name: f, time: fs.statSync(path.join(RECORDINGS_DIR, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time)[0].name;

    const finalPath = path.join(RECORDINGS_DIR, 'demo-the-hotels.webm');
    if (fs.existsSync(finalPath)) {
      try { fs.unlinkSync(finalPath); } catch (e) {}
    }
    fs.renameSync(path.join(RECORDINGS_DIR, latestFile), finalPath);

    console.log('\n====================================================');
    console.log('🎉 REKAMAN VIDEO DEMO BERHASIL DIBUAT!');
    console.log('====================================================');
    console.log(`Lokasi File Video:`);
    console.log(`📁 ${finalPath}`);
    console.log('====================================================');
    console.log('File .webm ini dapat langsung diputar di Windows Media Player,');
    console.log('browser Chrome/Edge, atau VLC Player.');
  }
}

runDemo().catch((err) => {
  console.error('\n❌ Terjadi kesalahan saat merekam demo:', err);
  process.exit(1);
});

