export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nama_lengkap: string;
          email: string;
          no_hp: string | null;
          role: 'admin' | 'user';
          created_at: string;
        };
        Insert: {
          id: string;
          nama_lengkap: string;
          email: string;
          no_hp?: string | null;
          role?: 'admin' | 'user';
          created_at?: string;
        };
        Update: {
          id?: string;
          nama_lengkap?: string;
          email?: string;
          no_hp?: string | null;
          role?: 'admin' | 'user';
          created_at?: string;
        };
      };
      room_types: {
        Row: {
          id: number;
          nama: string;
          deskripsi: string | null;
          harga_per_malam: number;
          kapasitas: number;
          fasilitas: string[];
          foto_url: string | null;
          created_at: string;
        };
        Insert: {
          nama: string;
          deskripsi?: string | null;
          harga_per_malam: number;
          kapasitas: number;
          fasilitas?: string[];
          foto_url?: string | null;
        };
        Update: {
          nama?: string;
          deskripsi?: string | null;
          harga_per_malam?: number;
          kapasitas?: number;
          fasilitas?: string[];
          foto_url?: string | null;
        };
      };
      rooms: {
        Row: {
          id: number;
          nomor_kamar: string;
          room_type_id: number;
          lantai: number | null;
          status: 'tersedia' | 'perawatan';
          created_at: string;
        };
        Insert: {
          nomor_kamar: string;
          room_type_id: number;
          lantai?: number | null;
          status?: 'tersedia' | 'perawatan';
        };
      };
      bookings: {
        Row: {
          id: number;
          kode_booking: string;
          user_id: string;
          room_id: number;
          check_in: string;
          check_out: string;
          jumlah_tamu: number;
          total_harga: number;
          status: 'pending' | 'dikonfirmasi' | 'checked_in' | 'selesai' | 'dibatalkan';
          nama_tamu: string;
          email_tamu: string;
          no_hp_tamu: string;
          catatan: string | null;
          expired_at: string | null;
          created_at: string;
        };
      };
      payments: {
        Row: {
          id: number;
          booking_id: number;
          order_id: string;
          snap_token: string | null;
          gross_amount: number;
          payment_type: string | null;
          transaction_id: string | null;
          transaction_status: 'pending' | 'authorize' | 'capture' | 'settlement' | 'deny' | 'cancel' | 'expire' | 'failure' | 'refund' | 'partial_refund' | 'chargeback' | 'partial_chargeback';
          fraud_status: string | null;
          transaction_time: string | null;
          settlement_time: string | null;
          raw_notification: Record<string, unknown> | null;
          needs_review: boolean;
          is_paid: boolean;
          created_at: string;
        };
      };
      messages: {
        Row: {
          id: number;
          nama: string;
          email: string;
          subjek: string;
          pesan: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          nama: string;
          email: string;
          subjek: string;
          pesan: string;
          is_read?: boolean;
        };
      };
    };
  };
};
