/* RuangKita prototype: static data and hash-based navigation for GitHub Pages. */
const rooms = [
  { id: 'diskusi-1', name: 'Ruang Diskusi 1', type: 'Ruang diskusi', location: 'Gedung Departemen, Lt. 2', zone: 'Gedung Departemen', floor: 'Lantai 2', capacity: 8, activity: 'Tidak sedang digunakan', availability: 'Memerlukan persetujuan', next: '13.00–15.00', schedule: [['10.00–11.00', 'Diskusi kelompok', 'Selesai'], ['13.00–15.00', 'Kelas asistensi', 'Jadwal berikutnya']], art: 'discussion', number: 'D · 201', hours: '08.00–17.00' },
  { id: 'diskusi-2', name: 'Ruang Diskusi 2', type: 'Ruang diskusi', location: 'Gedung Departemen, Lt. 2', zone: 'Gedung Departemen', floor: 'Lantai 2', capacity: 6, activity: 'Sedang digunakan', availability: 'Tidak tersedia', next: '14.00–16.00', schedule: [['09.00–12.00', 'Tim riset', 'Sedang berlangsung'], ['14.00–16.00', 'Diskusi kelompok', 'Jadwal berikutnya']], art: 'discussion', number: 'D · 202', hours: '08.00–17.00' },
  { id: 'rapat-a', name: 'Ruang Rapat A', type: 'Ruang rapat', location: 'Gedung Manajemen, Lt. 1', zone: 'Gedung Manajemen', floor: 'Lantai 1', capacity: 10, activity: 'Tidak sedang digunakan', availability: 'Tersedia untuk digunakan', next: '15.00–16.00', schedule: [['10.00–11.00', 'Rapat himpunan', 'Selesai'], ['15.00–16.00', 'Rapat dosen', 'Jadwal berikutnya']], art: 'meeting', number: 'M · 105', hours: '08.00–18.00' },
  { id: 'kelas-301', name: 'Ruang Kelas 301', type: 'Ruang kelas', location: 'Gedung Departemen, Lt. 3', zone: 'Gedung Departemen', floor: 'Lantai 3', capacity: 32, activity: 'Sedang digunakan', availability: 'Tidak tersedia', next: '12.30–14.00', schedule: [['08.00–12.30', 'Kuliah', 'Sedang berlangsung'], ['12.30–14.00', 'Kuliah', 'Jadwal berikutnya']], art: 'class', number: 'D · 301', hours: '07.00–18.00' },
  { id: 'kelas-302', name: 'Ruang Kelas 302', type: 'Ruang kelas', location: 'Gedung Departemen, Lt. 3', zone: 'Gedung Departemen', floor: 'Lantai 3', capacity: 28, activity: 'Tidak sedang digunakan', availability: 'Memerlukan persetujuan', next: '13.00–15.00', schedule: [['08.00–10.00', 'Kuliah', 'Selesai'], ['13.00–15.00', 'Kuliah', 'Jadwal berikutnya']], art: 'class', number: 'D · 302', hours: '07.00–18.00' },
  { id: 'belajar-bersama', name: 'Ruang Belajar Bersama', type: 'Ruang belajar', location: 'Perpustakaan, Lt. 2', zone: 'Perpustakaan', floor: 'Lantai 2', capacity: 12, activity: 'Tidak sedang digunakan', availability: 'Tersedia untuk digunakan', next: '—', schedule: [['09.00–10.00', 'Belajar mandiri', 'Selesai'], ['—', 'Belum ada jadwal berikutnya', '']], art: 'study', number: 'P · 204', hours: '08.00–20.00' }
];

const scenarios = [
  { title: 'Memahami status ruangan', task: 'Bayangkan kamu sedang mencari tempat untuk berdiskusi. Lihat informasi Ruang Diskusi 1 dan jelaskan apakah kamu dapat langsung menggunakan ruangan tersebut.', room: 'diskusi-1', hint: 'Buka detail ruangan dan ceritakan apa yang kamu pahami tentang kondisinya saat ini serta status penggunaannya.' },
  { title: 'Menentukan ruangan yang sesuai', task: 'Kamu ingin berdiskusi dengan kelompok kecil sekarang. Ruangan mana yang akan kamu pilih berdasarkan informasi yang tersedia?', hint: 'Jelajahi daftar ruang dan gunakan informasi yang menurutmu relevan untuk menentukan pilihan.' },
  { title: 'Membandingkan beberapa ruangan', task: 'Kelompokmu membutuhkan ruangan untuk berdiskusi selama satu jam sore ini. Ruangan mana yang paling sesuai dengan kebutuhan tersebut?', hint: 'Bandingkan beberapa ruang. Pertimbangkan kapasitas, lokasi, kondisi saat ini, status penggunaan, dan jadwal.' }
];

