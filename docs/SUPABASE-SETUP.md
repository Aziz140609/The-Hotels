# Supabase Setup

1. Buat project di https://supabase.com (free tier OK).
2. Buka Dashboard > SQL Editor, paste isi `supabase/schema.sql`, Run (sekali saja).
3. Auth settings:
   - Authentication > Providers > Email (enabled)
   - Turn "Confirm email" OFF for development
   - URL configuration:
     - Site URL: http://localhost:3000
     - Redirect URLs: http://localhost:3000/api/auth/callback
4. FIRST ADMIN:
   - Daftar akun baru melalui app
   - Jalankan di SQL Editor: `update public.profiles set role = 'admin' where email = 'EMAIL_ANDA';`
5. Copy env vars ke .env.local:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY (atau publishable key)
   - SUPABASE_SERVICE_ROLE_KEY (atau secret key, server only)
6. Bucket room-photos dibuat otomatis oleh schema.sql
