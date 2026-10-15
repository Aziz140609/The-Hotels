-- =====================================================================
-- THE HOTELS - Supabase / PostgreSQL schema
-- Run once in: Supabase Dashboard > SQL Editor (paste the whole file).
-- Safe order: extensions > tables > functions > triggers > RLS > storage > seed.
-- Timezone used for all business dates: Asia/Jakarta.
-- =====================================================================

create extension if not exists btree_gist with schema extensions;

-- ---------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  nama_lengkap  varchar(100) not null check (char_length(trim(nama_lengkap)) >= 2),
  email         varchar(255) not null unique,
  no_hp         varchar(15),
  role          varchar(10)  not null default 'user' check (role in ('admin','user')),
  created_at    timestamptz  not null default now()
);

create table public.room_types (
  id               bigint generated always as identity primary key,
  nama             varchar(50)  not null unique,
  deskripsi        text,
  harga_per_malam  numeric(12,0) not null check (harga_per_malam > 0),
  kapasitas        int          not null check (kapasitas > 0),
  fasilitas        text[]       not null default '{}',
  foto_url         text,
  created_at       timestamptz  not null default now()
);

create table public.rooms (
  id            bigint generated always as identity primary key,
  nomor_kamar   varchar(10) not null unique,
  room_type_id  bigint      not null references public.room_types(id) on delete restrict,
  lantai        int,
  status        varchar(15) not null default 'tersedia' check (status in ('tersedia','perawatan')),
  created_at    timestamptz not null default now()
);

create sequence public.booking_code_seq;

create table public.bookings (
  id            bigint generated always as identity primary key,
  kode_booking  varchar(25) not null unique,
  user_id       uuid   not null references public.profiles(id) on delete restrict,
  room_id       bigint not null references public.rooms(id)    on delete restrict,
  check_in      date   not null,
  check_out     date   not null,
  jumlah_tamu   int    not null check (jumlah_tamu > 0),
  total_harga   numeric(12,0) not null check (total_harga >= 0),
  status        varchar(15) not null default 'pending'
                check (status in ('pending','dikonfirmasi','checked_in','selesai','dibatalkan')),
  nama_tamu     varchar(100) not null check (char_length(trim(nama_tamu)) >= 2),
  email_tamu    varchar(255) not null,
  no_hp_tamu    varchar(15)  not null,
  catatan       text,
  expired_at    timestamptz,
  created_at    timestamptz not null default now(),
  constraint bookings_dates_valid check (check_out > check_in),
  -- ANTI DOUBLE BOOKING: same room cannot have overlapping active stays.
  constraint bookings_no_overlap exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  ) where (status <> 'dibatalkan')
);

create table public.payments (
  id                  bigint generated always as identity primary key,
  booking_id          bigint not null references public.bookings(id) on delete cascade,
  order_id            varchar(50) not null unique,
  snap_token          text,
  gross_amount        numeric(12,0) not null check (gross_amount > 0),
  payment_type        varchar(30),
  transaction_id      varchar(50),
  transaction_status  varchar(20) not null default 'pending'
                      check (transaction_status in ('pending','authorize','capture','settlement','deny','cancel',
                                                    'expire','failure','refund','partial_refund','chargeback','partial_chargeback')),
  fraud_status        varchar(15),
  transaction_time    timestamptz,
  settlement_time     timestamptz,
  raw_notification    jsonb,
  needs_review        boolean not null default false,
  is_paid             boolean generated always as (
                        transaction_status = 'settlement'
                        or (transaction_status = 'capture' and coalesce(fraud_status,'accept') = 'accept')
                      ) stored,
  created_at          timestamptz not null default now()
);