const app = document.querySelector('#app');
const activityClass = room => room.activity.startsWith('Sedang') ? 'active-now' : 'idle';
const availabilityClass = room => room.availability.startsWith('Tersedia') ? 'available' : room.availability.startsWith('Memerlukan') ? 'approval' : 'unavailable';
const pill = (text, className) => `<span class="pill ${className}">${text}</span>`;
const art = (room, extra = '') => `<div class="room-art art-${room.art} ${extra}" aria-hidden="true"><i class="art-window"></i><i class="art-table"></i><i class="art-chair one"></i><i class="art-chair two"></i><i class="art-lamp"></i><span class="room-number">${room.number}</span></div>`;
const locIcon = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 6.5c0 3.4-5 7.5-5 7.5S3 9.9 3 6.5a5 5 0 1 1 10 0Z" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="6.5" r="1.6" stroke="currentColor" stroke-width="1.4"/></svg>';

function roomCard(room, index) {
  return `<article class="room-card" style="animation-delay:${index * 45}ms" data-room="${room.id}" tabindex="0" role="link" aria-label="Lihat detail ${room.name}">
    ${art(room)}
    <div class="card-content"><div class="card-top"><div><h3>${room.name}</h3><span class="location">${locIcon}${room.location}</span></div><span class="capacity">${room.capacity} orang</span></div>
      <div class="card-statuses"><div class="status-line"><span class="status-label">Kondisi saat ini</span>${pill(room.activity, activityClass(room))}</div><div class="status-line"><span class="status-label">Status penggunaan</span>${pill(room.availability, availabilityClass(room))}</div></div>
      <div class="card-bottom"><span class="next-time">Berikutnya <strong>${room.next}</strong></span><span class="card-link">Lihat detail ↗</span></div>
    </div></article>`;
}

function setNav(active) {
  document.querySelectorAll('.main-nav a').forEach(link => link.classList.toggle('active', link.dataset.nav === active));
}

function home() {
  setNav('home');
  app.innerHTML = `<section class="hero"><div><span class="eyebrow">Ruang di sekitar kampus</span><h1>Ruang untuk bertemu,<br><em>belajar, dan bertukar ide.</em></h1><p class="hero-copy">Jelajahi ruang kampus dan lihat informasi penggunaannya.</p></div><div class="hero-meta"><span class="meta-item"><span class="campus-dot"></span>6 ruang terdaftar</span></div></section>
    <div class="toolbar"><label class="search-wrap"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.7" cy="8.7" r="5.9" stroke="currentColor" stroke-width="1.7"/><path d="m13.2 13.2 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><input class="search" id="search" type="search" placeholder="Cari nama atau lokasi ruang..." aria-label="Cari ruang"></label><span class="filter-label">Status penggunaan</span><button class="filter-chip active" data-filter="Semua" aria-pressed="true">Semua</button><button class="filter-chip" data-filter="Tersedia" aria-pressed="false">Tersedia</button><button class="filter-chip" data-filter="Memerlukan persetujuan" aria-pressed="false">Perlu persetujuan</button><button class="filter-chip" data-filter="Tidak tersedia" aria-pressed="false">Tidak tersedia</button></div>
    <div class="section-heading"><h2>Ruang di kampus</h2><span id="room-count" aria-live="polite">6 ruang</span></div><section class="room-grid" id="room-grid" aria-label="Daftar ruangan">${rooms.map(roomCard).join('')}</section>
    <div class="compare-banner"><div class="banner-left"><span class="banner-icon" aria-hidden="true">⌘</span><div><strong>Masih mempertimbangkan?</strong><span>Lihat status dan detail beberapa ruang berdampingan.</span></div></div><a href="#/compare" class="button-primary">Bandingkan ruang <span aria-hidden="true">→</span></a></div>`;
  bindHome();
}

