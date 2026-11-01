# RuangKita

Prototipe statis untuk eksperimen Q2.04. Peserta dapat mencari dan memfilter ruang kampus, membuka detail, membandingkan hingga tiga pilihan, dan menyelesaikan tiga skenario. Panel moderator dan catatan sesi tersedia melalui hash route.

## Jalankan lokal

Tidak ada dependency atau langkah build. Dari folder repository, jalankan:

```bash
python -m http.server 8000
```

Buka `http://localhost:8000`.

## Rute prototipe

- `/#/` — dashboard peserta
- `/#/room/si-301` — contoh detail ruang
- `/#/compare` — pilih dan bandingkan maksimal tiga ruang
- `/#scenario1` — menemukan ruang berdasarkan kebutuhan
- `/#scenario2` — memeriksa kondisi Ruang SI-301
- `/#scenario3` — menentukan ruang untuk rapat kelompok
- `/#/moderator` — panduan moderator dan data sesi lokal

Rute `/#/scenario1` maupun `/#/scenario-1` (serta pola sama untuk skenario 2 dan 3) didukung. URL skenario lama `/#/test/scenario-1`, `-2`, dan `-3` juga tetap didukung.

## Data eksperimen

Jawaban akhir, waktu mulai/selesai tiap skenario, dan riwayat navigasi dasar disimpan di `localStorage` browser dengan key `ruangkita-q204-experiment-v1`. Data tidak dikirim ke server. Panel moderator dapat menampilkan riwayat, mengekspor JSON, memulai ulang skenario, atau mereset semua catatan. Data tersimpan hanya pada browser/perangkat yang digunakan peserta.

Sepuluh ruang, jadwal, kapasitas, fasilitas, dan waktu pembaruan merupakan data fiktif untuk eksperimen. Status ditampilkan sebagai teks dengan label dan ikon, bukan hanya warna.

## GitHub Pages

Pilih branch repository dan folder root sebagai sumber GitHub Pages. Website memakai HTML/CSS/JavaScript statis dan hash navigation, sehingga tidak membutuhkan backend, database, base path, atau fallback routing khusus. Setelah perubahan ditinjau, commit dan push ke branch yang dipakai GitHub Pages.
