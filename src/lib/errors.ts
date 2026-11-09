import { ZodError } from 'zod';

export type ErrorCode =
  | 'VALIDATION'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'EXTERNAL_SERVICE'
  | 'NETWORK'
  | 'UNKNOWN'
  | 'TOO_MANY_PENDING'
  | 'INVALID_DATES'
  | 'PAST_DATE'
  | 'DATE_TOO_FAR'
  | 'STAY_TOO_LONG'
  | 'INVALID_GUEST_NAME'
  | 'INVALID_EMAIL'
  | 'INVALID_PHONE'
  | 'ROOM_TYPE_NOT_FOUND'
  | 'GUEST_OVER_CAPACITY'
  | 'NO_ROOM_AVAILABLE'
  | 'BOOKING_NOT_FOUND'
  | 'CANCEL_NOT_ALLOWED'
  | 'INVALID_RANGE'
  | 'FORBIDDEN_ROLE_CHANGE'
  | 'FORBIDDEN_EMAIL_CHANGE'
  | 'IMMUTABLE_FIELD'
  | 'LAST_ADMIN'
  | 'INVALID_STATUS_TRANSITION'
  | 'AMOUNT_MISMATCH';

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; code: ErrorCode; message: string; fieldErrors?: Record<string, string[]> };

const BUSINESS_MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: 'Silakan masuk terlebih dahulu.',
  TOO_MANY_PENDING: 'Anda memiliki 3 pesanan yang belum dibayar. Selesaikan atau batalkan salah satunya terlebih dahulu.',
  INVALID_DATES: 'Tanggal check-out harus setelah tanggal check-in.',
  PAST_DATE: 'Tanggal check-in tidak boleh sebelum hari ini.',
  DATE_TOO_FAR: 'Pemesanan hanya dapat dilakukan maksimal 1 tahun ke depan.',
  STAY_TOO_LONG: 'Lama menginap maksimal 30 malam.',
  INVALID_GUEST_NAME: 'Data tamu tidak valid. Periksa nama, email, dan nomor HP.',
  INVALID_EMAIL: 'Data tamu tidak valid. Periksa nama, email, dan nomor HP.',
  INVALID_PHONE: 'Data tamu tidak valid. Periksa nama, email, dan nomor HP.',
  ROOM_TYPE_NOT_FOUND: 'Tipe kamar tidak ditemukan.',
  GUEST_OVER_CAPACITY: 'Jumlah tamu melebihi kapasitas kamar ini.',
  NO_ROOM_AVAILABLE: 'Maaf, kamar baru saja terisi untuk tanggal tersebut. Silakan pilih tanggal atau tipe lain.',
  BOOKING_NOT_FOUND: 'Booking tidak ditemukan.',
  CANCEL_NOT_ALLOWED: 'Booking ini tidak dapat dibatalkan lagi. Silakan hubungi hotel.',
  FORBIDDEN: 'Anda tidak memiliki akses untuk tindakan ini.',
  FORBIDDEN_ROLE_CHANGE: 'Anda tidak memiliki akses untuk tindakan ini.',
  FORBIDDEN_EMAIL_CHANGE: 'Anda tidak memiliki akses untuk tindakan ini.',
  INVALID_RANGE: 'Rentang tanggal tidak valid.',
  IMMUTABLE_FIELD: 'Data ini tidak dapat diubah. Batalkan dan buat booking baru.',
  LAST_ADMIN: 'Tidak dapat menghapus atau menurunkan admin terakhir.',
  INVALID_STATUS_TRANSITION: 'Status booking sudah berubah. Muat ulang halaman lalu coba lagi.',
  AMOUNT_MISMATCH: 'Nominal pembayaran tidak sesuai. Silakan muat ulang halaman.',
};

const PG_MESSAGES: Record<string, string> = {
  '23505': 'Data sudah ada.',
  '23503': 'Data terkait masih digunakan.',
  '23514': 'Ada data yang tidak memenuhi aturan. Periksa kembali isian Anda.',
  '23P01': 'Kamar sudah dipesan pada tanggal tersebut.',
  '23502': 'Ada data wajib yang belum diisi.',
  '22P02': 'Format data tidak valid.',
  '22007': 'Format data tidak valid.',
  '22008': 'Format data tidak valid.',
  '42501': 'Anda tidak memiliki akses.',
  PGRST116: 'Data tidak ditemukan.',
  '57014': 'Permintaan terlalu lama. Coba lagi.',
};

