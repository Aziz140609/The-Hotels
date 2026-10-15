export type MockRoomType = {
  id: number;
  nama: string;
  kategori: string;
  deskripsi: string;
  hargaPerMalam: number;
  kapasitas: number;
  luas: string;
  ranjang: string;
  pemandangan: string;
  fasilitas: string[];
  foto: string;
  sisaKamar: number;
};

export const MOCK_ROOM_TYPES: MockRoomType[] = [
  {
    id: 1,
    nama: 'Standard Sanctuary',
    kategori: 'Kamar Suaka',
    deskripsi:
      'Suaka personal dengan arsitektur kayu jati alami, pencahayaan temaram yang menenangkan, dan linen katun organik pilihan untuk istirahat mendalam.',
    hargaPerMalam: 350000,
    kapasitas: 2,
    luas: '42 m²',
    ranjang: 'King Size',
    pemandangan: 'Inner Zen Courtyard',
    fasilitas: ['WiFi Berkecepatan Tinggi', 'Rain Shower Batu Alam', 'Minibar Kurasi Lokal', 'Butler Layanan 24 Jam'],
    foto: '/images/room-standard.svg',
    sisaKamar: 6,
  },
  {
    id: 2,
    nama: 'Deluxe Garden Residence',
    kategori: 'Residensi Alam',
    deskripsi:
      'Ruang peristirahatan lapang beranda terbuka yang menghadap pepohonan rimbun Surakarta. Dilengkapi area duduk santai bernuansa tradisional kontemporer.',
    hargaPerMalam: 500000,
    kapasitas: 2,
    luas: '65 m²',
    ranjang: 'Grand King',
    pemandangan: 'Taman Tropis Privat',
    fasilitas: ['Teras Beranda Pribadi', 'Bathtub Marmer Bebas', 'Espresso Bar Artisanal', 'Sarapan Gastronomi Keraton'],
    foto: '/images/room-deluxe.svg',
    sisaKamar: 8,
  },
  {
    id: 3,
    nama: 'Royal Pavilion Suite',
    kategori: 'Paviliun Kerajaan',
    deskripsi:
      'Puncak kemewahan The Hotels dengan kolam renang privat batu hitam, ruang tamu luas beratap joglo modern, dan layanan concierge personal eksklusif.',
    hargaPerMalam: 900000,
    kapasitas: 4,
    luas: '110 m²',
    ranjang: '2 King Master',
    pemandangan: 'Plunge Pool & Paviliun',
    fasilitas: ['Private Plunge Pool', 'Spa In-Room Treatment', 'VIP Airport Transfer', '24h Dedicated Butler'],
    foto: '/images/room-suite.svg',
    sisaKamar: 2,
  },
];

export const MOCK_FACILITIES = [
  { nama: 'WiFi', deskripsi: 'Serat Optik Cepat' },
  { nama: 'Kolam Renang', deskripsi: 'Batu Hitam Alami' },
  { nama: 'Restoran', deskripsi: 'Gastronomi Keraton' },
  { nama: 'Spa', deskripsi: 'Ritual Rempah Jawa' },
  { nama: 'Parkir', deskripsi: 'Valet Privat 24 Jam' },
  { nama: 'Layanan Kamar', deskripsi: 'Pelayanan Butler' },
];

export const MOCK_BOOKING_STEPS = [
  { judul: 'Cari Kamar', deskripsi: 'Tentukan tanggal kunjungan dan preferensi akomodasi Anda dengan kenyamanan penuh.' },
  { judul: 'Pilih Tipe', deskripsi: 'Pilih antara tipe Standard, Deluxe, atau Suite eksklusif yang dirancang untuk kesendirian Anda.' },
  { judul: 'Isi Data', deskripsi: 'Masukkan rincian reservasi dan permintaan personal Anda untuk pengalaman yang dipersonalisasi.' },
  { judul: 'Bayar', deskripsi: 'Selesaikan pembayaran aman dengan jaminan konfirmasi instan dari tim concierge kami.' },
];

export const MOCK_GALLERY = [
  '/images/gallery-1.svg',
  '/images/gallery-2.svg',
  '/images/gallery-3.svg',
  '/images/gallery-4.svg',
  '/images/gallery-5.svg',
];