-- Contact form messages (inserted by server action with service role only)
create table public.messages (
  id          bigint generated always as identity primary key,
  nama        varchar(100) not null,
  email       varchar(255) not null,
  subjek      varchar(150) not null,
  pesan       text not null check (char_length(pesan) between 5 and 2000),
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_rooms_room_type   on public.rooms (room_type_id);
create index idx_bookings_user     on public.bookings (user_id);
create index idx_bookings_room     on public.bookings (room_id);
create index idx_bookings_status   on public.bookings (status);
create index idx_bookings_created  on public.bookings (created_at);
create index idx_payments_booking  on public.payments (booking_id);

-- ---------------------------------------------------------------------
-- 2. HELPER FUNCTIONS
-- ---------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

-- Sweep: cancel pending bookings whose payment deadline passed (frees the room).
create or replace function public.expire_pending_bookings()
returns void
language sql security definer set search_path = ''
as $$
  with expired as (
    update public.bookings
       set status = 'dibatalkan'
     where status = 'pending' and expired_at is not null and expired_at < now()
    returning id
  )
  update public.payments
     set transaction_status = 'expire'
   where transaction_status = 'pending'
     and booking_id in (select id from expired);
$$;

-- Public availability search (only counts leave the database).
create or replace function public.search_available_room_types(
  p_check_in      date    default null,
  p_check_out     date    default null,
  p_guests        int     default 1,
  p_room_type_id  bigint  default null,
  p_min_price     numeric default null,
  p_max_price     numeric default null,
  p_sort          text    default 'harga_asc'
)
returns table (
  id bigint, nama varchar, deskripsi text, harga_per_malam numeric,
  kapasitas int, fasilitas text[], foto_url text, sisa_kamar int
)
language sql stable security definer set search_path = ''
as $$
  select rt.id, rt.nama, rt.deskripsi, rt.harga_per_malam, rt.kapasitas, rt.fasilitas, rt.foto_url,
    (
      select count(*)::int
      from public.rooms r
      where r.room_type_id = rt.id
        and r.status = 'tersedia'
        and (
          p_check_in is null or p_check_out is null
          or not exists (
            select 1 from public.bookings b
            where b.room_id = r.id
              and b.status <> 'dibatalkan'
              and not (b.status = 'pending' and b.expired_at is not null and b.expired_at < now())
              and daterange(b.check_in, b.check_out, '[)') && daterange(p_check_in, p_check_out, '[)')
          )
        )
    ) as sisa_kamar
  from public.room_types rt
  where (p_room_type_id is null or rt.id = p_room_type_id)
    and rt.kapasitas >= coalesce(p_guests, 1)
    and (p_min_price is null or rt.harga_per_malam >= p_min_price)
    and (p_max_price is null or rt.harga_per_malam <= p_max_price)
  order by case when p_sort = 'harga_desc' then rt.harga_per_malam * -1 else rt.harga_per_malam end;
$$;

-- Create a booking. Price is computed HERE (never trusted from the browser).
create or replace function public.create_booking(
  p_room_type_id bigint,
  p_check_in     date,
  p_check_out    date,
  p_jumlah_tamu  int,
  p_nama_tamu    text,
  p_email_tamu   text,
  p_no_hp_tamu   text,
  p_catatan      text default null
)
returns public.bookings
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_today   date := (now() at time zone 'Asia/Jakarta')::date;
  v_type    public.room_types%rowtype;
  v_room    record;
  v_booking public.bookings%rowtype;
  v_malam   int;
  v_total   numeric;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_check_in is null or p_check_out is null or p_check_out <= p_check_in then raise exception 'INVALID_DATES'; end if;
  if p_check_in < v_today then raise exception 'PAST_DATE'; end if;
  if p_check_in > v_today + 365 then raise exception 'DATE_TOO_FAR'; end if;

  v_malam := p_check_out - p_check_in;
  if v_malam > 30 then raise exception 'STAY_TOO_LONG'; end if;

  if char_length(trim(coalesce(p_nama_tamu,''))) < 2 then raise exception 'INVALID_GUEST_NAME'; end if;
  if coalesce(p_email_tamu,'') !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'INVALID_EMAIL'; end if;
  if coalesce(p_no_hp_tamu,'') !~ '^[0-9+]{8,15}$' then raise exception 'INVALID_PHONE'; end if;

  select * into v_type from public.room_types where id = p_room_type_id;
  if not found then raise exception 'ROOM_TYPE_NOT_FOUND'; end if;
  if p_jumlah_tamu is null or p_jumlah_tamu < 1 or p_jumlah_tamu > v_type.kapasitas then
    raise exception 'GUEST_OVER_CAPACITY';
  end if;

  perform public.expire_pending_bookings();

  -- anti-hoarding: at most 3 unpaid holds per user at the same time
  if (select count(*) from public.bookings b
       where b.user_id = v_uid and b.status = 'pending' and b.expired_at > now()) >= 3 then
    raise exception 'TOO_MANY_PENDING';
  end if;

  v_total := v_malam * v_type.harga_per_malam;

  for v_room in
    select r.id
    from public.rooms r
    where r.room_type_id = p_room_type_id
      and r.status = 'tersedia'
      and not exists (
        select 1 from public.bookings b
        where b.room_id = r.id
          and b.status <> 'dibatalkan'
          and daterange(b.check_in, b.check_out, '[)') && daterange(p_check_in, p_check_out, '[)')
      )
    order by r.nomor_kamar
  loop
    begin
      insert into public.bookings (
        kode_booking, user_id, room_id, check_in, check_out, jumlah_tamu, total_harga,
        status, nama_tamu, email_tamu, no_hp_tamu, catatan, expired_at
      ) values (
        'BK-' || to_char(now() at time zone 'Asia/Jakarta', 'YYYYMMDD') || '-' ||
          lpad(nextval('public.booking_code_seq')::text, 4, '0'),
        v_uid, v_room.id, p_check_in, p_check_out, p_jumlah_tamu, v_total,
        'pending', trim(p_nama_tamu), lower(trim(p_email_tamu)), trim(p_no_hp_tamu),
        nullif(trim(coalesce(p_catatan,'')), ''),
        now() + interval '60 minutes'      -- keep in sync with BOOKING_HOLD_MINUTES in the app
      )
      returning * into v_booking;
      return v_booking;
    exception when exclusion_violation then
      continue;   -- another buyer took this room at the same moment; try next room
    end;
  end loop;

  raise exception 'NO_ROOM_AVAILABLE';
end;
$$;

-- Cancel own booking.
create or replace function public.cancel_booking(p_booking_id bigint)
returns public.bookings
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_b     public.bookings%rowtype;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;

  select * into v_b from public.bookings where id = p_booking_id and user_id = v_uid for update;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;

  if v_b.status = 'pending' then
    null;  -- always cancellable
  elsif v_b.status = 'dikonfirmasi' and v_b.check_in >= v_today + 1 then
    null;  -- cancellable until the day before check-in
  else
    raise exception 'CANCEL_NOT_ALLOWED';
  end if;

  update public.bookings set status = 'dibatalkan' where id = v_b.id returning * into v_b;
  update public.payments set transaction_status = 'cancel'
   where booking_id = v_b.id and transaction_status = 'pending';
  return v_b;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. ADMIN REPORT / DASHBOARD FUNCTIONS (all check is_admin inside)
-- Revenue is attributed to the BOOKING CREATED DATE (Asia/Jakarta) everywhere.
-- ---------------------------------------------------------------------

create or replace function public.report_summary(p_from date, p_to date)
returns table (total_booking int, total_pendapatan numeric, okupansi_persen numeric, total_dibatalkan int)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_rooms int;
  v_days  int;
  v_occ   numeric;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_from is null or p_to is null or p_to < p_from then raise exception 'INVALID_RANGE'; end if;

  select count(*) into v_rooms from public.rooms;
  v_days := (p_to - p_from) + 1;

  select coalesce(sum(greatest(0, least(b.check_out, p_to + 1) - greatest(b.check_in, p_from))), 0)
    into v_occ
    from public.bookings b
   where b.status in ('dikonfirmasi','checked_in','selesai')
     and b.check_in <= p_to and b.check_out > p_from;

  return query
  select
    (select count(*)::int from public.bookings b
      where (b.created_at at time zone 'Asia/Jakarta')::date between p_from and p_to),
    coalesce((select sum(p.gross_amount) from public.payments p
               join public.bookings b on b.id = p.booking_id
              where p.is_paid
                and (b.created_at at time zone 'Asia/Jakarta')::date between p_from and p_to), 0),
    case when v_rooms * v_days > 0 then round(v_occ * 100.0 / (v_rooms * v_days), 1) else 0 end,
    (select count(*)::int from public.bookings b
      where b.status = 'dibatalkan'
        and (b.created_at at time zone 'Asia/Jakarta')::date between p_from and p_to);
end;
$$;

create or replace function public.admin_dashboard_stats()
returns table (booking_hari_ini int, pendapatan_bulan_ini numeric, okupansi_persen numeric, menunggu_pembayaran int)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_rooms int;
  v_busy  int;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;

  select count(*) into v_rooms from public.rooms;
  select count(distinct b.room_id) into v_busy
    from public.bookings b
   where b.status in ('dikonfirmasi','checked_in') and b.check_in <= v_today and b.check_out > v_today;

  return query
  select
    (select count(*)::int from public.bookings b
      where (b.created_at at time zone 'Asia/Jakarta')::date = v_today),
    coalesce((select sum(p.gross_amount) from public.payments p
               join public.bookings b on b.id = p.booking_id
              where p.is_paid
                and date_trunc('month', b.created_at at time zone 'Asia/Jakarta')
                    = date_trunc('month', v_today::timestamp)), 0),
    case when v_rooms > 0 then round(v_busy * 100.0 / v_rooms, 1) else 0 end,
    (select count(*)::int from public.bookings b
      where b.status = 'pending' and (b.expired_at is null or b.expired_at > now()));
end;
$$;

create or replace function public.admin_revenue_series(p_days int default 7)
returns table (tanggal date, pendapatan numeric)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_days  int  := greatest(1, least(coalesce(p_days, 7), 90));
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  return query
  select d.day::date, coalesce(sum(p.gross_amount), 0)
    from generate_series((v_today - (v_days - 1))::timestamp, v_today::timestamp, interval '1 day') as d(day)
    left join public.bookings b on (b.created_at at time zone 'Asia/Jakarta')::date = d.day::date
    left join public.payments p on p.booking_id = b.id and p.is_paid
   group by d.day
   order by d.day;
end;
$$;

create or replace function public.admin_room_type_occupancy_today()
returns table (room_type_id bigint, nama varchar, total int, terisi int)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  return query
  select rt.id, rt.nama, count(r.id)::int, count(distinct b.room_id)::int
    from public.room_types rt
    join public.rooms r on r.room_type_id = rt.id
    left join public.bookings b
      on b.room_id = r.id and b.status in ('dikonfirmasi','checked_in')
     and b.check_in <= v_today and b.check_out > v_today
   group by rt.id, rt.nama, rt.harga_per_malam
   order by rt.harga_per_malam;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. TRIGGERS
-- ---------------------------------------------------------------------

-- 4a. Auto-create profile when a user signs up. Role is ALWAYS 'user'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nama_lengkap, email, no_hp, role)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data->>'nama_lengkap'), ''), split_part(new.email, '@', 1)), 100),
    new.email,
    left(nullif(trim(new.raw_user_meta_data->>'no_hp'), ''), 15),
    'user'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4b. Users can never change their own role/email/id; the last admin cannot be demoted.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.role  is distinct from old.role  then raise exception 'FORBIDDEN_ROLE_CHANGE';  end if;
    if new.email is distinct from old.email then raise exception 'FORBIDDEN_EMAIL_CHANGE'; end if;
  end if;
  if new.id is distinct from old.id then raise exception 'IMMUTABLE_FIELD'; end if;
  if old.role = 'admin' and new.role <> 'admin'
     and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'LAST_ADMIN';
  end if;
  return new;
