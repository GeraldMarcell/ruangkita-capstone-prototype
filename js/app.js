(() => {
  const api = window.RuangKitaAPI;
  const app = document.querySelector('#app');
  const OPEN = '07.00';
  const CLOSE = '18.30';
  const DAYS = api.DAYS;
  let rooms = [];
  let schedule = {};
  let bookings = [];

  // ---------- Helpers ----------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toMin = t => { const [h, m] = t.split('.').map(Number); return h * 60 + m; };
  const toTime = m => `${String(Math.floor(m / 60)).padStart(2, '0')}.${String(m % 60).padStart(2, '0')}`;
  const overlaps = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;
  const timeOptions = (() => { const out = []; for (let m = toMin(OPEN); m <= toMin(CLOSE); m += 15) out.push(toTime(m)); return out; })();

  const parseDate = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
  const isoDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dayName = s => ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][parseDate(s).getDay()];
  const fmtDate = s => parseDate(s).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  const fmtDateTime = s => new Date(s).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !isNaN(parseDate(s)) && s >= api.today() && DAYS.includes(dayName(s));
  const nextWeekdays = (from, n) => { const out = []; const d = parseDate(from); while (out.length < n) { d.setDate(d.getDate() + 1); if (DAYS.includes(dayName(isoDate(d)))) out.push(isoDate(d)); } return out; };

  // Kode pengajuan disimpan juga di perangkat ini supaya tidak hilang (Q3.05).
  const MY_KEY = 'rk-pengajuan-saya';
  const myRequests = () => { try { return JSON.parse(localStorage.getItem(MY_KEY) || '[]'); } catch { return []; } };
  const rememberRequest = r => {
    try {
      const list = myRequests().filter(x => x.kode !== r.kode);
      list.unshift(r);
      localStorage.setItem(MY_KEY, JSON.stringify(list.slice(0, 10)));
    } catch { /* penyimpanan browser tidak tersedia: abaikan */ }
  };
  const shareText = d => `Pengajuan ruangan RuangKita\nKode: ${d.kode}\nRuangan: ${d.ruang_nama}\nWaktu: ${fmtDate(d.tanggal)}, ${d.jam_mulai}–${d.jam_selesai}\nKegiatan: ${d.nama_kegiatan}\nCek status: ${new URL(`status.html?kode=${encodeURIComponent(d.kode)}`, location.href).href}`;
  const keepCodeBox = d => `<div class="keep-code">
      <p><strong>Simpan kode ini.</strong> Kode juga tersimpan di perangkat ini dan bisa dilihat lagi di menu Cek status.</p>
      <div class="actions"><button type="button" class="button-secondary" data-copy-text="${esc(d.kode)}">Salin kode</button>
      <a class="button-secondary" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(shareText(d))}">Kirim ke WhatsApp</a></div>
    </div>`;

  const parseHash = () => {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query = ''] = raw.split('?');
    const p = new URLSearchParams(query);
    return { path: decodeURIComponent(path), q: { tanggal: p.get('tanggal') || '', mulai: p.get('mulai') || '', selesai: p.get('selesai') || '', peserta: p.get('peserta') || '', kecuali: p.get('kecuali') || '' } };
  };
  const qs = (q, extra = {}) => {
    const p = new URLSearchParams();
    Object.entries({ tanggal: q.tanggal, mulai: q.mulai, selesai: q.selesai, peserta: q.peserta, ...extra }).forEach(([k, v]) => { if (v) p.set(k, v); });
    return p.toString();
  };
  const validQuery = q => validDate(q.tanggal) && timeOptions.includes(q.mulai) && timeOptions.includes(q.selesai) && toMin(q.mulai) < toMin(q.selesai) && Number(q.peserta) > 0;
  const whenText = q => `${fmtDate(q.tanggal)}, ${q.mulai}–${q.selesai} · ${q.peserta} orang`;

  // ---------- Status logic ----------
  // Jadwal kuliah: dari tabel jadwal_kuliah (per hari). Persetujuan TU: dari pengajuan nyata (per tanggal).
  function evaluate(room, q) {
    const a = toMin(q.mulai), b = toMin(q.selesai), day = dayName(q.tanggal);
    const classes = (schedule[room.id] || []).filter(c => c.day === day && overlaps(a, b, toMin(c.start), toMin(c.end)));
    const related = bookings.filter(x => x.room === room.id && x.date === q.tanggal && overlaps(a, b, toMin(x.start), toMin(x.end)));
    const approved = related.find(x => x.status === 'approved');
    const pending = related.find(x => x.status === 'pending');
    let state = 'open';
    if (classes.length) state = 'class';
    else if (approved) state = 'booked';
    else if (pending) state = 'pending';
    return { room, classes, booking: approved || pending || null, pendingCount: related.filter(x => x.status === 'pending').length, state, fits: room.capacity >= Number(q.peserta) };
  }

  const CONDITION = { free: { label: 'Tidak ada kuliah', cls: 'neutral' }, class: { label: 'Ada kuliah', cls: 'blue' } };
  const APPROVAL = {
    open: { label: 'Belum ada yang mengajukan', cls: 'green', note: 'Belum boleh dipakai sebelum disetujui TU.' },
    pending: { label: 'Menunggu keputusan TU', cls: 'amber', note: 'Sudah ada pengajuan kegiatan lain yang sedang menunggu keputusan TU.' },
    booked: { label: 'Sudah diizinkan untuk kegiatan lain', cls: 'rose', note: 'TU sudah menyetujui kegiatan lain pada waktu ini.' },
    class: { label: 'Tidak bisa diajukan', cls: 'rose', note: 'Ruangan dipakai perkuliahan pada waktu ini.' }
  };
  const REQ_STATUS = {
    menunggu: { label: 'Menunggu keputusan TU', cls: 'amber' },
    disetujui: { label: 'Disetujui TU', cls: 'green' },
    ditolak: { label: 'Ditolak TU', cls: 'rose' }
  };
  const pill = (text, cls) => `<span class="pill ${cls}">${esc(text)}</span>`;
  const conditionPill = r => r.state === 'class' ? pill(CONDITION.class.label, CONDITION.class.cls) : pill(CONDITION.free.label, CONDITION.free.cls);
  const approvalPill = r => pill(APPROVAL[r.state].label, APPROVAL[r.state].cls);

  const LABEL = {
    cond: 'Jadwal kuliah', condHelp: 'Apakah ruangan dipakai kuliah pada jam yang kamu cari.',
    appr: 'Persetujuan TU', apprHelp: 'Apakah kamu sudah boleh memakai ruangan. Ruangan baru boleh dipakai setelah TU menyetujui pengajuanmu.'
  };

  const STEPS = ['Isi kebutuhan', 'Pilih ruangan', 'Periksa status', 'Ajukan ke TU'];
  const stepper = current => `<ol class="stepper" aria-label="Tahapan">${STEPS.map((t, i) => {
    const n = i + 1; const st = n < current ? 'done' : n === current ? 'now' : 'todo';
    return `<li class="step-${st}" ${st === 'now' ? 'aria-current="step"' : ''}><span>${st === 'done' ? '✓' : n}</span>${t}</li>`;
  }).join('')}</ol>`;

  const legend = () => `<section class="legend" aria-label="Cara membaca status">
    <div><strong>${LABEL.cond}</strong><p>${LABEL.condHelp}</p></div>
    <div class="legend-appr"><strong>${LABEL.appr}</strong><p>${LABEL.apprHelp}</p></div>
  </section>`;

  const setPage = (title, html) => {
    document.title = `${title} — RuangKita`;
    app.innerHTML = html;
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  };
  const loading = (text = 'Memuat data…') => { app.innerHTML = `<p class="loading" role="status">${text}</p>`; };
  const errorPage = err => setPage('Terjadi kendala', `<section class="empty-box">
      <strong>Data belum bisa dimuat.</strong>
      <p>${esc(err.message)}</p>
      <div class="actions"><button class="button-primary" type="button" onclick="location.reload()">Coba lagi</button></div>
    </section>`);

  const explainer = () => `<details class="explainer">
    <summary>Kosong belum tentu boleh dipakai. Apa bedanya?</summary>
    <div class="explainer-grid">
      <div><strong>${LABEL.cond}</strong><p>${LABEL.condHelp} Datanya dari jadwal kuliah DSI.</p></div>
      <div><strong>${LABEL.appr}</strong><p>Apakah TU sudah mengizinkan kegiatan lain, ada pengajuan yang menunggu, atau ruangan masih bisa kamu ajukan.</p></div>
    </div>
    <p class="explainer-foot">Ruangan baru boleh dipakai setelah pengajuanmu disetujui TU.</p>
  </details>`;

  // ---------- 1. Beranda + pencarian ----------
  function home(q) {
    const sel = (id, label, opts, value, ph) => `<label class="field"><span>${label}</span><select id="${id}" name="${id}" required><option value="">${ph}</option>${opts.map(o => `<option ${o === value ? 'selected' : ''}>${o}</option>`).join('')}</select></label>`;
    setPage('Cari ruangan', `${stepper(1)}<section class="hero">
        <span class="eyebrow">RuangKita · Mahasiswa DSI ITS</span>
        <h1>Cari ruangan untuk kegiatanmu, lalu <em>ajukan ke TU.</em></h1>
        <p class="hero-copy">Masukkan tanggal, jam, dan jumlah peserta. RuangKita menampilkan jadwal kuliah dan status persetujuan TU setiap ruangan.</p>
      </section>
      <form class="search-card" id="search-form" novalidate>
        <h2>Kapan dan untuk berapa orang?</h2>
        <div class="form-grid">
          <label class="field"><span>Tanggal</span><input id="tanggal" name="tanggal" type="date" min="${api.today()}" value="${esc(q.tanggal)}" required></label>
          ${sel('mulai', 'Jam mulai', timeOptions.slice(0, -1), q.mulai, 'Pilih jam')}
          ${sel('selesai', 'Jam selesai', timeOptions.slice(1), q.selesai, 'Pilih jam')}
          <label class="field"><span>Jumlah peserta</span><input id="peserta" name="peserta" type="number" min="1" max="500" inputmode="numeric" placeholder="Contoh: 15" value="${esc(q.peserta)}" required></label>
        </div>
        <p class="form-error" id="form-error" role="alert"></p>
        <button class="button-primary button-wide" type="submit">Cari ruangan</button>
        <p class="form-hint">Layanan Senin–Jumat, pukul ${OPEN}–${CLOSE}.</p>
      </form>
      ${explainer()}`);
    document.querySelector('#search-form').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target;
      const next = { tanggal: f.tanggal.value, mulai: f.mulai.value, selesai: f.selesai.value, peserta: String(parseInt(f.peserta.value, 10) || '') };
      const err = document.querySelector('#form-error');
      if (!next.tanggal || !next.mulai || !next.selesai || !next.peserta) { err.textContent = 'Lengkapi tanggal, jam mulai, jam selesai, dan jumlah peserta.'; return; }
      if (next.tanggal < api.today()) { err.textContent = 'Tanggal sudah lewat. Pilih hari ini atau setelahnya.'; return; }
      if (!DAYS.includes(dayName(next.tanggal))) { err.textContent = 'RuangKita hanya melayani hari Senin–Jumat.'; return; }
      if (toMin(next.mulai) >= toMin(next.selesai)) { err.textContent = 'Jam selesai harus setelah jam mulai.'; return; }
      if (Number(next.peserta) < 1) { err.textContent = 'Jumlah peserta minimal 1 orang.'; return; }
      location.hash = `/hasil?${qs(next)}`;
    });
  }

  // ---------- 2. Hasil pencarian ----------
  function suggestions(q) {
    const dur = toMin(q.selesai) - toMin(q.mulai);
    const want = toMin(q.mulai);
    const cands = [];
    for (let s = toMin(OPEN); s + dur <= toMin(CLOSE); s += 15) {
      if (s === want) continue;
      const alt = { ...q, mulai: toTime(s), selesai: toTime(s + dur) };
      const n = rooms.map(r => evaluate(r, alt)).filter(r => r.fits && r.state === 'open').length;
      if (n) cands.push({ q: alt, n, s });
    }
    cands.sort((x, y) => Math.abs(x.s - want) - Math.abs(y.s - want));
    const out = [];
    for (const c of cands) { if (out.length < 4 && !out.some(o => Math.abs(o.s - c.s) < dur)) out.push(c); }
    return out.sort((x, y) => x.s - y.s);
  }

  function resultCard(r, q) {
    const cls = r.classes[0];
    const extra = r.state === 'class' ? `${cls.course} · ${cls.start}–${cls.end}` : r.booking ? `${r.booking.activity} · ${r.booking.start}–${r.booking.end}` : APPROVAL.open.note;
    return `<a class="room-card state-${r.state}" href="#/ruang/${encodeURIComponent(r.room.id)}?${qs(q)}">
      <div class="room-card-head"><h3>${esc(r.room.name)}</h3><span class="capacity">Kapasitas ${r.room.capacity}</span></div>
      <dl class="status-pair">
        <div><dt>${LABEL.cond}</dt><dd>${conditionPill(r)}</dd></div>
        <div class="approval-col"><dt>${LABEL.appr}</dt><dd>${approvalPill(r)}</dd></div>
      </dl>
      <p class="room-card-note">${esc(extra)}</p>
      <span class="card-cta">Lihat detail <span aria-hidden="true">→</span></span>
    </a>`;
  }

  function results(q) {
    if (!validQuery(q)) { home(q); return; }
    const all = rooms.map(r => evaluate(r, q)).filter(r => r.fits && r.room.id !== q.kecuali);
    const groups = [
      { key: 'open', title: 'Bisa diajukan ke TU', desc: 'Tidak ada kuliah dan belum ada yang mengajukan. Tetap perlu persetujuan TU sebelum dipakai.', items: all.filter(r => r.state === 'open') },
      { key: 'pending', title: 'Perlu kepastian dari TU', desc: 'Tidak ada kuliah, tetapi sudah ada pengajuan lain yang menunggu keputusan TU.', items: all.filter(r => r.state === 'pending') },
      { key: 'blocked', title: 'Tidak bisa dipakai pada waktu ini', desc: 'Ada kuliah, atau TU sudah mengizinkan kegiatan lain.', items: all.filter(r => r.state === 'class' || r.state === 'booked') }
    ];
    const tooSmall = rooms.filter(r => r.capacity < Number(q.peserta)).length;
    const excluded = q.kecuali ? rooms.find(r => r.id === q.kecuali) : null;
    const sugg = groups[0].items.length ? [] : suggestions(q);
    const otherDays = groups[0].items.length ? [] : nextWeekdays(q.tanggal, 5).map(d => ({ q: { ...q, tanggal: d }, n: rooms.map(r => evaluate(r, { ...q, tanggal: d })).filter(r => r.fits && r.state === 'open').length })).filter(x => x.n);

    setPage('Hasil pencarian', `${stepper(2)}<a class="back-link" href="#/?${qs(q)}">← Ubah pencarian</a>
      <section class="page-head">
        <span class="eyebrow">Hasil pencarian</span>
        <h1>${groups[0].items.length ? `${groups[0].items.length} ruangan bisa diajukan` : 'Belum ada ruangan yang bisa diajukan'}</h1>
        <p class="query-chip">${whenText(q)} <a href="#/?${qs(q)}">Ubah</a></p>
        ${excluded ? `<p class="info-banner">Menampilkan alternatif selain <strong>${esc(excluded.name)}</strong>.</p>` : ''}
        ${tooSmall ? `<p class="muted-note">${tooSmall} ruangan disembunyikan karena kapasitasnya kurang dari ${esc(q.peserta)} orang.</p>` : ''}
      </section>
      ${legend()}
      ${!groups[0].items.length ? `<section class="empty-box">
        <strong>Tidak ada ruangan yang bisa diajukan pada waktu ini.</strong>
        <p>Coba jam lain di tanggal yang sama, atau tanggal lain di jam yang sama.</p>
        ${sugg.length ? `<p class="sugg-label">Jam lain, ${fmtDate(q.tanggal)}:</p><div class="sugg-row">${sugg.map(s => `<a class="sugg" href="#/hasil?${qs(s.q)}">${s.q.mulai}–${s.q.selesai}<small>${s.n} ruangan</small></a>`).join('')}</div>` : ''}
        ${otherDays.length ? `<p class="sugg-label">Tanggal lain, ${q.mulai}–${q.selesai}:</p><div class="sugg-row">${otherDays.map(s => `<a class="sugg" href="#/hasil?${qs(s.q)}">${fmtDate(s.q.tanggal)}<small>${s.n} ruangan</small></a>`).join('')}</div>` : ''}
        <a class="button-secondary" href="#/?${qs(q)}">Ubah kriteria pencarian</a>
      </section>` : ''}
      ${groups.filter(g => g.items.length).map(g => `<section class="group group-${g.key}">
        <div class="group-head"><h2>${g.title} <span class="count">${g.items.length}</span></h2><p>${g.desc}</p></div>
        <div class="room-grid">${g.items.map(r => resultCard(r, q)).join('')}</div>
      </section>`).join('')}`);
  }

  // ---------- 3. Detail ruangan ----------
  function detail(id, q) {
    const room = rooms.find(r => r.id === id);
    if (!room || !validQuery(q)) { home(q); return; }
    const r = evaluate(room, q);
    const a = toMin(q.mulai), b = toMin(q.selesai), day = dayName(q.tanggal);
    const items = [
      ...(schedule[room.id] || []).filter(c => c.day === day).map(c => ({ start: c.start, end: c.end, title: c.course, sub: `Perkuliahan · ${c.info}${c.note ? ` · ${c.note}` : ''}`, kind: 'class' })),
      ...bookings.filter(x => x.room === room.id && x.date === q.tanggal).map(x => ({ start: x.start, end: x.end, title: x.activity, sub: x.status === 'approved' ? 'Disetujui TU' : 'Menunggu keputusan TU', kind: x.status }))
    ].sort((x, y) => toMin(x.start) - toMin(y.start));
    const hit = it => overlaps(a, b, toMin(it.start), toMin(it.end));
    const ap = APPROVAL[r.state];
    setPage(room.name, `${stepper(3)}<a class="back-link" href="#/hasil?${qs(q)}">← Kembali ke hasil pencarian</a>
      <section class="page-head">
        <span class="eyebrow">Detail ruangan</span>
        <h1>${esc(room.name)}</h1>
        <p class="query-chip">${whenText(q)}</p>
      </section>
      <div class="detail-grid">
        <section class="panel">
          <h2>Kapasitas</h2>
          <p class="big-line">${room.capacity} orang <span class="ok">✓ cukup untuk ${esc(q.peserta)} orang</span></p>
          <p class="muted-note">Departemen Sistem Informasi ITS</p>
          <h2 class="mt">Jadwal ${fmtDate(q.tanggal)}</h2>
          <ul class="timeline">
            ${items.length ? items.map(it => `<li class="tl-${it.kind} ${hit(it) ? 'tl-hit' : ''}"><span class="tl-time">${it.start}–${it.end}</span><span><strong>${esc(it.title)}</strong><small>${esc(it.sub)}</small></span></li>`).join('') : '<li class="tl-empty">Tidak ada perkuliahan atau pengajuan pada hari ini.</li>'}
          </ul>
          ${items.some(hit) ? `<p class="muted-note">Baris berbingkai hijau tua bentrok dengan waktu yang kamu cari (${q.mulai}–${q.selesai}).</p>` : ''}
        </section>
        <section class="status-col">
          <article class="status-box">
            <span class="status-num">1</span>
            <div><h2>${LABEL.cond}</h2><p class="help">${LABEL.condHelp}</p>${conditionPill(r)}
            <p>${r.state === 'class' ? `${esc(r.classes.map(c => `${c.course} (${c.start}–${c.end})`).join(', '))}.` : `Tidak ada perkuliahan pada ${q.mulai}–${q.selesai}.`}</p>
            <p class="muted-note">Jadwal kuliah Gasal 2026/2027. Kondisi di lapangan bisa berbeda.</p></div>
          </article>
          <article class="status-box approval-box approval-${ap.cls}">
            <span class="status-num">2</span>
            <div><h2>${LABEL.appr}</h2><p class="help">${LABEL.apprHelp}</p><p class="approval-label">${ap.label}</p>
            <p>${ap.note}${r.booking ? ` (${esc(r.booking.activity)}, ${r.booking.start}–${r.booking.end})` : ''}</p></div>
          </article>
          ${r.state === 'open' ? '<p class="warn-line"><strong>Ingat:</strong> tidak ada kuliah belum berarti boleh langsung dipakai. Kamu tetap perlu persetujuan TU.</p>' : ''}
          <a class="button-primary button-wide" href="#/ruang/${encodeURIComponent(room.id)}/ajukan?${qs(q)}">${r.state === 'open' || r.state === 'pending' ? 'Ajukan ruangan ini' : 'Lihat langkah selanjutnya'}</a>
          <a class="button-secondary button-wide" href="#/hasil?${qs(q)}">Bandingkan dengan ruangan lain</a>
        </section>
      </div>`);
  }

  // ---------- 4. Ajukan / langkah selanjutnya ----------
  function nextStep(id, q) {
    const room = rooms.find(r => r.id === id);
    if (!room || !validQuery(q)) { home(q); return; }
    const r = evaluate(room, q);
    const alt = `#/hasil?${qs(q, { kecuali: room.id })}`;
    const back = `<a class="back-link" href="#/ruang/${encodeURIComponent(room.id)}?${qs(q)}">← Kembali ke detail ruangan</a>`;
    const head = `<section class="page-head"><span class="eyebrow">Ajukan ke TU</span><h1>${esc(room.name)}</h1><p class="query-chip">${whenText(q)}</p></section>`;

    if (r.state === 'class' || r.state === 'booked') {
      const lead = r.state === 'class'
        ? `Ruangan dipakai perkuliahan: ${esc(r.classes.map(c => `${c.course} (${c.start}–${c.end})`).join(', '))}.`
        : `TU sudah menyetujui kegiatan lain (${esc(r.booking.activity)}, ${r.booking.start}–${r.booking.end}).`;
      setPage('Langkah selanjutnya', `${stepper(4)}${back}${head}
        <section class="verdict verdict-rose">
          <h2>Ruangan ini tidak bisa dipakai pada waktu ini</h2><p>${lead}</p>
          <ol class="steps"><li>Cari ruangan lain pada waktu yang sama, atau</li><li>ubah waktu kegiatanmu.</li></ol>
          <div class="actions"><a class="button-primary" href="${alt}">Cari alternatif</a><a class="button-secondary" href="#/?${qs(q)}">Ubah waktu</a></div>
        </section>`);
      return;
    }

    const pendingNote = r.state === 'pending'
      ? `<p class="warn-line">Sudah ada ${r.pendingCount} pengajuan lain pada waktu ini (${esc(r.booking.activity)}). Pengajuanmu tetap bisa dikirim, lalu TU yang memutuskan. Jika salah satu pengajuan disetujui, pengajuan lain pada waktu yang sama otomatis ditolak.</p>` : '';
    setPage('Ajukan ruangan', `${stepper(4)}${back}${head}
      <section class="verdict verdict-${r.state === 'open' ? 'green' : 'amber'}">
        <h2>${r.state === 'open' ? 'Ruangan ini bisa kamu ajukan ke TU' : 'Ruangan ini perlu kepastian dari TU'}</h2>
        <p>Isi data kegiatan di bawah. Pengajuanmu akan tersimpan dan langsung terlihat oleh TU. Ruangan baru boleh dipakai setelah TU menyetujui.</p>
        ${pendingNote}
        <form id="request-form" class="request-form" novalidate>
          <div class="form-grid two">
            <label class="field"><span>Nama kegiatan</span><input name="activity" maxlength="120" placeholder="Contoh: Rapat koordinasi divisi" required></label>
            <label class="field"><span>Organisasi</span><input name="organization" maxlength="120" placeholder="Contoh: HMSI ITS" required></label>
            <label class="field"><span>Penanggung jawab</span><input name="pic" maxlength="80" placeholder="Nama lengkap" required></label>
            <label class="field"><span>Kontak (WA / email)</span><input name="contact" maxlength="80" placeholder="Contoh: 0812xxxxxxx" required></label>
          </div>
          <p class="muted-note">Kontak hanya terlihat oleh petugas TU.</p>
          <p class="form-error" id="request-error" role="alert"></p>
          <div class="actions"><button class="button-primary" type="submit" id="request-submit">Kirim pengajuan ke TU</button><a class="button-secondary" href="${alt}">Cari alternatif</a></div>
        </form>
      </section>`);

    document.querySelector('#request-form').addEventListener('input', () => { document.querySelector('#request-error').textContent = ''; });
    document.querySelector('#request-form').addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.target;
      const err = document.querySelector('#request-error');
      const btn = document.querySelector('#request-submit');
      const v = { activity: f.activity.value.trim(), organization: f.organization.value.trim(), pic: f.pic.value.trim(), contact: f.contact.value.trim() };
      if (v.activity.length < 3) { err.textContent = 'Nama kegiatan minimal 3 karakter.'; return; }
      if (v.organization.length < 2) { err.textContent = 'Nama organisasi wajib diisi.'; return; }
      if (v.pic.length < 3) { err.textContent = 'Nama penanggung jawab wajib diisi.'; return; }
      if (v.contact.length < 5) { err.textContent = 'Kontak penanggung jawab wajib diisi.'; return; }
      err.textContent = '';
      btn.disabled = true; btn.textContent = 'Mengirim…';
      try {
        const res = await api.submitRequest({ roomId: room.id, date: q.tanggal, start: q.mulai, end: q.selesai, participants: q.peserta, ...v });
        rememberRequest({ kode: res.kode, ruang: room.name, tanggal: q.tanggal, mulai: q.mulai, selesai: q.selesai });
        location.href = `selesai.html?kode=${encodeURIComponent(res.kode)}`;
      } catch (ex) {
        err.textContent = ex.message;
        btn.disabled = false; btn.textContent = 'Kirim pengajuan ke TU';
      }
    });
  }

  // ---------- Kartu status pengajuan (dipakai di Selesai & Cek status) ----------
  const requestCard = d => {
    const st = REQ_STATUS[d.status] || REQ_STATUS.menunggu;
    const next = d.status === 'disetujui' ? 'Ruangan boleh dipakai sesuai waktu yang disetujui.'
      : d.status === 'ditolak' ? 'Pengajuan tidak disetujui. Cari ruangan atau waktu lain.'
      : 'Tunggu keputusan TU. Cek status secara berkala dengan kode pengajuanmu. Ruangan belum boleh dipakai.';
    return `<dl class="summary">
        <div><dt>Kode pengajuan</dt><dd><strong class="code">${esc(d.kode)}</strong></dd></div>
        <div><dt>Status</dt><dd>${pill(st.label, st.cls)}</dd></div>
        <div><dt>Ruangan</dt><dd>${esc(d.ruang_nama)}</dd></div>
        <div><dt>Waktu</dt><dd>${fmtDate(d.tanggal)}, ${d.jam_mulai}–${d.jam_selesai}</dd></div>
        <div><dt>Kegiatan</dt><dd>${esc(d.nama_kegiatan)} · ${esc(d.organisasi)}</dd></div>
        <div><dt>Peserta</dt><dd>${d.peserta} orang</dd></div>
        <div><dt>Diajukan</dt><dd>${fmtDateTime(d.dibuat_pada)}</dd></div>
        ${d.diputuskan_pada ? `<div><dt>Diputuskan</dt><dd>${fmtDateTime(d.diputuskan_pada)}</dd></div>` : ''}
        ${d.catatan_tu ? `<div><dt>Catatan TU</dt><dd>${esc(d.catatan_tu)}</dd></div>` : ''}
      </dl>
      <p class="warn-line">${next}</p>`;
  };

  // ---------- 5. Selesai (selesai.html?kode=...) ----------
  async function finished() {
    const code = new URLSearchParams(location.search).get('kode') || '';
    if (!code) { setPage('Selesai', '<section class="done"><h1>Belum ada pengajuan</h1><div class="actions center"><a class="button-primary" href="./">Cari ruangan</a></div></section>'); return; }
    loading('Memuat pengajuan…');
    try {
      const d = await api.checkRequest(code);
      rememberRequest({ kode: d.kode, ruang: d.ruang_nama, tanggal: d.tanggal, mulai: d.jam_mulai, selesai: d.jam_selesai });
      setPage('Pengajuan terkirim', `${stepper(5)}<section class="done">
        <span class="done-icon" aria-hidden="true">✓</span>
        <span class="eyebrow">Pengajuan terkirim</span>
        <h1>Pengajuanmu sudah tersimpan</h1>
        <p class="done-lead">Gunakan kode di bawah untuk mengecek keputusan TU.</p>
        ${requestCard(d)}
        ${keepCodeBox(d)}
        <div class="actions center"><a class="button-secondary" href="status.html?kode=${encodeURIComponent(d.kode)}">Cek status pengajuan</a><a class="button-primary" href="./">Cari ruangan lain</a></div>
      </section>`);
    } catch (ex) { errorPage(ex); }
  }

  // ---------- Cek status (status.html) ----------
  function statusPage() {
    const initial = new URLSearchParams(location.search).get('kode') || '';
    setPage('Cek status pengajuan', `<section class="page-head"><span class="eyebrow">Cek status</span><h1>Status pengajuan ruangan</h1>
        <p class="hero-copy">Masukkan kode pengajuan yang kamu dapat setelah mengirim pengajuan.</p></section>
      <form class="search-card" id="status-form" novalidate>
        <div class="inline-form"><label class="field"><span>Kode pengajuan</span><input name="kode" placeholder="Contoh: RK-1A2B3C" value="${esc(initial)}" autocomplete="off" required></label>
        <button class="button-primary" type="submit">Cek status</button></div>
        <p class="form-error" id="status-error" role="alert"></p>
      </form>
      ${myRequests().length ? `<section class="my-requests"><h2>Pengajuan dari perangkat ini</h2>
        <ul>${myRequests().map(x => `<li><a href="?kode=${encodeURIComponent(x.kode)}" data-kode="${esc(x.kode)}"><strong class="code">${esc(x.kode)}</strong><span>${esc(x.ruang)} · ${fmtDate(x.tanggal)}, ${esc(x.mulai)}–${esc(x.selesai)}</span></a></li>`).join('')}</ul></section>` : ''}
      <section id="status-result" class="status-result"></section>`);
    const form = document.querySelector('#status-form');
    document.querySelectorAll('.my-requests [data-kode]').forEach(a => { a.onclick = e => { e.preventDefault(); form.kode.value = a.dataset.kode; run(); }; });
    const run = async () => {
      const code = form.kode.value.trim();
      const err = document.querySelector('#status-error');
      const out = document.querySelector('#status-result');
      if (!code) { err.textContent = 'Masukkan kode pengajuan.'; return; }
      err.textContent = ''; out.innerHTML = '<p class="loading">Mencari pengajuan…</p>';
      history.replaceState(null, '', `?kode=${encodeURIComponent(code)}`);
      try { const d = await api.checkRequest(code); out.innerHTML = `<div class="panel">${requestCard(d)}${keepCodeBox(d)}</div>`; }
      catch (ex) { out.innerHTML = ''; err.textContent = ex.message; }
    };
    form.addEventListener('submit', e => { e.preventDefault(); run(); });
    if (initial) run();
  }

  // ---------- Panel TU (tu.html) ----------
  async function tuPage(filter = 'menunggu', flash = '') {
    loading();
    let s;
    try { s = await api.session(); } catch (ex) { errorPage(ex); return; }
    if (!s) {
      setPage('Masuk petugas TU', `<section class="page-head"><span class="eyebrow">Panel TU</span><h1>Masuk sebagai petugas TU</h1>
          <p class="hero-copy">Halaman ini hanya untuk petugas TU Departemen Sistem Informasi.</p></section>
        <form class="search-card narrow" id="login-form" novalidate>
          <label class="field"><span>Email</span><input name="email" type="email" autocomplete="username" required></label>
          <label class="field"><span>Password</span><input name="password" type="password" autocomplete="current-password" required></label>
          <p class="form-error" id="login-error" role="alert"></p>
          <button class="button-primary button-wide" type="submit" id="login-btn">Masuk</button>
        </form>`);
      document.querySelector('#login-form').addEventListener('submit', async e => {
        e.preventDefault();
        const f = e.target; const err = document.querySelector('#login-error'); const btn = document.querySelector('#login-btn');
        if (!f.email.value || !f.password.value) { err.textContent = 'Isi email dan password.'; return; }
        btn.disabled = true; btn.textContent = 'Memeriksa…';
        try { await api.signIn(f.email.value.trim(), f.password.value); tuPage(); }
        catch (ex) { err.textContent = ex.message; btn.disabled = false; btn.textContent = 'Masuk'; }
      });
      return;
    }

    let list = [], tu = false;
    try { [tu, list] = await Promise.all([api.isTu(), api.listRequests()]); } catch (ex) { errorPage(ex); return; }
    const roomName = id => rooms.find(r => r.id === id)?.name || id;
    const counts = { menunggu: list.filter(x => x.status === 'menunggu').length, semua: list.length };
    const shown = filter === 'semua' ? list : list.filter(x => x.status === 'menunggu');
    const conflicts = x => list.filter(y => y.id !== x.id && y.ruang_id === x.ruang_id && y.tanggal === x.tanggal && y.status !== 'ditolak' && overlaps(toMin(x.jam_mulai), toMin(x.jam_selesai), toMin(y.jam_mulai), toMin(y.jam_selesai)));
    const card = x => {
      const st = REQ_STATUS[x.status];
      const c = conflicts(x);
      return `<article class="tu-card" data-id="${esc(x.id)}">
        <div class="tu-card-head"><strong class="code">${esc(x.kode)}</strong>${pill(st.label, st.cls)}</div>
        <h3>${esc(x.nama_kegiatan)} <small>· ${esc(x.organisasi)}</small></h3>
        <p class="tu-meta">${esc(roomName(x.ruang_id))} · ${fmtDate(x.tanggal)}, ${x.jam_mulai}–${x.jam_selesai} · ${x.peserta} orang</p>
        <p class="tu-meta">PJ: ${esc(x.penanggung_jawab)} · ${esc(x.kontak)} · diajukan ${fmtDateTime(x.dibuat_pada)}</p>
        ${c.length ? `<p class="warn-line">Bentrok dengan ${c.map(y => `${esc(y.kode)} (${REQ_STATUS[y.status].label.toLowerCase()})`).join(', ')}.${x.status === 'menunggu' ? ' Jika pengajuan ini disetujui, pengajuan lain yang masih menunggu akan otomatis ditolak.' : ''}</p>` : ''}
        ${x.catatan_tu ? `<p class="tu-meta">Catatan TU: ${esc(x.catatan_tu)}</p>` : ''}
        ${x.status === 'menunggu' ? `<div class="tu-actions">
          <input class="tu-note" placeholder="Catatan untuk mahasiswa (opsional)" maxlength="200">
          <button class="button-primary" data-decide="disetujui">Setujui</button>
          <button class="button-secondary danger" data-decide="ditolak">Tolak</button>
        </div><p class="form-error tu-error" role="alert"></p>` : ''}
      </article>`;
    };
    setPage('Panel TU', `<section class="page-head tu-head"><div><span class="eyebrow">Panel TU</span><h1>Pengajuan ruangan</h1>
        <p class="muted-note">Masuk sebagai ${esc(s.user?.email)}</p></div>
        <button class="button-secondary" id="logout">Keluar</button></section>
      ${tu ? '' : '<p class="warn-line">Akun ini belum terdaftar sebagai petugas TU, jadi data pengajuan tidak bisa dilihat atau diputuskan.</p>'}
      ${flash ? `<p class="info-banner" role="status">${esc(flash)}</p>` : ''}
      <div class="tabs"><button class="tab ${filter === 'menunggu' ? 'on' : ''}" data-filter="menunggu">Menunggu (${counts.menunggu})</button><button class="tab ${filter === 'semua' ? 'on' : ''}" data-filter="semua">Semua (${counts.semua})</button><button class="tab" id="refresh">↻ Muat ulang</button></div>
      <section class="tu-list">${shown.length ? shown.map(card).join('') : '<p class="empty-box">Belum ada pengajuan di sini.</p>'}</section>`);
    document.querySelector('#logout').onclick = async () => { await api.signOut(); tuPage(); };
    document.querySelector('#refresh').onclick = () => tuPage(filter);
    document.querySelectorAll('[data-filter]').forEach(b => { b.onclick = () => tuPage(b.dataset.filter); });
    document.querySelectorAll('[data-decide]').forEach(b => {
      b.onclick = async () => {
        const art = b.closest('.tu-card');
        const err = art.querySelector('.tu-error');
        art.querySelectorAll('button').forEach(x => { x.disabled = true; });
        try {
          const res = await api.decide(art.dataset.id, b.dataset.decide, art.querySelector('.tu-note').value);
          const auto = res.ditolak_otomatis || [];
          tuPage(filter, `Pengajuan ${res.kode} ${res.status === 'disetujui' ? 'disetujui' : 'ditolak'}.${auto.length ? ` ${auto.length} pengajuan lain yang bentrok (${auto.join(', ')}) otomatis ditolak.` : ''}`);
        } catch (ex) { err.textContent = ex.message; art.querySelectorAll('button').forEach(x => { x.disabled = false; }); }
      };
    });
  }

  // Tombol salin kode
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-copy-text]');
    if (!b) return;
    const text = b.dataset.copyText;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch { /* abaikan */ }
      t.remove();
    }
    const old = b.textContent; b.textContent = 'Tersalin ✓'; setTimeout(() => { b.textContent = old; }, 1800);
  });

  // ---------- Router ----------
  async function route() {
    const { path, q } = parseHash();
    let m;
    if (!path) return home(q);
    loading();
    try { bookings = await api.loadBookings(); } catch (ex) { errorPage(ex); return; }
    if (path === 'hasil') return results(q);
    if ((m = path.match(/^ruang\/([^/]+)\/ajukan$/))) return nextStep(m[1], q);
    if ((m = path.match(/^ruang\/([^/]+)$/))) return detail(m[1], q);
    location.hash = '/';
  }

  async function boot() {
    const page = document.body.dataset.page || 'app';
    loading();
    if (page === 'selesai') return finished();
    if (page === 'status') return statusPage();
    try { ({ rooms, schedule } = await api.loadMaster()); } catch (ex) { errorPage(ex); return; }
    if (page === 'tu') return tuPage();
    window.addEventListener('hashchange', route);
    route();
  }
  boot();
})();
