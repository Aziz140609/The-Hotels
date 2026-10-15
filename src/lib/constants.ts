export const HOTEL = {
  name: 'The Hotels',
  address: 'Jl. Contoh No. 1, Surakarta, Jawa Tengah',
  phone: '+62 812-3456-7890',
  email: 'info@thehotels.id',
  mapEmbedUrl: '',
  checkInTime: '14.00',
  checkOutTime: '12.00',
} as const;

export const TIMEZONE = 'Asia/Jakarta';
export const BOOKING_HOLD_MINUTES = 60;
export const MAX_STAY_NIGHTS = 30;
export const MAX_ADVANCE_DAYS = 365;
export const MAX_GUESTS_SEARCH = 10;
export const MAX_PENDING_PER_USER = 3;
export const CANCEL_MIN_DAYS_BEFORE = 1;
export const PAGE_SIZE = 10;
export const MAX_REPORT_RANGE_DAYS = 366;
export const PAYMENT_POLL_INTERVAL_MS = 3000;
export const PAYMENT_POLL_MAX_MS = 120000;
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const BOOKING_STATUSES = [
  'pending',
  'dikonfirmasi',
  'checked_in',
  'selesai',
  'dibatalkan',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const ROOM_STATUSES = ['tersedia', 'perawatan'] as const;
export type RoomStatus = (typeof ROOM_STATUSES)[number];

export const ROLES = ['admin', 'user'] as const;
export type Role = (typeof ROLES)[number];

export const PAYMENT_STATUSES = [
  'pending',
  'authorize',
  'capture',
  'settlement',
  'deny',
  'cancel',
  'expire',
  'failure',
  'refund',
  'partial_refund',
  'chargeback',
  'partial_chargeback',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Menunggu Pembayaran',
  dikonfirmasi: 'Dikonfirmasi',
  checked_in: 'Check-in',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-gold',
  dikonfirmasi: 'bg-success',
  checked_in: 'bg-info',
  selesai: 'bg-muted',
  dibatalkan: 'bg-danger',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  settlement: 'Lunas',
  capture: 'Lunas',
  pending: 'Menunggu',
  authorize: 'Menunggu',
  deny: 'Gagal',
  failure: 'Gagal',
  cancel: 'Dibatalkan',
  expire: 'Kedaluwarsa',
  refund: 'Dikembalikan',
  partial_refund: 'Dikembalikan',
  chargeback: 'Dikembalikan',
  partial_chargeback: 'Dikembalikan',
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  tersedia: 'Tersedia',
  perawatan: 'Perawatan',
};