end;
$$;

create trigger trg_guard_profile_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

create or replace function public.guard_profile_delete()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if old.role = 'admin' and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'LAST_ADMIN';
  end if;
  return old;
end;
$$;

create trigger trg_guard_profile_delete
  before delete on public.profiles
  for each row execute function public.guard_profile_delete();

-- 4c. Booking status machine + immutable fields.
create or replace function public.guard_booking_update()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.kode_booking is distinct from old.kode_booking
     or new.user_id     is distinct from old.user_id
     or new.room_id     is distinct from old.room_id
     or new.check_in    is distinct from old.check_in
     or new.check_out   is distinct from old.check_out
     or new.total_harga is distinct from old.total_harga
     or new.jumlah_tamu is distinct from old.jumlah_tamu then
    raise exception 'IMMUTABLE_FIELD';
  end if;

  if new.status is distinct from old.status then
    if not (
         (old.status = 'pending'      and new.status in ('dikonfirmasi','dibatalkan'))
      or (old.status = 'dikonfirmasi' and new.status in ('checked_in','dibatalkan'))
      or (old.status = 'checked_in'   and new.status = 'selesai')
      or (old.status = 'dibatalkan'   and new.status = 'dikonfirmasi' and auth.uid() is null) -- late payment, system only
    ) then
      raise exception 'INVALID_STATUS_TRANSITION';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_guard_booking_update
  before update on public.bookings
  for each row execute function public.guard_booking_update();

