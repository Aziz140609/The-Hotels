export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type BookingStatus =
  | 'pending'
  | 'dikonfirmasi'
  | 'checked_in'
  | 'selesai'
  | 'dibatalkan';

type TransactionStatus =
  | 'pending'
  | 'authorize'
  | 'capture'
  | 'settlement'
  | 'deny'
  | 'cancel'
  | 'expire'
  | 'failure'
  | 'refund'
  | 'partial_refund'
  | 'chargeback'
  | 'partial_chargeback';

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
        Relationships: [];
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
          id?: number;
          nama: string;
          deskripsi?: string | null;
          harga_per_malam: number;
          kapasitas: number;
          fasilitas?: string[];
          foto_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          nama?: string;
          deskripsi?: string | null;
          harga_per_malam?: number;
          kapasitas?: number;
          fasilitas?: string[];
          foto_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
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
          id?: number;
          nomor_kamar: string;
          room_type_id: number;
          lantai?: number | null;
          status?: 'tersedia' | 'perawatan';
          created_at?: string;
        };
        Update: {
          id?: number;
          nomor_kamar?: string;
          room_type_id?: number;
          lantai?: number | null;
          status?: 'tersedia' | 'perawatan';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rooms_room_type_id_fkey';
            columns: ['room_type_id'];
            isOneToOne: false;
            referencedRelation: 'room_types';
            referencedColumns: ['id'];
          },
        ];
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
          status: BookingStatus;
          nama_tamu: string;
          email_tamu: string;
          no_hp_tamu: string;
          catatan: string | null;
          expired_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          kode_booking: string;
          user_id: string;
          room_id: number;
          check_in: string;
          check_out: string;
          jumlah_tamu: number;
          total_harga: number;
          status?: BookingStatus;
          nama_tamu: string;
          email_tamu: string;
          no_hp_tamu: string;
          catatan?: string | null;
          expired_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          kode_booking?: string;
          user_id?: string;
          room_id?: number;
          check_in?: string;
          check_out?: string;
          jumlah_tamu?: number;
          total_harga?: number;
          status?: BookingStatus;
          nama_tamu?: string;
          email_tamu?: string;
          no_hp_tamu?: string;
          catatan?: string | null;
          expired_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
        ];
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
          transaction_status: TransactionStatus;
          fraud_status: string | null;
          transaction_time: string | null;
          settlement_time: string | null;
          raw_notification: Json | null;
          needs_review: boolean;
          is_paid: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          booking_id: number;
          order_id: string;
          snap_token?: string | null;
          gross_amount: number;
          payment_type?: string | null;
          transaction_id?: string | null;
          transaction_status?: TransactionStatus;
          fraud_status?: string | null;
          transaction_time?: string | null;
          settlement_time?: string | null;
          raw_notification?: Json | null;
          needs_review?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          booking_id?: number;
          order_id?: string;
          snap_token?: string | null;
          gross_amount?: number;
          payment_type?: string | null;
          transaction_id?: string | null;
          transaction_status?: TransactionStatus;
          fraud_status?: string | null;
          transaction_time?: string | null;
          settlement_time?: string | null;
          raw_notification?: Json | null;
          needs_review?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_booking_id_fkey';
            columns: ['booking_id'];
            isOneToOne: false;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          },
        ];
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
          id?: number;
          nama: string;
          email: string;
          subjek: string;
          pesan: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          nama?: string;
          email?: string;
          subjek?: string;
          pesan?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      expire_pending_bookings: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      search_available_room_types: {
        Args: {
          p_check_in?: string | null;
          p_check_out?: string | null;
          p_guests?: number;
          p_room_type_id?: number | null;
          p_min_price?: number | null;
          p_max_price?: number | null;
          p_sort?: string;
        };
        Returns: {
          id: number;
          nama: string;
          deskripsi: string | null;
          harga_per_malam: number;
          kapasitas: number;
          fasilitas: string[];
          foto_url: string | null;
          sisa_kamar: number;
        }[];
      };
      create_booking: {
        Args: {
          p_room_type_id: number;
          p_check_in: string;
          p_check_out: string;
          p_jumlah_tamu: number;
          p_nama_tamu: string;
          p_email_tamu: string;
          p_no_hp_tamu: string;
          p_catatan?: string | null;
        };
        Returns: Database['public']['Tables']['bookings']['Row'];
      };
      cancel_booking: {
        Args: { p_booking_id: number };
        Returns: Database['public']['Tables']['bookings']['Row'];
      };
      report_summary: {
        Args: { p_from: string; p_to: string };
        Returns: {
          total_booking: number;
          total_pendapatan: number;
          okupansi_persen: number;
          total_dibatalkan: number;
        }[];
      };
      admin_dashboard_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          booking_hari_ini: number;
          pendapatan_bulan_ini: number;
          okupansi_persen: number;
          menunggu_pembayaran: number;
        }[];
      };
      admin_revenue_series: {
        Args: { p_days?: number };
        Returns: {
          tanggal: string;
          pendapatan: number;
        }[];
      };
      admin_room_type_occupancy_today: {
        Args: Record<PropertyKey, never>;
        Returns: {
          room_type_id: number;
          nama: string;
          total: number;
          terisi: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
