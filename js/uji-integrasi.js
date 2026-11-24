// Uji integrasi RuangKita: memeriksa hubungan antarkomponen (browser ↔ Supabase API ↔ database ↔ aturan keamanan)
// terhadap database sungguhan, dengan hak akses pengunjung biasa (anon key).
(() => {
  const cfg = window.RK_CONFIG;
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, { auth: { persistSession: false } });
  const out = document.querySelector('#app');
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const nextDay = (dow, weeksAhead) => { const d = new Date(); d.setDate(d.getDate() + ((dow - d.getDay() + 7) % 7) + 7 * weeksAhead); return iso(d); };
  const senin = nextDay(1, 3);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ajukan = (o = {}) => sb.rpc('ajukan_peminjaman', {
    p_ruang_id: '2102', p_tanggal: senin, p_jam_mulai: '07:00', p_jam_selesai: '07:15', p_peserta: 5,
    p_nama_kegiatan: '[UJI INTEGRASI] Cek alur data', p_organisasi: 'Uji sistem', p_penanggung_jawab: 'Penguji RuangKita', p_kontak: '0000000000', ...o
  });

  const tests = [
    { id: 'I01', name: 'Browser → API → tabel ruangan', expect: '12 ruangan terbaca',
      run: async () => { const { data, error } = await sb.from('ruangan').select('id'); if (error) throw error; return [data.length === 12, `${data.length} ruangan terbaca`]; } },
    { id: 'I02', name: 'Browser → API → tabel jadwal_kuliah', expect: '165 jadwal terbaca',
      run: async () => { const { count, error } = await sb.from('jadwal_kuliah').select('*', { count: 'exact', head: true }); if (error) throw error; return [count === 165, `${count} jadwal terbaca`]; } },
    { id: 'I03', name: 'Pengunjung membaca tabel pengajuan langsung', expect: 'Ditolak (data kontak terlindungi)',
      run: async () => { const { data, error } = await sb.from('pengajuan').select('kontak').limit(1); return [!!error || (data || []).length === 0, error ? `Ditolak: ${error.message}` : `Terbaca ${data.length} baris`]; } },
    { id: 'I04', name: 'Pengunjung menulis langsung ke tabel pengajuan', expect: 'Ditolak (harus lewat fungsi server)',
      run: async () => { const { error } = await sb.from('pengajuan').insert({ kode: 'RK-HACK01', ruang_id: '2102', tanggal: senin, jam_mulai: '07:00', jam_selesai: '07:15', peserta: 1, nama_kegiatan: 'x', organisasi: 'x', penanggung_jawab: 'x', kontak: 'x' }); return [!!error, error ? `Ditolak: ${error.message}` : 'Berhasil menulis (tidak aman)']; } },
    { id: 'I05', name: 'View publik jadwal_pengajuan tidak memuat kontak', expect: 'Kolom kontak tidak tersedia',
      run: async () => { const a = await sb.from('jadwal_pengajuan').select('status').limit(1); const b = await sb.from('jadwal_pengajuan').select('kontak').limit(1); return [!a.error && !!b.error, a.error ? `View gagal dibaca: ${a.error.message}` : `View terbaca; kolom kontak: ${b.error ? 'tidak tersedia' : 'TERSEDIA'}`]; } },
    { id: 'I06', name: 'Server menolak pengajuan yang bentrok jadwal kuliah', expect: 'Ditolak: dipakai perkuliahan',
      run: async () => { const { error } = await ajukan({ p_ruang_id: '2104', p_jam_mulai: '13:30', p_jam_selesai: '14:00' }); return [!!error && /perkuliahan/.test(error.message), error ? `Ditolak: ${error.message}` : 'Diterima (salah)']; } },
    { id: 'I07', name: 'Server menolak peserta melebihi kapasitas', expect: 'Ditolak: melebihi kapasitas',
      run: async () => { const { error } = await ajukan({ p_peserta: 31 }); return [!!error && /kapasitas/.test(error.message), error ? `Ditolak: ${error.message}` : 'Diterima (salah)']; } },
    { id: 'I08', name: 'Server menolak tanggal akhir pekan', expect: 'Ditolak: hanya Senin–Jumat',
      run: async () => { const { error } = await ajukan({ p_tanggal: nextDay(6, 3) }); return [!!error && /Senin/.test(error.message), error ? `Ditolak: ${error.message}` : 'Diterima (salah)']; } },
    { id: 'I09', name: 'Pengunjung memanggil fungsi keputusan TU', expect: 'Ditolak (khusus TU)',
      run: async () => { const { error } = await sb.rpc('putuskan_pengajuan', { p_id: '00000000-0000-0000-0000-000000000000', p_status: 'disetujui', p_catatan: null }); return [!!error, error ? `Ditolak: ${error.message}` : 'Diterima (tidak aman)']; } },
    { id: 'I10', name: 'Cek status dengan kode yang tidak ada', expect: 'Pesan: kode tidak ditemukan',
      run: async () => { const { error } = await sb.rpc('cek_pengajuan', { p_kode: 'RK-000000' }); return [!!error && /tidak ditemukan/.test(error.message), error ? error.message : 'Ada hasil (salah)']; } }
  ];

  const writeTest = { id: 'I11', name: 'Tulis → simpan → baca kembali (fungsi ajukan → tabel → cek status → view publik)', expect: 'Kode terbit, status menunggu, muncul di view publik',
    run: async () => {
      const a = await ajukan(); if (a.error) return [false, `Pengajuan ditolak: ${a.error.message}`];
      const kode = a.data.kode;
      const c = await sb.rpc('cek_pengajuan', { p_kode: kode }); if (c.error) return [false, `Kode ${kode} tidak bisa dibaca: ${c.error.message}`];
      const v = await sb.from('jadwal_pengajuan').select('ruang_id, status').eq('tanggal', senin).eq('ruang_id', '2102');
      const seen = !v.error && v.data.some(x => x.status === 'menunggu');
      return [c.data.status === 'menunggu' && seen, `Kode ${kode} · status ${c.data.status} · ${seen ? 'muncul' : 'TIDAK muncul'} di view publik (${senin}, 07.00–07.15)`];
    } };

  const row = (t, r) => `<tr class="${r ? (r.ok ? 'ok-row' : 'fail-row') : ''}"><td class="code">${t.id}</td><td>${esc(t.name)}</td><td>${esc(t.expect)}</td><td>${r ? esc(r.msg) : '—'}</td><td>${r ? (r.ok ? '<strong class="pass">PASS</strong>' : '<strong class="fail">FAIL</strong>') : ''}</td></tr>`;
  const render = (results, wr) => {
    const done = [...results.filter(Boolean), ...(wr ? [wr] : [])];
    out.innerHTML = `<section class="page-head"><span class="eyebrow">Uji integrasi</span><h1>Uji integrasi RuangKita</h1>
      <p class="hero-copy">Memeriksa hubungan browser ↔ Supabase API ↔ database ↔ aturan keamanan pada database sungguhan, dengan hak akses pengunjung biasa.</p>
      <p class="muted-note">Dijalankan: ${new Date().toLocaleString('id-ID')} · ${done.filter(r => r.ok).length}/${done.length} PASS</p></section>
      <div class="panel"><table class="test-table"><thead><tr><th>ID</th><th>Skenario</th><th>Expected</th><th>Actual</th><th>Status</th></tr></thead>
      <tbody>${tests.map((t, i) => row(t, results[i])).join('')}${row(writeTest, wr)}</tbody></table></div>
      ${wr ? '' : `<div class="actions mt"><button class="button-primary" id="run-write">Jalankan I11 (membuat 1 pengajuan uji)</button></div>
      <p class="muted-note">I11 membuat satu pengajuan bertanda "[UJI INTEGRASI]" di Ruang 2102, ${senin} pukul 07.00–07.15. Tolak pengajuan ini dari panel TU setelah selesai.</p>`}`;
    const b = document.querySelector('#run-write');
    if (b) b.onclick = async () => { b.disabled = true; b.textContent = 'Menjalankan…'; let r; try { const [ok, msg] = await writeTest.run(); r = { ok, msg }; } catch (e) { r = { ok: false, msg: e.message }; } render(results, r); };
  };

  (async () => {
    const results = [];
    render(results);
    for (const t of tests) {
      try { const [ok, msg] = await t.run(); results.push({ ok, msg }); }
      catch (e) { results.push({ ok: false, msg: e.message || String(e) }); }
      render(results);
    }
  })();
})();