-- 4d. Payment amount must equal booking total.
create or replace function public.guard_payment_amount()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_total numeric;
begin
  select total_harga into v_total from public.bookings where id = new.booking_id;
  if v_total is null or new.gross_amount <> v_total then raise exception 'AMOUNT_MISMATCH'; end if;
  return new;
end;
$$;

create trigger trg_guard_payment_amount
  before insert on public.payments
  for each row execute function public.guard_payment_amount();

-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table public.profiles   enable row level security;
alter table public.room_types enable row level security;
alter table public.rooms      enable row level security;
alter table public.bookings   enable row level security;
alter table public.payments   enable row level security;
alter table public.messages   enable row level security;

-- profiles (INSERT only via trigger / service role)
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());
create policy profiles_delete on public.profiles for delete to authenticated
  using (public.is_admin());

-- room_types: public read, admin write
create policy room_types_read on public.room_types for select to anon, authenticated using (true);
create policy room_types_insert on public.room_types for insert to authenticated with check (public.is_admin());
create policy room_types_update on public.room_types for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy room_types_delete on public.room_types for delete to authenticated using (public.is_admin());

-- rooms: logged-in read, admin write
create policy rooms_read on public.rooms for select to authenticated using (true);
create policy rooms_insert on public.rooms for insert to authenticated with check (public.is_admin());
create policy rooms_update on public.rooms for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy rooms_delete on public.rooms for delete to authenticated using (public.is_admin());

