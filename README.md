# RuangKita — Prototype Q3.03

Clickable prototype untuk satu aktivitas utama dari Experience Design Blueprint Q3.02:
**mencari ruangan dan memastikan apakah ruangan dapat digunakan.**

Website statis (HTML/CSS/JavaScript) tanpa backend. Bisa dibuka langsung di GitHub Pages.

## Alur (sesuai user flow Q3.02)

| Layar | URL | Isi |
|---|---|---|
| 1. Beranda & pencarian | `#/` | Input hari, jam mulai, jam selesai, jumlah peserta |
| 2. Hasil pencarian | `#/hasil?...` | Ruangan dikelompokkan: bisa diajukan / perlu kepastian TU / tidak bisa dipakai. Jika kosong, muncul saran waktu & hari lain |
| 3. Detail ruangan | `#/ruang/<id>?...` | Kapasitas, jadwal hari itu, **kondisi menurut jadwal** dan **status persetujuan** (dipisah) |
| 4. Langkah selanjutnya | `#/ruang/<id>/langkah?...` | Ajukan ke TU / hubungi TU / cari alternatif, sesuai status |
| 5. Selesai | `#/selesai/<id>?...` | Ringkasan pilihan dan langkah berikutnya (layar sukses untuk alat uji) |

"Cari alternatif" kembali ke hasil pencarian dengan kriteria yang sama dan mengecualikan ruangan yang sedang dilihat (`&kecuali=<id>`).

## Data

- **Ruangan & kapasitas**: 12 ruang DSI (data tim).
- **Jadwal kuliah**: Jadwal Gasal DSI 2026/2027 V.2.7 (`js/data.js` → `schedule`).
- **Status persetujuan**: **data contoh/fiktif** (`js/data.js` → `bookings`), untuk menguji perbedaan "kosong" dan "boleh dipakai".

Contoh skenario uji: Rabu 16.00–17.30, 15 orang (semua status muncul). Senin 13.00–14.00, 15 orang (tidak ada ruangan, menguji jalur ubah kriteria).

## Jalankan lokal

```bash
python -m http.server 8000
```

Versi eksperimen Q2.04 tetap tersimpan di riwayat Git (commit `0442de9`).
