-- =====================================================================
-- RuangKita Q3.05 — pembaruan fungsi keputusan TU
-- Jalankan SEKALI di Supabase: SQL Editor → New query → tempel → Run.
-- Tidak menghapus data yang sudah ada.
-- =====================================================================
-- Petugas TU menyetujui atau menolak pengajuan.
-- Saat menyetujui, pengajuan lain yang masih menunggu dan bentrok (ruang, tanggal, jam sama)
-- otomatis ditolak supaya mahasiswa lain langsung tahu dan bisa mencari alternatif.
create or replace function public.putuskan_pengajuan(p_id uuid, p_status text, p_catatan text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v pengajuan%rowtype;
  v_email text := auth.jwt() ->> 'email';
  v_otomatis text[] := '{}';
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
         diputuskan_pada = now(), diputuskan_oleh = v_email
   where id = p_id;

  if p_status = 'disetujui' then
    with ditolak as (
      update pengajuan x
         set status = 'ditolak',
             catatan_tu = 'Ditolak otomatis: ruangan sudah disetujui untuk kegiatan lain pada waktu yang sama (' || v.kode || '). Silakan cari ruangan atau waktu lain.',
             diputuskan_pada = now(), diputuskan_oleh = v_email
       where x.id <> v.id and x.status = 'menunggu' and x.ruang_id = v.ruang_id and x.tanggal = v.tanggal
         and x.jam_mulai < v.jam_selesai and v.jam_mulai < x.jam_selesai
      returning x.kode
    )
    select coalesce(array_agg(kode order by kode), '{}') into v_otomatis from ditolak;
  end if;

  return jsonb_build_object('kode', v.kode, 'status', p_status, 'ditolak_otomatis', to_jsonb(v_otomatis));
end;
$$;

revoke all on function public.putuskan_pengajuan(uuid, text, text) from public;
grant execute on function public.putuskan_pengajuan(uuid, text, text) to authenticated;