-- bookings: own or admin read; NO direct insert (use create_booking); admin update; admin delete only cancelled
create policy bookings_select on public.bookings for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());
create policy bookings_admin_update on public.bookings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy bookings_admin_delete on public.bookings for delete to authenticated
  using (public.is_admin() and status = 'dibatalkan');

-- payments: read own/admin; writes ONLY by server (service role bypasses RLS)
create policy payments_select on public.payments for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.bookings b
               where b.id = payments.booking_id and b.user_id = (select auth.uid()))
  );

-- messages: admin only (inserts by service role)
create policy messages_admin_select on public.messages for select to authenticated using (public.is_admin());
create policy messages_admin_update on public.messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy messages_admin_delete on public.messages for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- 6. FUNCTION PRIVILEGES
-- ---------------------------------------------------------------------

revoke execute on function public.is_admin()                                from public, anon;
revoke execute on function public.expire_pending_bookings()                 from public, anon, authenticated;
revoke execute on function public.create_booking(bigint,date,date,int,text,text,text,text) from public, anon;
revoke execute on function public.cancel_booking(bigint)                    from public, anon;
revoke execute on function public.report_summary(date,date)                 from public, anon;
revoke execute on function public.admin_dashboard_stats()                   from public, anon;
revoke execute on function public.admin_revenue_series(int)                 from public, anon;
revoke execute on function public.admin_room_type_occupancy_today()         from public, anon;