function bindHome() {
  let filter = 'Semua';
  let query = '';
  const draw = () => {
    const visible = rooms.filter(room => (filter === 'Semua' || (filter === 'Tersedia' ? room.availability.startsWith('Tersedia') : room.availability === filter)) && `${room.name} ${room.location}`.toLowerCase().includes(query.toLowerCase()));
    document.querySelector('#room-grid').innerHTML = visible.length ? visible.map(roomCard).join('') : '<div class="empty-state"><strong>Ruang tidak ditemukan</strong>Coba kata kunci atau status yang berbeda.</div>';
    document.querySelector('#room-count').textContent = `${visible.length} ruang`;
  };
  document.querySelector('#search').addEventListener('input', event => { query = event.target.value; draw(); });
  document.querySelectorAll('.filter-chip').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('.filter-chip').forEach(item => { const selected = item === button; item.classList.toggle('active', selected); item.setAttribute('aria-pressed', String(selected)); });
    draw();
  }));
  document.querySelector('#room-grid').addEventListener('click', event => {
    const card = event.target.closest('[data-room]');
    if (card) location.hash = `/room/${card.dataset.room}`;
  });
  document.querySelector('#room-grid').addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-room]')) { event.preventDefault(); location.hash = `/room/${event.target.dataset.room}`; }
  });
}

function detail(id) {
  const room = rooms.find(item => item.id === id);
  if (!room) { home(); return; }
  setNav('home');
  app.innerHTML = `<section class="detail-page"><a href="#/" class="back-link"><span aria-hidden="true">←</span> Kembali ke daftar ruang</a>
    <div class="detail-head"><div><span class="eyebrow">${room.type} · ${room.zone}</span><h1>${room.name}</h1><p class="hero-copy">${room.location} <span class="detail-separator">·</span> Kapasitas ${room.capacity} orang</p></div></div>
    <div class="detail-layout"><section class="detail-main">${art(room, 'detail-art')}<div class="detail-info"><div class="info-section"><h2>Kondisi saat ini</h2><div class="big-status">${pill(room.activity, activityClass(room))}</div><p class="info-note">Kondisi ruang saat ini.</p></div><div class="info-section"><h2>Status penggunaan</h2><div class="big-status">${pill(room.availability, availabilityClass(room))}</div><p class="info-note">Informasi status penggunaan ruang.</p></div></div></section>
    <aside class="side-panel"><h2>Informasi ruang</h2><div class="fact-list"><div class="fact"><span>Lokasi</span><strong>${room.floor}</strong></div><div class="fact"><span>Area</span><strong>${room.zone}</strong></div><div class="fact"><span>Kapasitas</span><strong>${room.capacity} orang</strong></div><div class="fact"><span>Jam operasional</span><strong>${room.hours}</strong></div></div><div class="panel-divider"></div><p class="schedule-title">Jadwal hari ini</p>${room.schedule.map(item => `<div class="schedule-row"><span class="schedule-time">${item[0]}</span><span class="schedule-desc">${item[1]}${item[2] ? `<small>${item[2]}</small>` : ''}</span></div>`).join('')}<div class="detail-actions"><button class="button-secondary" id="compare-detail">Bandingkan ruang</button><a class="button-primary" href="#/">Lihat ruang lain</a></div></aside></div></section>`;
  document.querySelector('#compare-detail').addEventListener('click', () => { location.hash = '/compare'; });
}

