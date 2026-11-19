(() => {
  const { rooms, schedule, bookings, days } = window.RuangKita;
  const app = document.querySelector('#app');
  const OPEN = '07.00';
  const CLOSE = '18.30';

  // ---------- Helpers ----------
  const toMin = t => { const [h, m] = t.split('.').map(Number); return h * 60 + m; };
  const toTime = m => `${String(Math.floor(m / 60)).padStart(2, '0')}.${String(m % 60).padStart(2, '0')}`;
  const overlaps = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;
  const timeOptions = (() => { const out = []; for (let m = toMin(OPEN); m <= toMin(CLOSE); m += 15) out.push(toTime(m)); return out; })();

  const parseHash = () => {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, qs = ''] = raw.split('?');
    const p = new URLSearchParams(qs);
    return { path: decodeURIComponent(path), q: { hari: p.get('hari') || '', mulai: p.get('mulai') || '', selesai: p.get('selesai') || '', peserta: p.get('peserta') || '', kecuali: p.get('kecuali') || '', tindakan: p.get('tindakan') || '' } };
  };
  const qs = (q, extra = {}) => {
    const p = new URLSearchParams();
    const all = { hari: q.hari, mulai: q.mulai, selesai: q.selesai, peserta: q.peserta, ...extra };
    Object.entries(all).forEach(([k, v]) => { if (v) p.set(k, v); });
    return p.toString();
  };
  const validQuery = q => days.includes(q.hari) && timeOptions.includes(q.mulai) && timeOptions.includes(q.selesai) && toMin(q.mulai) < toMin(q.selesai) && Number(q.peserta) > 0;
  const whenText = q => `${q.hari}, ${q.mulai}–${q.selesai} · ${q.peserta} orang`;

  // ---------- Status logic ----------
  // Kondisi menurut jadwal: apakah ada perkuliahan pada waktu yang dicari.
  // Status persetujuan: apakah sudah ada pengajuan/persetujuan untuk kegiatan lain (data contoh).
  function evaluate(room, q) {
    const a = toMin(q.mulai), b = toMin(q.selesai);
    const classes = (schedule[room.id] || []).filter(c => c.day === q.hari && overlaps(a, b, toMin(c.start), toMin(c.end)));
    const related = bookings.filter(x => x.room === room.id && x.day === q.hari && overlaps(a, b, toMin(x.start), toMin(x.end)));
    const approved = related.find(x => x.status === 'approved');
    const pending = related.find(x => x.status === 'pending');
    let state = 'open';
    if (classes.length) state = 'class';
    else if (approved) state = 'booked';
    else if (pending) state = 'pending';
    return { room, classes, booking: approved || pending || null, state, fits: room.capacity >= Number(q.peserta) };
  }

  const CONDITION = {
    free: { label: 'Kosong', cls: 'neutral' },
    class: { label: 'Ada perkuliahan', cls: 'blue' }
  };
  const APPROVAL = {
    open: { label: 'Belum ada pengajuan', short: 'Bisa diajukan ke TU', cls: 'green', note: 'Belum boleh dipakai sebelum disetujui TU.' },
    pending: { label: 'Menunggu persetujuan', short: 'Ada pengajuan lain', cls: 'amber', note: 'Sudah ada pengajuan kegiatan lain yang sedang menunggu keputusan TU.' },
    booked: { label: 'Disetujui untuk kegiatan lain', short: 'Tidak bisa dipakai', cls: 'rose', note: 'TU sudah menyetujui kegiatan lain pada waktu ini.' },
    class: { label: 'Tidak bisa diajukan', short: 'Dipakai perkuliahan', cls: 'rose', note: 'Ruangan dipakai perkuliahan pada waktu ini.' }
  };
  const pill = (text, cls) => `<span class="pill ${cls}">${text}</span>`;
  const conditionPill = r => r.state === 'class' ? pill(CONDITION.class.label, CONDITION.class.cls) : pill(CONDITION.free.label, CONDITION.free.cls);
  const approvalPill = r => pill(APPROVAL[r.state].label, APPROVAL[r.state].cls);

  const setPage = (title, html) => {
    document.title = `${title} — RuangKita`;
    app.innerHTML = html;
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  };

  const explainer = (open = false) => `<details class="explainer" ${open ? 'open' : ''}>
    <summary>Kosong belum tentu boleh dipakai. Apa bedanya?</summary>
    <div class="explainer-grid">
      <div><strong>Kondisi menurut jadwal</strong><p>Apakah ada perkuliahan di ruangan pada waktu itu, berdasarkan jadwal kuliah DSI.</p></div>
      <div><strong>Status persetujuan</strong><p>Apakah TU sudah menyetujui kegiatan lain, ada pengajuan yang menunggu, atau ruangan masih bisa kamu ajukan.</p></div>
    </div>
    <p class="explainer-foot">Ruangan baru boleh dipakai setelah pengajuanmu disetujui TU.</p>
  </details>`;

  // ---------- Page 1: Beranda + form pencarian ----------
  function home(q) {
    const sel = (id, label, opts, value, ph) => `<label class="field"><span>${label}</span><select id="${id}" name="${id}" required><option value="">${ph}</option>${opts.map(o => `<option ${o === value ? 'selected' : ''}>${o}</option>`).join('')}</select></label>`;
    setPage('Cari ruangan', `<section class="hero">
        <span class="eyebrow">RuangKita · Mahasiswa DSI ITS</span>
        <h1>Cari ruangan untuk kegiatanmu, lalu <em>pastikan bisa dipakai.</em></h1>
        <p class="hero-copy">Masukkan waktu dan jumlah peserta. RuangKita menampilkan jadwal kuliah dan status persetujuan setiap ruangan.</p>
      </section>
      <form class="search-card" id="search-form" novalidate>
        <h2>Kapan dan untuk berapa orang?</h2>
        <div class="form-grid">
          ${sel('hari', 'Hari', days, q.hari, 'Pilih hari')}
          ${sel('mulai', 'Jam mulai', timeOptions.slice(0, -1), q.mulai, 'Pilih jam')}
          ${sel('selesai', 'Jam selesai', timeOptions.slice(1), q.selesai, 'Pilih jam')}
          <label class="field"><span>Jumlah peserta</span><input id="peserta" name="peserta" type="number" min="1" max="200" inputmode="numeric" placeholder="Contoh: 15" value="${q.peserta}" required></label>
        </div>
        <p class="form-error" id="form-error" role="alert"></p>
        <button class="button-primary button-wide" type="submit">Cari ruangan</button>
        <p class="form-hint">Jadwal tersedia Senin–Jumat, pukul ${OPEN}–${CLOSE}.</p>
      </form>
      ${explainer()}`);
    document.querySelector('#search-form').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target;
      const next = { hari: f.hari.value, mulai: f.mulai.value, selesai: f.selesai.value, peserta: String(parseInt(f.peserta.value, 10) || '') };
      const err = document.querySelector('#form-error');
      if (!next.hari || !next.mulai || !next.selesai || !next.peserta) { err.textContent = 'Lengkapi hari, jam mulai, jam selesai, dan jumlah peserta.'; return; }
      if (toMin(next.mulai) >= toMin(next.selesai)) { err.textContent = 'Jam selesai harus setelah jam mulai.'; return; }
      if (Number(next.peserta) < 1) { err.textContent = 'Jumlah peserta minimal 1 orang.'; return; }
      location.hash = `/hasil?${qs(next)}`;
    });
  }

  // ---------- Page 2: Hasil pencarian ----------
  function suggestions(q) {
    // Waktu lain pada hari yang sama (durasi sama) yang masih punya ruangan "bisa diajukan",
    // diurutkan dari yang paling dekat dengan jam yang dicari.
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
    const href = `#/ruang/${r.room.id}?${qs(q)}`;
    const cls = r.classes[0];
    const extra = r.state === 'class' ? `${cls.course} · ${cls.start}–${cls.end}` : r.booking ? `${r.booking.activity} · ${r.booking.start}–${r.booking.end}` : APPROVAL.open.note;
    return `<a class="room-card state-${r.state}" href="${href}">
      <div class="room-card-head"><h3>${r.room.name}</h3><span class="capacity">Kapasitas ${r.room.capacity}</span></div>
      <dl class="status-pair">
        <div><dt>Kondisi menurut jadwal</dt><dd>${conditionPill(r)}</dd></div>
        <div class="approval-col"><dt>Status persetujuan</dt><dd>${approvalPill(r)}</dd></div>
      </dl>
      <p class="room-card-note">${extra}</p>
      <span class="card-cta">Lihat detail <span aria-hidden="true">→</span></span>
    </a>`;
  }

  function results(q) {
    if (!validQuery(q)) { home(q); return; }
    const all = rooms.map(r => evaluate(r, q)).filter(r => r.fits && r.room.id !== q.kecuali);
    const groups = [
      { key: 'open', title: 'Bisa diajukan ke TU', desc: 'Kosong menurut jadwal dan belum ada pengajuan lain. Tetap perlu persetujuan TU sebelum dipakai.', items: all.filter(r => r.state === 'open') },
      { key: 'pending', title: 'Perlu kepastian dari TU', desc: 'Kosong menurut jadwal, tetapi sudah ada pengajuan lain yang menunggu persetujuan.', items: all.filter(r => r.state === 'pending') },
      { key: 'blocked', title: 'Tidak bisa dipakai pada waktu ini', desc: 'Ada perkuliahan atau TU sudah menyetujui kegiatan lain.', items: all.filter(r => r.state === 'class' || r.state === 'booked') }
    ];
    const tooSmall = rooms.filter(r => r.capacity < Number(q.peserta)).length;
    const excluded = q.kecuali ? rooms.find(r => r.id === q.kecuali) : null;
    const sugg = groups[0].items.length ? [] : suggestions(q);
    const otherDays = groups[0].items.length ? [] : days.filter(d => d !== q.hari).map(d => ({ q: { ...q, hari: d }, n: rooms.map(r => evaluate(r, { ...q, hari: d })).filter(r => r.fits && r.state === 'open').length })).filter(x => x.n);

    setPage('Hasil pencarian', `<a class="back-link" href="#/?${qs(q)}">← Ubah pencarian</a>
      <section class="page-head">
        <span class="eyebrow">Hasil pencarian</span>
        <h1>${groups[0].items.length ? `${groups[0].items.length} ruangan bisa diajukan` : 'Belum ada ruangan yang bisa diajukan'}</h1>
        <p class="query-chip">${whenText(q)} <a href="#/?${qs(q)}">Ubah</a></p>
        ${excluded ? `<p class="info-banner">Menampilkan alternatif selain <strong>${excluded.name}</strong>.</p>` : ''}
        ${tooSmall ? `<p class="muted-note">${tooSmall} ruangan disembunyikan karena kapasitasnya kurang dari ${q.peserta} orang.</p>` : ''}
      </section>
      ${!groups[0].items.length ? `<section class="empty-box">
        <strong>Tidak ada ruangan yang bisa diajukan pada waktu ini.</strong>
        <p>Coba waktu lain di hari ${q.hari}, atau hari lain di jam yang sama.</p>
        ${sugg.length ? `<p class="sugg-label">Waktu lain hari ${q.hari}:</p><div class="sugg-row">${sugg.map(s => `<a class="sugg" href="#/hasil?${qs(s.q)}">${s.q.mulai}–${s.q.selesai}<small>${s.n} ruangan</small></a>`).join('')}</div>` : ''}
        ${otherDays.length ? `<p class="sugg-label">Hari lain, ${q.mulai}–${q.selesai}:</p><div class="sugg-row">${otherDays.map(s => `<a class="sugg" href="#/hasil?${qs(s.q)}">${s.q.hari}<small>${s.n} ruangan</small></a>`).join('')}</div>` : ''}
        <a class="button-secondary" href="#/?${qs(q)}">Ubah kriteria pencarian</a>
      </section>` : ''}
      ${groups.filter(g => g.items.length).map(g => `<section class="group group-${g.key}">
        <div class="group-head"><h2>${g.title} <span class="count">${g.items.length}</span></h2><p>${g.desc}</p></div>
        <div class="room-grid">${g.items.map(r => resultCard(r, q)).join('')}</div>
      </section>`).join('')}
      ${explainer()}`);
  }

  // ---------- Page 3: Detail ruangan ----------
  function detail(id, q) {
    const room = rooms.find(r => r.id === id);
    if (!room || !validQuery(q)) { home(q); return; }
    const r = evaluate(room, q);
    const a = toMin(q.mulai), b = toMin(q.selesai);
    const items = [
      ...(schedule[room.id] || []).filter(c => c.day === q.hari).map(c => ({ start: c.start, end: c.end, title: c.course, sub: `Perkuliahan · ${c.info}${c.note ? ` · ${c.note}` : ''}`, kind: 'class' })),
      ...bookings.filter(x => x.room === room.id && x.day === q.hari).map(x => ({ start: x.start, end: x.end, title: x.activity, sub: x.status === 'approved' ? 'Disetujui TU' : 'Menunggu persetujuan TU', kind: x.status }))
    ].sort((x, y) => toMin(x.start) - toMin(y.start));
    const ap = APPROVAL[r.state];
    setPage(room.name, `<a class="back-link" href="#/hasil?${qs(q)}">← Kembali ke hasil pencarian</a>
      <section class="page-head">
        <span class="eyebrow">Detail ruangan</span>
        <h1>${room.name}</h1>
        <p class="query-chip">${whenText(q)}</p>
      </section>
      <div class="detail-grid">
        <section class="panel">
          <h2>Kapasitas</h2>
          <p class="big-line">${room.capacity} orang <span class="ok">✓ cukup untuk ${q.peserta} orang</span></p>
          <p class="muted-note">Departemen Sistem Informasi ITS</p>
          <h2 class="mt">Jadwal hari ${q.hari}</h2>
          <ul class="timeline">
            ${items.length ? items.map(it => `<li class="tl-${it.kind} ${overlaps(a, b, toMin(it.start), toMin(it.end)) ? 'tl-hit' : ''}"><span class="tl-time">${it.start}–${it.end}</span><span><strong>${it.title}</strong><small>${it.sub}</small></span></li>`).join('') : '<li class="tl-empty">Tidak ada perkuliahan atau pengajuan pada hari ini.</li>'}
          </ul>
          <p class="muted-note">Baris berbingkai hijau tua bentrok dengan waktu yang kamu cari (${q.mulai}–${q.selesai}).</p>
        </section>
        <section class="status-col">
          <article class="status-box">
            <span class="status-num">1</span>
            <div><h2>Kondisi menurut jadwal</h2>${conditionPill(r)}
            <p>${r.state === 'class' ? `${r.classes.map(c => `${c.course} (${c.start}–${c.end})`).join(', ')}.` : `Tidak ada perkuliahan pada ${q.mulai}–${q.selesai}.`}</p>
            <p class="muted-note">Jadwal kuliah Gasal 2026/2027. Kondisi di lapangan bisa berbeda.</p></div>
          </article>
          <article class="status-box approval-box approval-${ap.cls}">
            <span class="status-num">2</span>
            <div><h2>Status persetujuan</h2><p class="approval-label">${ap.label}</p>
            <p>${ap.note}${r.booking ? ` (${r.booking.activity}, ${r.booking.start}–${r.booking.end})` : ''}</p></div>
          </article>
          ${r.state === 'open' ? '<p class="warn-line"><strong>Ingat:</strong> ruangan kosong belum berarti boleh langsung dipakai.</p>' : ''}
          <a class="button-primary button-wide" href="#/ruang/${room.id}/langkah?${qs(q)}">Lihat langkah selanjutnya</a>
          <a class="button-secondary button-wide" href="#/hasil?${qs(q)}">Bandingkan dengan ruangan lain</a>
        </section>
      </div>`);
  }

  // ---------- Page 4: Langkah selanjutnya ----------
  function nextStep(id, q) {
    const room = rooms.find(r => r.id === id);
    if (!room || !validQuery(q)) { home(q); return; }
    const r = evaluate(room, q);
    const alt = `#/hasil?${qs(q, { kecuali: room.id })}`;
    const done = t => `#/selesai/${room.id}?${qs(q, { tindakan: t })}`;
    const content = {
      open: { tone: 'green', title: 'Ruangan ini bisa kamu ajukan ke TU', lead: 'Belum ada kegiatan lain di waktu ini, tetapi ruangan baru boleh dipakai setelah pengajuanmu disetujui TU.',
        steps: ['Ajukan penggunaan ruangan ke TU Departemen Sistem Informasi sesuai prosedur peminjaman yang berlaku.', 'Tunggu persetujuan dari TU.', 'Gunakan ruangan setelah pengajuanmu disetujui.'],
        actions: `<a class="button-primary" href="${done('ajukan')}">Pilih ruangan ini &amp; ajukan ke TU</a><a class="button-secondary" href="${alt}">Cari alternatif</a>` },
      pending: { tone: 'amber', title: 'Perlu kepastian dari TU', lead: `Sudah ada pengajuan lain (${r.booking?.activity}, ${r.booking?.start}–${r.booking?.end}) yang sedang menunggu persetujuan. Ruangan ini belum pasti bisa kamu pakai.`,
        steps: ['Tanyakan ke TU DSI apakah pengajuan tersebut akan disetujui.', 'Jika tidak disetujui, ajukan penggunaan ruangan untuk kegiatanmu.', 'Sambil menunggu, siapkan ruangan alternatif.'],
        actions: `<a class="button-primary" href="${done('hubungi-tu')}">Hubungi TU untuk kepastian</a><a class="button-secondary" href="${alt}">Cari alternatif</a>` },
      booked: { tone: 'rose', title: 'Ruangan ini tidak bisa dipakai pada waktu ini', lead: `TU sudah menyetujui kegiatan lain (${r.booking?.activity}, ${r.booking?.start}–${r.booking?.end}).`,
        steps: ['Cari ruangan lain pada waktu yang sama, atau', 'ubah waktu kegiatanmu.'],
        actions: `<a class="button-primary" href="${alt}">Cari alternatif</a><a class="button-secondary" href="#/?${qs(q)}">Ubah waktu</a>` },
      class: { tone: 'rose', title: 'Ruangan ini tidak bisa dipakai pada waktu ini', lead: `Ruangan dipakai perkuliahan: ${r.classes.map(c => `${c.course} (${c.start}–${c.end})`).join(', ')}.`,
        steps: ['Cari ruangan lain pada waktu yang sama, atau', 'ubah waktu kegiatanmu.'],
        actions: `<a class="button-primary" href="${alt}">Cari alternatif</a><a class="button-secondary" href="#/?${qs(q)}">Ubah waktu</a>` }
    }[r.state];
    setPage('Langkah selanjutnya', `<a class="back-link" href="#/ruang/${room.id}?${qs(q)}">← Kembali ke detail ruangan</a>
      <section class="page-head"><span class="eyebrow">Langkah selanjutnya</span><h1>${room.name}</h1><p class="query-chip">${whenText(q)}</p></section>
      <section class="verdict verdict-${content.tone}">
        <h2>${content.title}</h2><p>${content.lead}</p>
        <ol class="steps">${content.steps.map(s => `<li>${s}</li>`).join('')}</ol>
        <div class="actions">${content.actions}</div>
      </section>`);
  }

  // ---------- Page 5: Selesai ----------
  function finished(id, q) {
    const room = rooms.find(r => r.id === id);
    if (!room || !validQuery(q)) { home(q); return; }
    const ajukan = q.tindakan === 'ajukan';
    setPage('Pilihan tersimpan', `<section class="done">
      <span class="done-icon" aria-hidden="true">✓</span>
      <span class="eyebrow">Selesai</span>
      <h1>${ajukan ? 'Pilihan ruangan sudah ditentukan' : 'Langkah selanjutnya sudah jelas'}</h1>
      <dl class="summary">
        <div><dt>Ruangan</dt><dd>${room.name}</dd></div>
        <div><dt>Waktu</dt><dd>${q.hari}, ${q.mulai}–${q.selesai}</dd></div>
        <div><dt>Peserta</dt><dd>${q.peserta} orang</dd></div>
        <div><dt>Langkah berikutnya</dt><dd>${ajukan ? 'Ajukan penggunaan ruangan ke TU DSI' : 'Hubungi TU DSI untuk memastikan status ruangan'}</dd></div>
      </dl>
      <p class="warn-line">${ajukan ? 'Ruangan belum boleh dipakai sampai pengajuanmu disetujui TU.' : 'Siapkan ruangan alternatif selagi menunggu jawaban TU.'}</p>
      <p class="muted-note">Pada prototype ini, pengajuan belum dikirim lewat RuangKita. Pengajuan online termasuk fitur tahap berikutnya.</p>
      <div class="actions center"><a class="button-primary" href="#/">Cari ruangan lain</a></div>
    </section>`);
  }

  // ---------- Router ----------
  function route() {
    const { path, q } = parseHash();
    let m;
    if (!path) return home(q);
    if (path === 'hasil') return results(q);
    if ((m = path.match(/^ruang\/([^/]+)\/langkah$/))) return nextStep(m[1], q);
    if ((m = path.match(/^ruang\/([^/]+)$/))) return detail(m[1], q);
    if ((m = path.match(/^selesai\/([^/]+)$/))) return finished(m[1], q);
    location.hash = '/';
  }
  window.addEventListener('hashchange', route);
  route();
})();