export function mapError(e: unknown): {
  code: ErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
} {
  if (e instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of e.issues) {
      const key = issue.path.join('.') || '_';
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return {
      code: 'VALIDATION',
      message: 'Periksa kembali data yang Anda isi.',
      fieldErrors,
    };
  }

  if (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    typeof (e as { message: unknown }).message === 'string'
  ) {
    const message = (e as { message: string }).message;

    if (message in BUSINESS_MESSAGES) {
      return {
        code: message as ErrorCode,
        message: BUSINESS_MESSAGES[message],
      };
    }

    const pgCode =
      typeof e === 'object' && e !== null && 'code' in e
        ? String((e as { code: unknown }).code)
        : '';

    if (pgCode && pgCode in PG_MESSAGES) {
      return { code: pgCode === 'PGRST116' ? 'NOT_FOUND' : ('CONFLICT' as ErrorCode), message: PG_MESSAGES[pgCode] };
    }

    if (
      typeof e === 'object' &&
      e !== null &&
      'status' in e &&
      (e as { status?: number }).status === 429
    ) {
      return {
        code: 'RATE_LIMITED',
        message: 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.',
      };
    }

    const authCode =
      'code' in e && typeof (e as { code: unknown }).code === 'string'
        ? (e as { code: string }).code
        : '';

    if (
      message === 'invalid_credentials' ||
      message === 'Invalid login credentials'
    ) {
      return {
        code: 'UNAUTHENTICATED',
        message: 'Email atau password salah.',
      };
    }

    if (
      message.toLowerCase().includes('email signups are disabled') ||
      authCode === 'email_provider_disabled' ||
      authCode === 'signup_disabled'
    ) {
      return {
        code: 'FORBIDDEN',
        message: 'Pendaftaran akun baru saat ini dinonaktifkan di pengaturan Supabase.',
      };
    }

    if (
      authCode === 'user_already_exists' ||
      message.toLowerCase().includes('already registered')
    ) {
      return {
        code: 'CONFLICT',
        message: 'Email sudah terdaftar. Silakan masuk.',
      };
    }

    if (
      authCode === 'weak_password' ||
      message.toLowerCase().includes('weak password')
    ) {
      return {
        code: 'VALIDATION',
        message: 'Password terlalu lemah. Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.',
      };
    }

    if (
      authCode === 'over_request_rate_limit' ||
      authCode === 'over_email_send_rate_limit'
    ) {
      return {
        code: 'RATE_LIMITED',
        message: 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.',
      };
    }

    if (
      authCode === 'otp_expired' ||
      authCode === 'flow_state_not_found'
    ) {
      return {
        code: 'UNAUTHENTICATED',
        message: 'Tautan tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.',
      };
    }

    if (
      authCode === 'session_not_found' ||
      authCode === 'refresh_token_not_found' ||
      authCode === 'session_expired' ||
      message.toLowerCase().includes('jwt expired')
    ) {
      return {
        code: 'UNAUTHENTICATED',
        message: 'Sesi Anda berakhir. Silakan masuk lagi.',
      };
    }
  }

  if (
    typeof e === 'object' &&
    e !== null &&
    'name' in e &&
    (e as { name?: string }).name === 'AuthApiError'
  ) {
    const message =
      'message' in e && typeof (e as { message: unknown }).message === 'string'
        ? (e as { message: string }).message
        : '';
    return {
      code: 'UNAUTHENTICATED',
      message: message || 'Terjadi kesalahan autentikasi. Silakan coba lagi.',
    };
  }

  if (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    ((e as { message: string }).message === 'TypeError: failed to fetch' ||
      (e as { message: string }).message === 'fetch failed')
  ) {
    return {
      code: 'NETWORK',
      message: 'Koneksi bermasalah. Periksa internet Anda lalu coba lagi.',
    };
  }

  return {
    code: 'UNKNOWN',
    message: 'Terjadi kesalahan. Silakan coba lagi.',
  };
}
