import { z } from 'zod';

export const trimmed = (min: number, max: number) =>
  z.string().trim().min(min).max(max);

export const name = trimmed(2, 100).regex(
  /^[\p{L}\p{M}' .-]+$/u,
  'Nama hanya boleh huruf'
);

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .email('Format email tidak valid')
  .max(255);

export const phone = z.preprocess(
  (v) => (typeof v === 'string' ? v.replace(/[\s-]/g, '') : v),
  z
    .string()
    .regex(/^(\+62|62|0)8[0-9]{8,11}$/, 'Nomor HP tidak valid (contoh: 081234567890)')
);

export const password = z
  .string()
  .min(8, 'Minimal 8 karakter, kombinasi huruf dan angka')
  .max(72)
  .regex(/[A-Za-z]/, 'Password harus mengandung huruf')
  .regex(/[0-9]/, 'Password harus mengandung angka');

export const registerSchema = z
  .object({
    nama_lengkap: name,
    email,
    no_hp: phone.optional(),
    password,
    konfirmasi: z.string().min(1, 'Wajib diisi'),
    setuju: z.literal(true, {
      errorMap: () => ({ message: 'Anda harus menyetujui syarat' }),
    }),
  })
  .refine((v) => v.password === v.konfirmasi, {
    message: 'Password tidak sama',
    path: ['konfirmasi'],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Wajib diisi').max(72),
});

export const forgotSchema = z.object({ email });

export const resetSchema = z
  .object({
    password,
    konfirmasi: z.string().min(1, 'Wajib diisi'),
  })
  .refine((v) => v.password === v.konfirmasi, {
    message: 'Password tidak sama',
    path: ['konfirmasi'],
  });

export const profileSchema = z.object({
  nama_lengkap: name,
  no_hp: phone.optional(),
});

export const changePasswordSchema = z
  .object({
    password_baru: password,
    konfirmasi: z.string().min(1, 'Wajib diisi'),
  })
  .refine((v) => v.password_baru === v.konfirmasi, {
    message: 'Password tidak sama',
    path: ['konfirmasi'],
  });

export const searchParamsSchema = z.object({
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  guests: z.coerce.number().int().min(1).max(10).optional(),
  type: z.coerce.number().int().positive().optional(),
  price: z.enum(['lt500', '500-800', 'gt800']).optional(),
  sort: z.enum(['asc', 'desc']).optional(),
});

export const bookingInputSchema = z.object({
  roomTypeId: z.number().int().positive(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid'),
  guests: z.number().int().min(1).max(10)),
});

export const bookingGuestSchema = z.object({
  nama: name,
  email,
  hp: phone,
  catatan: z.string().trim().max(500).optional(),
});

export const roomTypeSchema = z.object({
  nama: z.string().trim().min(2).max(50),
  deskripsi: z.string().trim().max(1000).optional(),
  harga_per_malam: z.number().int().min(50_000).max(50_000_000),
  kapasitas: z.number().int().min(1).max(10)),
  fasilitas: z.array(z.string().trim().min(1).max(30)).max(15),
  foto: z.any().optional(),
});

export const roomSchema = z.object({
  nomor_kamar: z.string().regex(/^[A-Za-z0-9-]{1,10}$/, 'Nomor kamar tidak valid'),
  room_type_id: z.number().int().positive(),
  lantai: z.number().int().min(0).max(50).optional(),
  status: z.enum(['tersedia', 'perawatan']),
});

export const adminUserSchema = z.object({
  nama_lengkap: name,
  email,
  no_hp: phone.optional(),
  password,
  role: z.enum(['admin', 'user']),
});

export const adminUserEditSchema = z.object({
  nama_lengkap: name,
  no_hp: phone.optional(),
  role: z.enum(['admin', 'user']),
});

export const bookingStatusSchema = z.object({
  bookingId: z.number().int().positive(),
  status: z.enum(['dikonfirmasi', 'checked_in', 'selesai', 'dibatalkan']),
});

export const contactSchema = z.object({
  nama: name,
  email,
  subjek: z.string().trim().min(3).max(150),
  pesan: z.string().trim().min(5).max(2000),
  website: z.string().max(0).optional(),
});

export const reportFilterSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z
    .enum(['pending', 'dikonfirmasi', 'checked_in', 'selesai', 'dibatalkan'])
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type BookingInput = z.infer<typeof bookingInputSchema>;
export type RoomTypeInput = z.infer<typeof roomTypeSchema>;
