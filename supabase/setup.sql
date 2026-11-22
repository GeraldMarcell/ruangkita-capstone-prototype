-- =====================================================================
-- RuangKita — skema database Supabase (Q3.04 MVP Core Build)
-- Jalankan SEKALI di Supabase: SQL Editor → New query → tempel → Run.
-- Aman dijalankan ulang (menghapus & membuat ulang objek RuangKita).
-- =====================================================================

drop view if exists public.jadwal_pengajuan;
drop function if exists public.ajukan_peminjaman(text, date, time, time, int, text, text, text, text);
drop function if exists public.cek_pengajuan(text);
drop function if exists public.putuskan_pengajuan(uuid, text, text);
drop table if exists public.pengajuan;
drop table if exists public.jadwal_kuliah;
drop table if exists public.petugas_tu;
drop table if exists public.ruangan;
drop function if exists public.is_tu();
drop function if exists public.hari_indonesia(date);

-- ---------- Tabel ----------
create table public.ruangan (
  id        text primary key,
  nama      text not null,
  kapasitas int  not null check (kapasitas > 0),
  urutan    int  not null
);

create table public.jadwal_kuliah (
  id          bigint generated always as identity primary key,
  ruang_id    text not null references public.ruangan(id),
  hari        text not null check (hari in ('Senin','Selasa','Rabu','Kamis','Jumat')),
  jam_mulai   time not null,
  jam_selesai time not null,
  mata_kuliah text not null,
  keterangan  text,
  catatan     text,
  check (jam_mulai < jam_selesai)
);

-- Email akun petugas TU yang boleh menyetujui/menolak pengajuan.
create table public.petugas_tu (
  email text primary key
);

create table public.pengajuan (
  id               uuid primary key default gen_random_uuid(),
  kode             text not null unique,
  ruang_id         text not null references public.ruangan(id),
  tanggal          date not null,
  jam_mulai        time not null,
  jam_selesai      time not null,
  peserta          int  not null check (peserta between 1 and 500),
  nama_kegiatan    text not null,
  organisasi       text not null,
  penanggung_jawab text not null,
  kontak           text not null,
  status           text not null default 'menunggu' check (status in ('menunggu','disetujui','ditolak')),
  catatan_tu       text,
  dibuat_pada      timestamptz not null default now(),
  diputuskan_pada  timestamptz,
  diputuskan_oleh  text,
  check (jam_mulai < jam_selesai)
);
create index pengajuan_ruang_tanggal on public.pengajuan (ruang_id, tanggal);

-- ---------- Keamanan (Row Level Security) ----------
alter table public.ruangan       enable row level security;
alter table public.jadwal_kuliah enable row level security;
alter table public.petugas_tu    enable row level security;
alter table public.pengajuan     enable row level security;

revoke all on public.ruangan, public.jadwal_kuliah, public.petugas_tu, public.pengajuan from anon, authenticated;
grant select on public.ruangan, public.jadwal_kuliah to anon, authenticated;
grant select on public.pengajuan to authenticated;

create policy "ruangan dapat dibaca semua" on public.ruangan for select to anon, authenticated using (true);
create policy "jadwal dapat dibaca semua" on public.jadwal_kuliah for select to anon, authenticated using (true);

create function public.is_tu() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.petugas_tu
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Hanya petugas TU yang bisa membaca data lengkap pengajuan (termasuk kontak).
create policy "TU membaca pengajuan" on public.pengajuan for select to authenticated using (public.is_tu());
-- Tidak ada policy insert/update/delete: perubahan hanya lewat fungsi di bawah.

-- Data publik untuk status ruangan (tanpa nama penanggung jawab & kontak).
create view public.jadwal_pengajuan as
  select ruang_id, tanggal, jam_mulai, jam_selesai, nama_kegiatan, status
  from public.pengajuan
  where status in ('menunggu', 'disetujui');
grant select on public.jadwal_pengajuan to anon, authenticated;

-- ---------- Fungsi ----------
create function public.hari_indonesia(d date) returns text
language sql immutable as $$
  select (array['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'])[extract(dow from d)::int + 1];
$$;

