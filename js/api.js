// Lapisan data RuangKita: semua komunikasi dengan Supabase ada di file ini.
(() => {
  const cfg = window.RK_CONFIG || {};
  const configured = /^https?:\/\//.test(cfg.supabaseUrl || '') && (cfg.supabaseKey || '').length > 20;
  const sb = configured ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey) : null;

  const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const hhmm = t => String(t).slice(0, 5).replace(':', '.');   // "16:00:00" -> "16.00"
  const toSql = t => String(t).replace('.', ':');               // "16.00" -> "16:00"
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

  const fail = error => { const e = new Error(error?.message || 'Terjadi kesalahan saat menghubungi server.'); e.cause = error; throw e; };
  const need = () => { if (!sb) throw new Error('RuangKita belum terhubung ke database. Isi js/config.js dengan Project URL dan anon key Supabase.'); };

  async function loadMaster() {
    need();
    const [r, j] = await Promise.all([
      sb.from('ruangan').select('id, nama, kapasitas, urutan').order('urutan'),
      sb.from('jadwal_kuliah').select('ruang_id, hari, jam_mulai, jam_selesai, mata_kuliah, keterangan, catatan')
    ]);
    if (r.error) fail(r.error);
    if (j.error) fail(j.error);
    const rooms = r.data.map(x => ({ id: x.id, name: x.nama, capacity: x.kapasitas }));
    const schedule = {};
    j.data.forEach(c => (schedule[c.ruang_id] ||= []).push({
      day: c.hari, start: hhmm(c.jam_mulai), end: hhmm(c.jam_selesai), course: c.mata_kuliah, info: c.keterangan || '', note: c.catatan || ''
    }));
    return { rooms, schedule };
  }

  async function loadBookings() {
    need();
    const { data, error } = await sb.from('jadwal_pengajuan').select('ruang_id, tanggal, jam_mulai, jam_selesai, nama_kegiatan, status').gte('tanggal', today());
    if (error) fail(error);
    return data.map(x => ({ room: x.ruang_id, date: x.tanggal, start: hhmm(x.jam_mulai), end: hhmm(x.jam_selesai), activity: x.nama_kegiatan, status: x.status === 'disetujui' ? 'approved' : 'pending' }));
  }

  async function submitRequest(p) {
    need();
    const { data, error } = await sb.rpc('ajukan_peminjaman', {
      p_ruang_id: p.roomId, p_tanggal: p.date, p_jam_mulai: toSql(p.start), p_jam_selesai: toSql(p.end), p_peserta: Number(p.participants),
      p_nama_kegiatan: p.activity, p_organisasi: p.organization, p_penanggung_jawab: p.pic, p_kontak: p.contact
    });
    if (error) fail(error);
    return data; // { kode, status }
  }

  async function checkRequest(code) {
    need();
    const { data, error } = await sb.rpc('cek_pengajuan', { p_kode: code });
    if (error) fail(error);
    return { ...data, jam_mulai: hhmm(data.jam_mulai), jam_selesai: hhmm(data.jam_selesai) };
  }

  // ---------- Petugas TU ----------
  async function session() { need(); const { data } = await sb.auth.getSession(); return data.session; }
  async function signIn(email, password) {
    need();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Email atau password salah.' : error.message);
    return data.session;
  }
  async function signOut() { need(); await sb.auth.signOut(); }
  async function isTu() { need(); const { data, error } = await sb.rpc('is_tu'); if (error) fail(error); return data === true; }
  async function listRequests() {
    need();
    const { data, error } = await sb.from('pengajuan')
      .select('id, kode, ruang_id, tanggal, jam_mulai, jam_selesai, peserta, nama_kegiatan, organisasi, penanggung_jawab, kontak, status, catatan_tu, dibuat_pada, diputuskan_pada')
      .order('dibuat_pada', { ascending: false });
    if (error) fail(error);
    return data.map(x => ({ ...x, jam_mulai: hhmm(x.jam_mulai), jam_selesai: hhmm(x.jam_selesai) }));
  }
  async function decide(id, status, note) {
    need();
    const { data, error } = await sb.rpc('putuskan_pengajuan', { p_id: id, p_status: status, p_catatan: note || null });
    if (error) fail(error);
    return data;
  }

  window.RuangKitaAPI = { configured, DAYS, today, loadMaster, loadBookings, submitRequest, checkRequest, session, signIn, signOut, isTu, listRequests, decide };
})();
