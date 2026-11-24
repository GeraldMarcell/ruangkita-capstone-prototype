# RuangKita — MVP Q3.05 (Integrated)

Website untuk mahasiswa DSI ITS mencari ruangan, mengajukan peminjaman ke TU, dan melihat status persetujuannya.

**Fungsi inti (Q3.04):** pengajuan peminjaman ruangan dengan status persetujuan nyata.
Mahasiswa mengajukan → data tersimpan di Supabase → status ruangan berubah di hasil pencarian → TU menyetujui/menolak → mahasiswa mengecek status dengan kode pengajuan.

## Halaman
| Halaman | Fungsi |
|---|---|
| `index.html` | Cari ruangan (tanggal, jam, peserta) → hasil → detail → form pengajuan |
| `selesai.html?kode=…` | Konfirmasi pengajuan tersimpan + kode |
| `status.html` | Cek status pengajuan dengan kode |
| `tu.html` | Panel petugas TU: login, lihat pengajuan, setujui/tolak |
| `uji-integrasi.html` | Uji integrasi otomatis (browser ↔ API ↔ database ↔ aturan keamanan) |

## Arsitektur
GitHub Pages (HTML/CSS/JS) → `supabase-js` → Supabase (PostgreSQL + Auth).
- Tabel: `ruangan`, `jadwal_kuliah`, `pengajuan`, `petugas_tu`; view publik `jadwal_pengajuan`.
- Fungsi: `ajukan_peminjaman`, `cek_pengajuan`, `putuskan_pengajuan`, `is_tu` (validasi di server).
- Row Level Security: publik hanya bisa membaca ruangan, jadwal, dan status ruangan; data kontak hanya untuk petugas TU.

## Setup database
1. Supabase → SQL Editor → jalankan `supabase/setup.sql`.
2. Authentication → Users → buat akun TU.
3. Jalankan `supabase/petugas_tu.sql` dengan email akun TU tersebut.
4. Isi `js/config.js` dengan Project URL dan anon/publishable key.

## Pembaruan Q3.05
- Menyetujui satu pengajuan otomatis menolak pengajuan lain yang masih menunggu pada ruang & waktu yang sama (`supabase/q305-update.sql`).
- Kode pengajuan bisa disalin, dikirim ke WhatsApp, dan tersimpan di perangkat (menu Cek status).

Versi sebelumnya: tag `q304-v1`, tag `q303-v1`, `q303-v2` (prototype Q3.03 dengan data contoh).