-- Mahasiswa mengajukan peminjaman. Validasi dilakukan di server.
create function public.ajukan_peminjaman(
  p_ruang_id text, p_tanggal date, p_jam_mulai time, p_jam_selesai time, p_peserta int,
  p_nama_kegiatan text, p_organisasi text, p_penanggung_jawab text, p_kontak text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_kapasitas int;
  v_hari text;
  v_kode text;
begin
  select kapasitas into v_kapasitas from ruangan where id = p_ruang_id;
  if v_kapasitas is null then raise exception 'Ruangan tidak ditemukan.'; end if;
  if p_tanggal < (now() at time zone 'Asia/Jakarta')::date then raise exception 'Tanggal sudah lewat.'; end if;
  v_hari := hari_indonesia(p_tanggal);
  if v_hari in ('Sabtu', 'Minggu') then raise exception 'RuangKita hanya melayani hari Senin–Jumat.'; end if;
  if p_jam_mulai >= p_jam_selesai then raise exception 'Jam selesai harus setelah jam mulai.'; end if;
  if p_jam_mulai < time '07:00' or p_jam_selesai > time '18:30' then raise exception 'Waktu harus di antara 07.00–18.30.'; end if;
  if p_peserta is null or p_peserta < 1 then raise exception 'Jumlah peserta minimal 1 orang.'; end if;
  if p_peserta > v_kapasitas then raise exception 'Jumlah peserta melebihi kapasitas ruangan (% orang).', v_kapasitas; end if;
  if char_length(trim(coalesce(p_nama_kegiatan, ''))) < 3 then raise exception 'Nama kegiatan minimal 3 karakter.'; end if;
  if char_length(trim(coalesce(p_organisasi, ''))) < 2 then raise exception 'Nama organisasi wajib diisi.'; end if;
  if char_length(trim(coalesce(p_penanggung_jawab, ''))) < 3 then raise exception 'Nama penanggung jawab wajib diisi.'; end if;
  if char_length(trim(coalesce(p_kontak, ''))) < 5 then raise exception 'Kontak penanggung jawab wajib diisi.'; end if;
  if char_length(p_nama_kegiatan) > 120 or char_length(p_organisasi) > 120
     or char_length(p_penanggung_jawab) > 80 or char_length(p_kontak) > 80 then
    raise exception 'Isian terlalu panjang.';
  end if;
  if exists (select 1 from jadwal_kuliah j
             where j.ruang_id = p_ruang_id and j.hari = v_hari
               and j.jam_mulai < p_jam_selesai and p_jam_mulai < j.jam_selesai) then
    raise exception 'Ruangan dipakai perkuliahan pada waktu tersebut.';
  end if;
  if exists (select 1 from pengajuan x
             where x.ruang_id = p_ruang_id and x.tanggal = p_tanggal and x.status = 'disetujui'
               and x.jam_mulai < p_jam_selesai and p_jam_mulai < x.jam_selesai) then
    raise exception 'Ruangan sudah diizinkan untuk kegiatan lain pada waktu tersebut.';
  end if;

  loop
    v_kode := 'RK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from pengajuan where pengajuan.kode = v_kode);
  end loop;

  insert into pengajuan (kode, ruang_id, tanggal, jam_mulai, jam_selesai, peserta,
                         nama_kegiatan, organisasi, penanggung_jawab, kontak)
  values (v_kode, p_ruang_id, p_tanggal, p_jam_mulai, p_jam_selesai, p_peserta,
          trim(p_nama_kegiatan), trim(p_organisasi), trim(p_penanggung_jawab), trim(p_kontak));

  return jsonb_build_object('kode', v_kode, 'status', 'menunggu');
end;
$$;

-- Mahasiswa mengecek status dengan kode pengajuan (tanpa data kontak).
create function public.cek_pengajuan(p_kode text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare r record;
begin
  select p.kode, p.ruang_id, r2.nama as ruang_nama, p.tanggal, p.jam_mulai, p.jam_selesai, p.peserta,
         p.nama_kegiatan, p.organisasi, p.status, p.catatan_tu, p.dibuat_pada, p.diputuskan_pada
    into r
    from pengajuan p join ruangan r2 on r2.id = p.ruang_id
   where p.kode = upper(trim(p_kode));
  if not found then raise exception 'Kode pengajuan tidak ditemukan.'; end if;
  return to_jsonb(r);
end;
$$;

-- Petugas TU menyetujui atau menolak pengajuan.
create function public.putuskan_pengajuan(p_id uuid, p_status text, p_catatan text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v pengajuan%rowtype;
begin
  if not is_tu() then raise exception 'Hanya petugas TU yang dapat memutuskan pengajuan.'; end if;
  if p_status not in ('disetujui', 'ditolak') then raise exception 'Status tidak valid.'; end if;
  select * into v from pengajuan where id = p_id for update;
  if not found then raise exception 'Pengajuan tidak ditemukan.'; end if;
  if v.status <> 'menunggu' then raise exception 'Pengajuan ini sudah diputuskan sebelumnya.'; end if;
  if p_status = 'disetujui' and exists (
       select 1 from pengajuan x
        where x.id <> v.id and x.ruang_id = v.ruang_id and x.tanggal = v.tanggal and x.status = 'disetujui'
          and x.jam_mulai < v.jam_selesai and v.jam_mulai < x.jam_selesai) then
    raise exception 'Sudah ada kegiatan lain yang disetujui pada ruangan dan waktu yang sama.';
  end if;
  update pengajuan
     set status = p_status, catatan_tu = nullif(trim(coalesce(p_catatan, '')), ''),
         diputuskan_pada = now(), diputuskan_oleh = auth.jwt() ->> 'email'
   where id = p_id;
  return jsonb_build_object('kode', v.kode, 'status', p_status);
end;
$$;

revoke all on function public.is_tu() from public;
revoke all on function public.hari_indonesia(date) from public;
revoke all on function public.ajukan_peminjaman(text, date, time, time, int, text, text, text, text) from public;
revoke all on function public.cek_pengajuan(text) from public;
revoke all on function public.putuskan_pengajuan(uuid, text, text) from public;
grant execute on function public.is_tu() to authenticated;
grant execute on function public.hari_indonesia(date) to anon, authenticated;
grant execute on function public.ajukan_peminjaman(text, date, time, time, int, text, text, text, text) to anon, authenticated;
grant execute on function public.cek_pengajuan(text) to anon, authenticated;
grant execute on function public.putuskan_pengajuan(uuid, text, text) to authenticated;

-- ---------- Data awal ----------
-- 12 ruangan DSI (data tim)
insert into public.ruangan (id, nama, kapasitas, urutan) values
  ('1101-1102', 'Ruang 1101–1102', 70, 1),
  ('2104', 'Ruang 2104', 30, 2),
  ('2208', 'Ruang 2208', 50, 3),
  ('2209', 'Ruang 2209', 50, 4),
  ('2102', 'Ruang 2102', 30, 5),
  ('2103', 'Ruang 2103', 30, 6),
  ('4101', 'Ruang 4101', 50, 7),
  ('4102', 'Ruang 4102', 50, 8),
  ('4201', 'Ruang 4201', 50, 9),
  ('4202', 'Ruang 4202', 50, 10),
  ('st-apter-1305', 'St. Apter 1305', 50, 11),
  ('st-prog-1302', 'St. Prog 1302', 50, 12);

-- Jadwal Gasal DSI 2026/2027 (V.2.7)
insert into public.jadwal_kuliah (ruang_id, hari, jam_mulai, jam_selesai, mata_kuliah, keterangan, catatan) values
  ('1101-1102', 'Senin', '07:30', '10:00', 'Caps [A] P1', 'Sem 7, 4 SKS', null),
  ('1101-1102', 'Senin', '10:15', '12:45', 'TBD [ID]', 'Sem 3, 3 SKS', null),
  ('1101-1102', 'Senin', '13:30', '16:00', 'EB [ID]', 'Sem 1, 4 SKS', null),
  ('1101-1102', 'Senin', '16:00', '18:30', 'EB [ID]', 'Sem 1, 4 SKS', null),
  ('1101-1102', 'Selasa', '07:30', '10:00', 'DT [D]', 'Sem 1, 3 SKS', 'DT'),
  ('1101-1102', 'Selasa', '10:15', '12:45', 'LSD [A]', 'Sem 1, 3 SKS', null),
  ('1101-1102', 'Selasa', '13:30', '16:00', 'PraTA [B]', 'Sem 7, 2 SKS', null),
  ('1101-1102', 'Selasa', '16:00', '18:30', 'PAI [A] P1', 'Sem 5, 4 SKS', null),
  ('1101-1102', 'Rabu', '07:30', '10:00', 'PAI [D] P1', 'Sem 5, 4 SKS', null),
  ('1101-1102', 'Rabu', '10:15', '12:45', 'DT [B]', 'Sem 1, 3 SKS', null),
  ('1101-1102', 'Rabu', '13:30', '16:00', 'MEOTI [C]', 'Sem 5, 3 SKS', null),
  ('1101-1102', 'Kamis', '07:30', '10:00', 'ITI1 [B]', 'Sem 1, 3 SKS', null),
  ('1101-1102', 'Kamis', '10:15', '12:45', 'ASD [D] P2', 'Sem 3, 4 SKS', null),
  ('1101-1102', 'Kamis', '13:30', '16:00', 'MPT [D]', 'Sem 3, 3 SKS', null),
  ('1101-1102', 'Jumat', '13:30', '16:00', 'PTEIC [L]', 'Sem 1, 2 SKS', '13.20 - 15.00'),
  ('2104', 'Senin', '07:30', '10:00', 'ASD [IUP] P1', 'Sem 3, 4 SKS', null),
  ('2104', 'Senin', '10:15', '12:45', 'T-SE [A]', 'Sem 2, 3 SKS', null),
  ('2104', 'Senin', '13:30', '16:00', 'TKATI [A]', 'Sem 7, 3 SKS', null),
  ('2104', 'Selasa', '07:30', '10:00', 'T-Graph [A]', 'Sem 3, 3 SKS', null),
  ('2104', 'Selasa', '10:15', '12:45', 'T-Egov [A]', 'Sem 3, 3 SKS', null),
  ('2104', 'Selasa', '13:30', '16:00', 'PSTI [IUP] P1', 'Sem 5, 4 SKS', null),
  ('2104', 'Rabu', '07:30', '10:00', 'T-RDIB [A]', 'Sem 2, 3 SKS', 'AM'),
  ('2104', 'Rabu', '10:15', '12:45', 'PAI [IUP] P1', 'Sem 5, 4 SKS', null),
  ('2104', 'Rabu', '13:30', '16:00', 'DT [IUP]', 'Sem 1, 3 SKS', null),
  ('2104', 'Rabu', '16:00', '18:30', 'MEOTI [IUP]', 'Sem 5, 3 SKS', null),
  ('2104', 'Kamis', '07:30', '10:00', 'TKKTI [A]', 'Sem 7, 3 SKS', null),
  ('2104', 'Kamis', '10:15', '12:45', 'RO [IUP]', 'Sem 3, 3 SKS', null),
  ('2208', 'Senin', '07:30', '10:00', 'PSTI [C] P1', 'Sem 5, 4 SKS', null),
  ('2208', 'Senin', '10:15', '12:45', 'PraTA [A]', 'Sem 7, 2 SKS', null),
  ('2208', 'Senin', '13:30', '16:00', 'DT [C]', 'Sem 1, 3 SKS', null),
  ('2208', 'Senin', '16:00', '18:30', 'CRM [ID]', 'Sem 5, 3 SKS', null),
  ('2208', 'Selasa', '07:30', '10:00', 'ASD [A] P1', 'Sem 3, 4 SKS', null),
  ('2208', 'Selasa', '10:15', '12:45', 'Pemdig [ID]', 'Sem 5, 3 SKS', null),
  ('2208', 'Selasa', '13:30', '16:00', 'PPPL [D] P1', 'Sem 5, 4 SKS', null),
  ('2208', 'Rabu', '07:30', '10:00', 'MLTI [C]', 'Sem 5, 3 SKS', null),
  ('2208', 'Rabu', '10:15', '12:45', 'ITI1 [A]', 'Sem 1, 3 SKS', null),
  ('2208', 'Rabu', '13:30', '16:00', 'ITI1 [D]', 'Sem 1, 3 SKS', null),
  ('2208', 'Kamis', '07:30', '10:00', 'DT [A]', 'Sem 1, 3 SKS', null),
  ('2208', 'Kamis', '10:15', '12:45', 'PAI [A] P2', 'Sem 5, 4 SKS', null),
  ('2208', 'Kamis', '13:30', '16:00', 'MPT [C]', 'Sem 3, 3 SKS', null),
  ('2208', 'Jumat', '09:30', '11:30', 'PTEIC [M]', 'Sem 1, 2 SKS', '09.40 - 11.20'),
  ('2208', 'Jumat', '13:30', '16:00', 'PTEIC [N]', 'Sem 1, 2 SKS', '13.20 - 15.00'),
  ('2209', 'Senin', '07:30', '10:00', 'PAI [B] P1', 'Sem 5, 4 SKS', null),
  ('2209', 'Senin', '10:15', '12:45', 'PEB [A]', 'Sem 1, 2 SKS', null),
  ('2209', 'Senin', '13:30', '16:00', 'SE [C] P1', 'Sem 3, 4 SKS', 'AP'),
  ('2209', 'Selasa', '07:30', '10:00', 'PPD [ID]', 'Sem 3, 3 SKS', 'TE'),
  ('2209', 'Selasa', '10:15', '12:45', 'ITI1 [IUP]', 'Sem 1, 3 SKS', null),
  ('2209', 'Selasa', '13:30', '16:00', 'ITI1 [C]', 'Sem 1, 3 SKS', null),
  ('2209', 'Selasa', '16:00', '18:30', 'PPPL [B] P1', 'Sem 5, 4 SKS', null),
  ('2209', 'Rabu', '07:30', '10:00', 'POK [ID] P1', 'Sem 7, 4 SKS', 'AN'),
  ('2209', 'Rabu', '10:15', '12:45', 'E-Commerce [ID]', 'Sem 5, 3 SKS', null),
  ('2209', 'Rabu', '13:30', '16:00', 'PSTI [D] P2', 'Sem 5, 4 SKS', null),
  ('2209', 'Rabu', '16:00', '18:30', 'ASD [B] P1', 'Sem 3, 4 SKS', null),
  ('2209', 'Kamis', '07:30', '10:00', 'PEB [C]', 'Sem 1, 2 SKS', null),
  ('2209', 'Kamis', '10:15', '12:45', 'MEOTI [B]', 'Sem 5, 3 SKS', null),
  ('2209', 'Kamis', '13:30', '16:00', 'PPPL [B] P2', 'Sem 5, 4 SKS', null),
  ('2103', 'Senin', '07:30', '10:00', 'Filsafat [A]', 'Sem 1, 3 SKS', 'Week 1-5'),
  ('2103', 'Senin', '10:15', '12:45', 'KI [ID] P1', 'Sem 7, 4 SKS', 'IZ'),
  ('2103', 'Senin', '13:30', '16:00', 'OFB [IUP]', 'Sem 1, 3 SKS', null),
  ('2103', 'Selasa', '07:30', '10:00', 'MetPenSI [A]', 'Sem 1, 3 SKS', 'AM'),
  ('2103', 'Selasa', '10:15', '12:45', 'ABD [IUP]', 'Sem 3, 3 SKS', null),
  ('2103', 'Selasa', '13:30', '16:00', 'MetPen [A]', 'Sem 2, 3 SKS', 'BS'),
  ('2103', 'Selasa', '16:00', '18:30', 'PSO [A] P1', 'Sem 6, 4 SKS', null),
  ('2103', 'Rabu', '07:30', '10:00', 'Cognitif [A]', 'Sem 6, 3 SKS', 'RK'),
  ('2103', 'Rabu', '10:15', '12:45', 'SC [A]', 'Sem 7, 3 SKS', null),
  ('2103', 'Rabu', '13:30', '16:00', 'T-Cogn [A]', 'Sem 3, 3 SKS', null),
  ('2103', 'Kamis', '07:30', '10:00', 'STAT [R] P2', 'Sem 2, 4 SKS', null),
  ('2103', 'Kamis', '10:15', '12:45', 'PEB [IUP]', 'Sem 1, 2 SKS', null),
  ('2103', 'Kamis', '13:30', '16:00', 'PSO [A] P2', 'Sem 6, 4 SKS', null),
  ('2103', 'Kamis', '16:00', '18:30', 'MHP [A]', 'Sem 7, 3 SKS', 'Week 1 - 8'),
  ('2103', 'Jumat', '13:30', '16:00', 'PAI [IUP] P2', 'Sem 5, 4 SKS', null),
  ('4101', 'Senin', '07:30', '10:00', 'OFB [D]', 'Sem 1, 3 SKS', null),
  ('4101', 'Senin', '10:15', '12:45', 'PSTI [B] P1', 'Sem 5, 4 SKS', null),
  ('4101', 'Senin', '13:30', '16:00', 'PEB [D]', 'Sem 1, 2 SKS', null),
  ('4101', 'Selasa', '07:30', '10:00', 'ADD [C]', 'Sem 3, 3 SKS', null),
  ('4101', 'Selasa', '10:15', '12:45', 'PPPL [C] P1', 'Sem 5, 4 SKS', null),
  ('4101', 'Selasa', '13:30', '16:00', 'ABD [C]', 'Sem 3, 3 SKS', 'RH'),
  ('4101', 'Rabu', '07:30', '10:00', 'PPPL [A] P2', 'Sem 5, 4 SKS', null),
  ('4101', 'Rabu', '10:15', '12:45', 'RO [B]', 'Sem 3, 3 SKS', null),
  ('4101', 'Rabu', '13:30', '16:00', 'MLTI [B]', 'Sem 5, 3 SKS', null),
  ('4101', 'Kamis', '07:30', '10:00', 'Etika [B]', 'Sem 4, 2 SKS', null),
  ('4101', 'Kamis', '10:15', '12:45', 'KS [ID]', 'Sem 1, 3 SKS', null),
  ('4101', 'Kamis', '13:30', '16:00', 'ASD [A] P2', 'Sem 3, 4 SKS', null),
  ('4101', 'Jumat', '07:00', '09:30', 'PAI [D] P2', 'Sem 5, 4 SKS', null),
  ('4101', 'Jumat', '13:30', '16:00', 'PPPL [D] P2', 'Sem 5, 4 SKS', null),
  ('4102', 'Senin', '07:30', '10:00', 'PD [ID]', 'Sem 1, 3 SKS', null),
  ('4102', 'Senin', '10:15', '12:45', 'Tekber [ID]', 'Sem 5, 3 SKS', null),
  ('4102', 'Senin', '13:30', '16:00', 'PPPL [A] P1', 'Sem 5, 4 SKS', null),
  ('4102', 'Selasa', '07:30', '10:00', 'OFB [C]', 'Sem 1, 3 SKS', null),
  ('4102', 'Selasa', '10:15', '12:45', 'DT [ID]', 'Sem 1, 3 SKS', 'AN'),
  ('4102', 'Selasa', '13:30', '16:00', 'ADD [A]', 'Sem 3, 3 SKS', null),
  ('4102', 'Rabu', '07:30', '10:00', 'RO [C]', 'Sem 3, 3 SKS', null),
  ('4102', 'Rabu', '10:15', '12:45', 'SE [C] P2', 'Sem 3, 4 SKS', 'AP'),
  ('4102', 'Rabu', '13:30', '16:00', 'PEB [B]', 'Sem 1, 2 SKS', null),
  ('4102', 'Kamis', '07:30', '10:00', 'PSTI [A] P2', 'Sem 5, 4 SKS', null),
  ('4102', 'Kamis', '10:15', '12:45', 'MPT [B]', 'Sem 3, 3 SKS', null),
  ('4102', 'Kamis', '13:30', '16:00', 'OFB [B]', 'Sem 1, 3 SKS', null),
  ('4102', 'Jumat', '07:00', '09:30', 'RO [A]', 'Sem 3, 3 SKS', null),
  ('4102', 'Jumat', '13:30', '16:00', 'ASD [B] P2', 'Sem 3, 4 SKS', null),
  ('4201', 'Senin', '07:30', '10:00', 'SE [D] P1', 'Sem 3, 4 SKS', 'DT'),
  ('4201', 'Senin', '10:15', '12:45', 'PAI [C] P1', 'Sem 5, 4 SKS', null),
  ('4201', 'Senin', '13:30', '16:00', 'ADD [B]', 'Sem 3, 3 SKS', null),
  ('4201', 'Selasa', '07:30', '10:00', 'SDI [ID]', 'Sem 5, 3 SKS', null),
  ('4201', 'Selasa', '10:15', '12:45', 'LSD [D]', 'Sem 1, 3 SKS', null),
  ('4201', 'Selasa', '13:30', '16:00', 'ADD [D]', 'Sem 3, 3 SKS', null),
  ('4201', 'Rabu', '07:30', '10:00', 'Etika [A]', 'Sem 4, 2 SKS', null),
  ('4201', 'Rabu', '10:15', '12:45', 'MLTI [A]', 'Sem 5, 3 SKS', null),
  ('4201', 'Rabu', '13:30', '16:00', 'SE [D] P2', 'Sem 3, 4 SKS', 'DT'),
  ('4201', 'Kamis', '07:30', '10:00', 'MPT [A]', 'Sem 3, 3 SKS', null),
  ('4201', 'Kamis', '10:15', '12:45', 'PSTI [C] P2', 'Sem 5, 4 SKS', null),
  ('4201', 'Kamis', '13:30', '16:00', 'SE [B] P2', 'Sem 3, 4 SKS', null),
  ('4201', 'Jumat', '07:00', '09:30', 'POK [ID] P2', 'Sem 7, 4 SKS', 'AN'),
  ('4201', 'Jumat', '13:30', '16:00', 'PSTI [B] P2', 'Sem 5, 4 SKS', null),
  ('4202', 'Senin', '07:30', '10:00', 'SE [A] P1', 'Sem 3, 4 SKS', null),
  ('4202', 'Senin', '10:15', '12:45', 'PSTI [D] P1', 'Sem 5, 4 SKS', null),
  ('4202', 'Senin', '13:30', '16:00', 'ASD [D] P1', 'Sem 3, 4 SKS', null),
  ('4202', 'Selasa', '07:30', '10:00', 'SE [B] P1', 'Sem 3, 4 SKS', null),
  ('4202', 'Selasa', '10:15', '12:45', 'MEOTI [A]', 'Sem 5, 3 SKS', null),
  ('4202', 'Selasa', '13:30', '16:00', 'Tekber [C]', 'Sem 5, 3 SKS', 'DT'),
  ('4202', 'Rabu', '07:30', '10:00', 'MHP [A]', 'Sem 7, 3 SKS', 'Week 9 - 16'),
  ('4202', 'Rabu', '10:15', '12:45', 'AP [ID]', 'Sem 3, 3 SKS', null),
  ('4202', 'Rabu', '13:30', '16:00', 'KDT [ID] P1', 'Sem 3, 4 SKS', 'AH'),
  ('4202', 'Kamis', '07:30', '10:00', 'PN [ID]', 'Sem 3, 3 SKS', null),
  ('4202', 'Kamis', '10:15', '12:45', 'MLTI [D]', 'Sem 5, 3 SKS', null),
  ('4202', 'Kamis', '13:30', '16:00', 'Tekber [A]', 'Sem 5, 3 SKS', 'DT'),
  ('4202', 'Jumat', '07:00', '09:30', 'PAI [B] P2', 'Sem 5, 4 SKS', null),
  ('4202', 'Jumat', '13:30', '16:00', 'PAI [C] P2', 'Sem 5, 4 SKS', null),
  ('st-apter-1305', 'Senin', '07:30', '10:00', 'PSTI [A] P1', 'Sem 5, 4 SKS', null),
  ('st-apter-1305', 'Senin', '10:15', '12:45', 'ASD [C] P1', 'Sem 3, 4 SKS', null),
  ('st-apter-1305', 'Senin', '13:30', '16:00', 'MEOTI [D]', 'Sem 5, 3 SKS', null),
  ('st-apter-1305', 'Senin', '16:00', '18:30', 'KI [ID] P1', 'Sem 7, 4 SKS', 'RZ'),
  ('st-apter-1305', 'Selasa', '07:30', '10:00', 'ABD [D]', 'Sem 3, 3 SKS', 'RH'),
  ('st-apter-1305', 'Selasa', '10:15', '12:45', 'Tekber [D]', 'Sem 5, 3 SKS', null),
  ('st-apter-1305', 'Selasa', '13:30', '16:00', 'Ventura [ID]', 'Sem 5, 3 SKS', null),
  ('st-apter-1305', 'Rabu', '07:30', '10:00', 'PPPL [IUP] P2', 'Sem 5, 4 SKS', null),
  ('st-apter-1305', 'Rabu', '10:15', '12:45', 'LSD [C]', 'Sem 1, 3 SKS', null),
  ('st-apter-1305', 'Rabu', '13:30', '16:00', 'SE [A] P2', 'Sem 3, 4 SKS', null),
  ('st-apter-1305', 'Kamis', '07:30', '10:00', 'MPO [ID]', 'Sem 7, 3 SKS', null),
  ('st-apter-1305', 'Kamis', '10:15', '12:45', 'ASD [C] P2', 'Sem 3, 4 SKS', null),
  ('st-apter-1305', 'Kamis', '13:30', '16:00', 'PSTI [IUP] P2', 'Sem 5, 4 SKS', null),
  ('st-apter-1305', 'Kamis', '16:00', '18:30', 'PPPL [C] P2', 'Sem 5, 4 SKS', null),
  ('st-prog-1302', 'Senin', '07:30', '10:00', 'LSD [B]', 'Sem 1, 3 SKS', null),
  ('st-prog-1302', 'Senin', '10:15', '12:45', 'RO [D]', 'Sem 3, 3 SKS', 'AD'),
  ('st-prog-1302', 'Senin', '13:30', '16:00', 'MSTI [ID] P1', 'Sem 7, 4 SKS', 'TE'),
  ('st-prog-1302', 'Senin', '16:00', '18:30', 'IPO [A]', 'Sem 2, 3 SKS', null),
  ('st-prog-1302', 'Selasa', '07:30', '10:00', 'PBA [A]', 'Sem 7, 3 SKS', 'Week 1-8'),
  ('st-prog-1302', 'Selasa', '10:15', '12:45', 'Tekber [B]', 'Sem 5, 3 SKS', 'DT'),
  ('st-prog-1302', 'Selasa', '13:30', '16:00', 'OFB [A]', 'Sem 1, 3 SKS', null),
  ('st-prog-1302', 'Rabu', '07:30', '10:00', 'ABD [B]', 'Sem 3, 3 SKS', 'RH'),
  ('st-prog-1302', 'Rabu', '10:15', '12:45', 'ABD [A]', 'Sem 3, 3 SKS', 'RH'),
  ('st-prog-1302', 'Rabu', '13:30', '16:00', 'KI [ID] P2', 'Sem 7, 4 SKS', 'RZ'),
  ('st-prog-1302', 'Rabu', '16:00', '18:30', 'MSTI [ID] P2', 'Sem 7, 4 SKS', 'TE'),
  ('st-prog-1302', 'Kamis', '07:30', '10:00', 'SE [IUP] P2', 'Sem 3, 4 SKS', 'DT'),
  ('st-prog-1302', 'Kamis', '10:15', '12:45', 'IB [ID]', 'Sem 5, 3 SKS', null),
  ('st-prog-1302', 'Kamis', '13:30', '16:00', 'MB [ID]', 'Sem 3, 3 SKS', null),
  ('2102', 'Senin', '13:30', '16:00', 'PPPL [IUP] P1', 'Sem 5, 4 SKS', null),
  ('2102', 'Selasa', '07:30', '10:00', 'LSD [IUP]', 'Sem 1, 3 SKS', null),
  ('2102', 'Selasa', '10:15', '12:45', 'PPS [A]', 'Sem 1, 3 SKS', 'RM'),
  ('2102', 'Selasa', '13:30', '16:00', 'MPT [IUP]', 'Sem 3, 3 SKS', null),
  ('2102', 'Rabu', '07:30', '10:00', 'ITI2 [A]', 'Sem 1, 3 SKS', null),
  ('2102', 'Rabu', '10:15', '12:45', 'MDIK [A]', 'Sem 1, 3 SKS', 'NA'),
  ('2102', 'Rabu', '13:30', '16:00', 'MTL [A]', 'Sem 1, 3 SKS', null),
  ('2102', 'Kamis', '07:30', '10:00', 'PAP2 [A]', 'Sem 7, 3 SKS', null),
  ('2102', 'Kamis', '10:15', '12:45', 'PBA [A]', 'Sem 7, 3 SKS', 'Week 9-16'),
  ('2102', 'Kamis', '13:30', '16:00', 'ADD [IUP]', 'Sem 3, 3 SKS', null);
