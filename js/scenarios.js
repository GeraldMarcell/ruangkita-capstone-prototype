(() => {
  const scenarios = [
    {
      id: 'scenario1', title: 'Menemukan ruangan',
      task: 'Kamu membutuhkan ruangan untuk diskusi kelompok berisi 15 orang di Gedung Sistem Informasi. Gunakan RuangKita untuk menemukan ruangan yang sesuai.',
      hint: 'Cari informasi yang kamu butuhkan, lalu pilih ruang yang akan kamu rekomendasikan.',
      answerPrompt: 'Ruang mana yang akan kamu rekomendasikan?',
      objective: 'Mengamati apakah peserta dapat menemukan dan menyaring ruang berdasarkan lokasi serta kapasitas.',
      criteria: ['Menemukan daftar ruang di Gedung Sistem Informasi.', 'Menggunakan informasi kapasitas untuk mempertimbangkan kebutuhan 15 orang.', 'Menjelaskan alasan pemilihan berdasarkan informasi yang ditemukan.'],
      answers: 'rooms'
    },
    {
      id: 'scenario2', title: 'Memeriksa kondisi ruangan',
      task: 'Periksa kondisi Ruang SI-301 saat ini. Jelaskan informasi apa yang kamu temukan tentang penggunaan ruang tersebut.',
      hint: 'Kamu dapat membuka detail ruang untuk melihat informasi yang tersedia.',
      answerPrompt: 'Bagaimana kondisi Ruang SI-301 menurut informasi yang kamu lihat?',
      objective: 'Mengamati apakah peserta dapat menemukan detail ruang dan membedakan kondisi saat ini dari status penggunaannya.',
      criteria: ['Membuka detail Ruang SI-301.', 'Mengidentifikasi kondisi aktivitas ruang saat ini.', 'Menjelaskan status penggunaan ruang berdasarkan label yang ditampilkan.'],
      answers: ['Sedang digunakan · Tidak tersedia', 'Sedang digunakan · Perlu konfirmasi', 'Tidak sedang digunakan · Tidak tersedia', 'Tidak sedang digunakan · Perlu konfirmasi', 'Saya belum yakin']
    },
    {
      id: 'scenario3', title: 'Menentukan ruangan untuk digunakan',
      task: 'Kamu ingin mengadakan rapat kelompok kecil selama satu jam sore ini. Periksa informasi yang tersedia dan tentukan ruangan yang paling memungkinkan digunakan.',
      hint: 'Bandingkan kondisi ruang, status penggunaan, kapasitas, dan jadwal yang tersedia.',
      answerPrompt: 'Ruang mana yang akan kamu pilih?',
      objective: 'Mengamati cara peserta membandingkan kondisi, status penggunaan, kapasitas, dan jadwal sebelum menentukan pilihan.',
      criteria: ['Membandingkan informasi lebih dari satu ruang.', 'Mempertimbangkan status penggunaan dan jadwal.', 'Menyebutkan alasan yang merujuk pada informasi di prototipe.'],
      answers: 'rooms'
    }
  ];
  window.RuangKita = window.RuangKita || {};
  window.RuangKita.scenarios = scenarios;
})();
