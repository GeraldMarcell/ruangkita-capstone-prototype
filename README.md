# RuangKita

Prototipe statis untuk eksperimen Q2.04 — Run The Experiment. RuangKita membantu mahasiswa melihat informasi ruang kampus dan mengeksplorasi perbedaan antara kondisi ruang saat ini dengan status penggunaannya.

## Menjalankan secara lokal

Tidak perlu instalasi dependency atau backend. Buka `index.html` langsung di browser, atau jalankan server statis dari folder proyek:

```bash
python -m http.server 8000
```

Kemudian buka `http://localhost:8000`.

## Mode eksperimen

Mode instruksi menggunakan URL hash sehingga setiap skenario dapat dibuka langsung di GitHub Pages:

- `/#/test` — skenario pertama
- `/#/test/scenario-1` — memahami status Ruang Diskusi 1
- `/#/test/scenario-2` — menentukan ruang yang sesuai
- `/#/test/scenario-3` — membandingkan ruang untuk diskusi sore

Peserta dapat melanjutkan ke detail, kembali menjelajahi daftar, mencari atau memfilter ruang, dan membandingkan beberapa ruang. Catatan respons peserta tetap dilakukan oleh moderator di luar prototipe.

## Build dan deploy

Proyek ini memakai HTML, CSS, dan JavaScript biasa, jadi tidak memiliki langkah kompilasi. Deploy file proyek apa adanya ke GitHub Pages dengan memilih branch dan folder yang berisi `index.html` sebagai sumber. Navigasi hash (`#/...`) tidak memerlukan fallback routing server. Tidak ada backend, login, atau database.

## Data dan catatan eksperimen

Enam ruang dan jadwalnya bersifat fiktif dan ditulis di `script.js`. Kombinasi status mendukung tiga skenario eksperimen. Keberhasilan interpretasi desain belum divalidasi dan perlu diamati bersama peserta.