function compare() {
  setNav('compare');
  app.innerHTML = `<section class="compare-page"><span class="eyebrow">Lihat berdampingan</span><h1>Bandingkan ruang</h1><p class="hero-copy">Pilih ruang untuk melihat informasi yang sama secara berdampingan.</p>
    <div class="compare-tools"><p id="selected-count" aria-live="polite"></p><button class="select-all" id="select-all" type="button">Pilih semua</button></div>
    <div class="compare-picker" aria-label="Pilih ruangan untuk dibandingkan">${rooms.map(room => `<label class="compare-option"><input class="compare-check" type="checkbox" value="${room.id}" ${['diskusi-1', 'rapat-a', 'diskusi-2'].includes(room.id) ? 'checked' : ''}><span><strong>${room.name}</strong><small>${room.location}</small></span></label>`).join('')}</div>
    <section class="compare-results" id="compare-results" aria-live="polite" aria-label="Informasi ruang terpilih"></section>
    <div class="compare-footer"><span>Jadwal hari ini</span><a href="#/" class="button-secondary">← Kembali ke daftar</a></div></section>`;
  const checks = [...document.querySelectorAll('.compare-check')];
  const update = () => {
    const selected = rooms.filter(room => checks.find(check => check.value === room.id)?.checked);
    document.querySelector('#selected-count').textContent = `${selected.length} ruang dipilih`;
    document.querySelector('#compare-results').innerHTML = selected.length ? selected.map(room => `<article class="compare-room"><header><div><span class="compare-room-type">${room.type}</span><h2>${room.name}</h2><p>${room.location}</p></div><span class="capacity">${room.capacity} orang</span></header><dl><div><dt>Kondisi saat ini</dt><dd>${pill(room.activity, activityClass(room))}</dd></div><div><dt>Status penggunaan</dt><dd>${pill(room.availability, availabilityClass(room))}</dd></div><div><dt>Jadwal berikutnya</dt><dd>${room.next}</dd></div><div><dt>Jam operasional</dt><dd>${room.hours}</dd></div></dl><a href="#/room/${room.id}" class="card-link">Lihat detail ↗</a></article>`).join('') : '<div class="empty-state"><strong>Belum ada ruang dipilih</strong>Pilih satu atau beberapa ruang untuk mulai membandingkan.</div>';
  };
  checks.forEach(check => check.addEventListener('change', update));
  document.querySelector('#select-all').addEventListener('click', () => { const select = !checks.every(check => check.checked); checks.forEach(check => { check.checked = select; }); update(); });
  update();
}

function testPage(index) {
  setNav('');
  if (index < 0 || index >= scenarios.length) { home(); return; }
  const scenario = scenarios[index];
  const nextHref = index === 0 ? `#/room/${scenario.room}` : index === 1 ? '#/' : '#/compare';
  const nextLabel = index === 0 ? 'Lihat informasi ruang' : index === 1 ? 'Jelajahi daftar ruang' : 'Bandingkan ruang';
  app.innerHTML = `<section class="test-page"><div class="test-intro"><span class="test-intro-icon" aria-hidden="true">✳</span><div><h2>RuangKita · Sesi eksplorasi</h2><p>Baca skenario berikut. Gunakan informasi yang tersedia untuk menjawabnya dengan cara yang menurutmu paling tepat.</p></div></div>
    <div class="scenario-progress" aria-label="Skenario ${index + 1} dari ${scenarios.length}">${scenarios.map((_, item) => `<span class="progress-dot ${item === index ? 'current' : ''}" aria-hidden="true"></span>`).join('')}<span class="progress-label">Skenario ${index + 1} dari ${scenarios.length}</span></div>
    <article class="scenario-card"><span class="scenario-kicker">Skenario 0${index + 1}</span><h1>${scenario.title}</h1><div class="scenario-task">“${scenario.task}”</div><p class="scenario-hint">${scenario.hint}</p><div class="scenario-actions"><a class="button-text back-link" href="${index === 0 ? '#/' : `#/test/scenario-${index}`}">← ${index === 0 ? 'Kembali ke beranda' : 'Skenario sebelumnya'}</a><a class="button-primary" href="${nextHref}">${nextLabel} <span aria-hidden="true">→</span></a></div></article>
    <div class="scenario-actions scenario-next">${index < scenarios.length - 1 ? `<a class="button-text back-link" href="#/test/scenario-${index + 2}">Lanjut ke skenario berikutnya →</a>` : '<span>Terima kasih telah menjelajahi RuangKita.</span>'}</div></section>`;
}

function route() {
  const path = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  if (path === '') { home(); return; }
  if (path === 'compare') { compare(); return; }
  if (path === 'test') { testPage(0); return; }
  const scenario = path.match(/^test\/scenario-(\d+)$/);
  if (scenario) { testPage(Number(scenario[1]) - 1); return; }
  const room = path.match(/^room\/(.+)$/);
  if (room) { detail(room[1]); return; }
  home();
}

window.addEventListener('hashchange', route);
route();