grant execute on function public.is_admin()                                 to authenticated;
grant execute on function public.expire_pending_bookings()                  to service_role;
grant execute on function public.create_booking(bigint,date,date,int,text,text,text,text) to authenticated;
grant execute on function public.cancel_booking(bigint)                     to authenticated;
grant execute on function public.report_summary(date,date)                  to authenticated;
grant execute on function public.admin_dashboard_stats()                    to authenticated;
grant execute on function public.admin_revenue_series(int)                  to authenticated;
grant execute on function public.admin_room_type_occupancy_today()          to authenticated;
grant execute on function public.search_available_room_types(date,date,int,bigint,numeric,numeric,text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 7. STORAGE (room photos)
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('room-photos', 'room-photos', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy room_photos_public_read on storage.objects for select
  using (bucket_id = 'room-photos');
create policy room_photos_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'room-photos' and public.is_admin());
create policy room_photos_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'room-photos' and public.is_admin())
  with check (bucket_id = 'room-photos' and public.is_admin());
create policy room_photos_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'room-photos' and public.is_admin());

-- ---------------------------------------------------------------------
-- 8. SEED DATA
-- ---------------------------------------------------------------------

insert into public.room_types (nama, deskripsi, harga_per_malam, kapasitas, fasilitas) values
 ('Standard', 'Kamar nyaman dengan sentuhan elegan untuk istirahat yang tenang.', 350000, 2, array['AC','TV','WiFi','Air Panas']),
 ('Deluxe',   'Ruang lebih luas dengan fasilitas premium dan pemandangan taman.',  500000, 2, array['AC','TV','WiFi','Kulkas','Bathtub','Air Panas']),
 ('Suite',    'Suite lapang dengan ruang tamu terpisah untuk keluarga atau tamu istimewa.', 900000, 4, array['AC','TV','WiFi','Kulkas','Bathtub','Ruang Tamu','Air Panas']);

insert into public.rooms (nomor_kamar, room_type_id, lantai)
select n, (select id from public.room_types where nama = 'Standard'), 1 from unnest(array['101','102','103','104','105','106']) as n;
insert into public.rooms (nomor_kamar, room_type_id, lantai)
select n, (select id from public.room_types where nama = 'Deluxe'), 2 from unnest(array['201','202','203','204','205','206','207','208']) as n;
insert into public.rooms (nomor_kamar, room_type_id, lantai)
select n, (select id from public.room_types where nama = 'Suite'), 3 from unnest(array['301','302']) as n;

-- ---------------------------------------------------------------------
-- 9. FIRST ADMIN (run manually AFTER registering that account in the app)
-- ---------------------------------------------------------------------
-- update public.profiles set role = 'admin' where email = 'EMAIL_ADMIN_KAMU@example.com';
-- (SQL Editor runs as postgres, auth.uid() is null, so the role guard allows it.)

-- ---------------------------------------------------------------------
-- 10. OPTIONAL: auto-expire every 5 minutes with pg_cron
-- (Dashboard > Database > Extensions > enable pg_cron, then run:)
-- select cron.schedule('expire-pending-bookings', '*/5 * * * *', $$select public.expire_pending_bookings()$$);
