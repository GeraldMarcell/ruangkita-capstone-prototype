(() => {
  const { rooms, scenarios, formatActivityClass, formatAvailabilityClass, experiment } = window.RuangKita;
  const app = document.querySelector('#app');
  const compareIds = new Set();
  let currentPath = '';
  let previousPath = '';
  const $ = selector => document.querySelector(selector);
  const locationIcon = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 6.5c0 3.4-5 7.5-5 7.5S3 9.9 3 6.5a5 5 0 1 1 10 0Z" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="6.5" r="1.6" stroke="currentColor" stroke-width="1.4"/></svg>';
  const badge = (text, type) => `<span class="pill ${type}"><span class="badge-mark" aria-hidden="true"></span>${text}</span>`;
  const art = (room, extra = '') => `<div class="room-art art-${room.art} ${extra}" aria-hidden="true"><i class="art-window"></i><i class="art-table"></i><i class="art-chair one"></i><i class="art-chair two"></i><i class="art-lamp"></i><span class="room-number">${room.floor.replace('Lantai ', '')} · ${room.capacity} KAP.</span></div>`;
  const nav = active => {
    document.querySelectorAll('.main-nav a').forEach(link => link.classList.toggle('active', link.dataset.nav === active));
    const compareLink = $('[data-nav="compare"]');
    if (compareLink) compareLink.textContent = compareIds.size ? `Bandingkan (${compareIds.size})` : 'Bandingkan';
  };
  const announce = message => {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(announce.timer);
    announce.timer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  };
  const roomCard = room => `<article class="room-card">
    <div class="card-art-wrap">${art(room)}</div><div class="card-content">
      <div class="card-top"><div><h3>${room.name}</h3><span class="location">${locationIcon}${room.building} · ${room.floor}</span></div><span class="capacity">${room.capacity} orang</span></div>
      <div class="facility-row">${room.facilities.slice(0, 3).map(item => `<span>${item}</span>`).join('')}</div>
      <div class="card-statuses"><div class="status-line"><span class="status-label">Kondisi saat ini</span>${badge(room.activity, formatActivityClass(room))}</div><div class="status-line"><span class="status-label">Status penggunaan</span>${badge(room.availability, formatAvailabilityClass(room))}</div></div>
      <div class="card-bottom"><span class="next-time">Berikutnya <strong>${room.next}</strong></span><button class="compare-toggle ${compareIds.has(room.id) ? 'selected' : ''}" data-compare="${room.id}" type="button" aria-pressed="${compareIds.has(room.id)}">${compareIds.has(room.id) ? '✓ Dipilih' : '+ Bandingkan'}</button></div>
      <a href="#/room/${room.id}" class="card-open">Lihat detail <span aria-hidden="true">↗</span></a>
    </div></article>`;

  function updateRoomList() {
    const query = ($('#room-search')?.value || '').trim().toLocaleLowerCase('id');
    const building = $('#building-filter')?.value || 'all';
    const capacity = Number($('#capacity-filter')?.value || 0);
    const availability = $('#status-filter')?.value || 'all';
    const activity = $('#activity-filter')?.value || 'all';
    const filtered = rooms.filter(room => {
      const haystack = `${room.name} ${room.building} ${room.floor} ${room.facilities.join(' ')}`.toLocaleLowerCase('id');
      return (!query || haystack.includes(query)) && (building === 'all' || room.building === building) && room.capacity >= capacity && (availability === 'all' || room.availability === availability) && (activity === 'all' || room.activity === activity);
    });
    $('#room-count').textContent = `${filtered.length} dari ${rooms.length} ruang`;
    $('#room-grid').innerHTML = filtered.length ? filtered.map(roomCard).join('') : '<div class="empty-state"><strong>Tidak ada ruang yang cocok</strong>Ubah kata kunci atau filter untuk melihat pilihan lain.<button class="button-secondary" id="clear-filters" type="button">Hapus semua filter</button></div>';
  }

  function home() {
    nav('home');
    app.innerHTML = `<section class="dashboard-heading"><div><span class="eyebrow">RUANGKITA <span class="eyebrow-separator">/</span> KAMPUS ITS</span><h1>Temukan ruang untuk<br><em>setiap rencana.</em></h1><p class="hero-copy">Lihat kondisi, status penggunaan, dan jadwal ruang di lingkungan kampus.</p></div><div class="dashboard-stat"><span class="stat-icon" aria-hidden="true">⌂</span><span><strong>${rooms.length} ruang</strong><small>di 4 area kampus</small></span></div></section>
      <section class="find-panel" aria-label="Cari dan filter ruangan"><label class="search-wrap"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.7" cy="8.7" r="5.9" stroke="currentColor" stroke-width="1.7"/><path d="m13.2 13.2 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><input class="search" id="room-search" type="search" placeholder="Cari nama, gedung, atau lokasi..." aria-label="Cari nama, gedung, atau lokasi ruang"></label>
      <div class="filter-grid"><label>Gedung<select id="building-filter"><option value="all">Semua gedung</option>${[...new Set(rooms.map(room => room.building))].map(name => `<option>${name}</option>`).join('')}</select></label><label>Kapasitas minimum<select id="capacity-filter"><option value="0">Semua kapasitas</option>${[6, 10, 15, 20, 30].map(value => `<option value="${value}">${value}+ orang</option>`).join('')}</select></label><label>Status penggunaan<select id="status-filter"><option value="all">Semua status</option>${[...new Set(rooms.map(room => room.availability))].map(status => `<option>${status}</option>`).join('')}</select></label><label>Kondisi saat ini<select id="activity-filter"><option value="all">Semua kondisi</option><option>Sedang digunakan</option><option>Tidak sedang digunakan</option></select></label></div></section>
      <div class="list-heading"><div><h2>Daftar ruangan</h2><p>Informasi ruang kampus, diperbarui sepanjang hari.</p></div><span id="room-count" aria-live="polite"></span></div><section class="room-grid" id="room-grid" aria-label="Daftar ruangan"></section>
      <aside class="compare-banner"><div class="banner-left"><span class="banner-icon" aria-hidden="true">⇄</span><div><strong>Bandingkan beberapa ruang</strong><span>Pilih hingga tiga ruang untuk melihat informasinya berdampingan.</span></div></div><a class="button-primary" href="#/compare">Buka perbandingan <span aria-hidden="true">→</span></a></aside>`;
    updateRoomList();
    ['#room-search', '#building-filter', '#capacity-filter', '#status-filter', '#activity-filter'].forEach(selector => $(selector).addEventListener(selector === '#room-search' ? 'input' : 'change', event => {
      const type = selector === '#room-search' ? 'pencarian' : 'filter';
      experiment.log(type, event.target.value);
      updateRoomList();
    }));
    $('#room-grid').addEventListener('click', event => {
      const compare = event.target.closest('[data-compare]');
      if (compare) toggleCompare(compare.dataset.compare);
      if (event.target.closest('#clear-filters')) {
        ['#room-search', '#building-filter', '#capacity-filter', '#status-filter', '#activity-filter'].forEach(selector => { $(selector).value = selector === '#room-search' ? '' : selector.includes('filter') ? (selector === '#capacity-filter' ? '0' : 'all') : ''; });
        updateRoomList();
      }
    });
  }

  function toggleCompare(id) {
    if (compareIds.has(id)) compareIds.delete(id);
    else if (compareIds.size >= 3) { announce('Kamu dapat memilih maksimal tiga ruang.'); return; }
    else compareIds.add(id);
    experiment.log('perbandingan', compareIds.has(id) ? `dipilih: ${id}` : `dihapus: ${id}`);
    const path = location.hash.replace(/^#\/?/, '');
    if (path === 'compare') comparison();
    else if (!path) { updateRoomList(); nav('home'); }
    else nav('home');
  }

  function comparison() {
    nav('compare');
    app.innerHTML = `<section class="page-heading"><span class="eyebrow">RUANGKITA <span class="eyebrow-separator">/</span> PERBANDINGAN</span><h1>Bandingkan ruang</h1><p class="hero-copy">Pilih hingga tiga ruang. Informasi yang sama ditampilkan untuk setiap pilihan.</p></section>
      <section class="compare-select-section"><div class="list-heading"><div><h2>Pilih ruang</h2><p id="compare-count" aria-live="polite"></p></div><button class="button-text" id="clear-compare" type="button">Hapus pilihan</button></div><div class="compare-picker" id="compare-picker">${rooms.map(room => `<label class="compare-option"><input type="checkbox" value="${room.id}" ${compareIds.has(room.id) ? 'checked' : ''}><span><strong>${room.name}</strong><small>${room.building} · ${room.floor}</small></span></label>`).join('')}</div></section><section class="compare-results" id="compare-results" aria-live="polite" aria-label="Ruang yang dipilih untuk dibandingkan"></section>`;
    const render = () => {
      $('#compare-count').textContent = `${compareIds.size} dari 3 ruang dipilih`;
      $('#compare-results').innerHTML = compareIds.size ? [...compareIds].map(id => rooms.find(room => room.id === id)).filter(Boolean).map(room => `<article class="compare-room"><header><div><span class="compare-room-type">${room.building}</span><h2>${room.name}</h2><p>${room.floor} · Kapasitas ${room.capacity} orang</p></div></header><dl><div><dt>Kondisi saat ini</dt><dd>${badge(room.activity, formatActivityClass(room))}</dd></div><div><dt>Status penggunaan</dt><dd>${badge(room.availability, formatAvailabilityClass(room))}</dd></div><div><dt>Fasilitas</dt><dd>${room.facilities.join(' · ')}</dd></div><div><dt>Jadwal berikutnya</dt><dd>${room.next}<small>${room.nextUse}</small></dd></div><div><dt>Data diperbarui</dt><dd>${room.updated}</dd></div></dl><a href="#/room/${room.id}" class="card-link">Buka detail ↗</a></article>`).join('') : '<div class="empty-state"><strong>Belum ada ruang dipilih</strong>Pilih ruang di atas untuk mulai membandingkan.</div>';
    };
    $('#compare-picker').addEventListener('change', event => {
      if (!event.target.matches('input[type="checkbox"]')) return;
      if (event.target.checked && compareIds.size >= 3) { event.target.checked = false; announce('Kamu dapat memilih maksimal tiga ruang.'); return; }
      if (event.target.checked) compareIds.add(event.target.value); else compareIds.delete(event.target.value);
      experiment.log('perbandingan', `${event.target.checked ? 'dipilih' : 'dihapus'}: ${event.target.value}`);
      render(); nav('compare');
    });
    $('#clear-compare').addEventListener('click', () => { compareIds.clear(); render(); comparison(); });
    render();
  }

  function detail(id) {
    const room = rooms.find(item => item.id === id);
    if (!room) { home(); return; }
    nav('home');
    experiment.log('ruang dibuka', room.name);
    const activeScenario = experiment.getActiveScenarioId();
    const returnTo = activeScenario ? `#/${activeScenario}` : previousPath === 'compare' ? '#/compare' : '#/';
    const returnLabel = returnTo.includes('scenario') ? 'Kembali ke skenario' : returnTo === '#/compare' ? 'Kembali ke perbandingan' : 'Kembali ke daftar ruang';
    app.innerHTML = `<section class="detail-page"><a href="${returnTo}" class="back-link">← <span>${returnLabel}</span></a><header class="detail-head"><div><span class="eyebrow">${room.building} <span class="eyebrow-separator">/</span> ${room.floor}</span><h1>${room.name}</h1><p class="hero-copy">Informasi ruang dan jadwal penggunaan.</p></div><span class="capacity detail-capacity">Kapasitas ${room.capacity} orang</span></header>
      ${art(room, 'detail-art')}<div class="detail-layout"><section class="detail-statuses"><article class="detail-status activity-status"><span class="status-index">01</span><div><h2>Kondisi saat ini</h2>${badge(room.activity, formatActivityClass(room))}<p>Data diperbarui pukul ${room.updated}</p></div></article><article class="detail-status usage-status"><span class="status-index">02</span><div><h2>Status penggunaan</h2>${badge(room.availability, formatAvailabilityClass(room))}<p>Jam operasional ${room.hours}</p></div></article></section>
      <aside class="side-panel"><h2>Informasi ruang</h2><div class="fact"><span>Gedung</span><strong>${room.building}</strong></div><div class="fact"><span>Lokasi</span><strong>${room.floor}</strong></div><div class="fact"><span>Kapasitas</span><strong>${room.capacity} orang</strong></div><div class="fact"><span>Fasilitas</span><strong>${room.facilities.join(', ')}</strong></div><div class="panel-divider"></div><p class="schedule-title">Jadwal penggunaan</p>${room.schedule.map(item => `<div class="schedule-row"><span class="schedule-time">${item[0]}</span><span class="schedule-desc">${item[1]}${item[2] ? `<small>${item[2]}</small>` : ''}</span></div>`).join('')}<div class="next-use"><span>Penggunaan berikutnya</span><strong>${room.next}</strong><small>${room.nextUse}</small></div><div class="detail-actions"><button class="button-secondary" id="compare-this" type="button">${compareIds.has(room.id) ? 'Dipilih untuk perbandingan' : '+ Bandingkan ruang'}</button><a class="button-primary" href="#/">Kembali ke daftar</a></div></aside></div></section>`;
    $('#compare-this').addEventListener('click', () => { toggleCompare(room.id); $('#compare-this').textContent = compareIds.has(room.id) ? 'Dipilih untuk perbandingan' : '+ Bandingkan ruang'; });
  }

  function scenarioPage(index) {
    const scenario = scenarios[index];
    if (!scenario) { home(); return; }
    nav('');
    experiment.startScenario(scenario.id);
    experiment.log('skenario dibuka', scenario.title);
    const savedRecord = experiment.getScenarioRecord(scenario.id);
    const savedAnswer = savedRecord?.answer ? (rooms.find(room => room.id === savedRecord.answer)?.name || savedRecord.answer) : '';
    const answerOptions = scenario.answers === 'rooms' ? rooms.map(room => [room.id, room.name]) : scenario.answers.map(answer => [answer, answer]);
    app.innerHTML = `<section class="test-page"><div class="test-topline"><a class="back-link" href="#/">← <span>Kembali ke RuangKita</span></a><span class="test-tag">Sesi eksplorasi</span></div><div class="scenario-progress">${scenarios.map((_, i) => `<span class="progress-dot ${index === i ? 'current' : ''}" aria-hidden="true"></span>`).join('')}<span class="progress-label">Skenario ${index + 1} dari 3</span></div><article class="scenario-card"><span class="scenario-kicker">SKENARIO 0${index + 1}</span><h1>${scenario.title}</h1><div class="scenario-task">“${scenario.task}”</div><p class="scenario-hint">${scenario.hint}</p><a class="scenario-browse" href="${index === 1 ? '#/room/si-301' : '#/'}">${index === 1 ? 'Buka detail Ruang SI-301' : 'Jelajahi daftar ruangan'} <span aria-hidden="true">→</span></a>${savedRecord?.completedAt ? `<div class="completed-message"><span class="completed-icon">✓</span><div><strong>Skenario sudah selesai</strong><p>Jawaban tersimpan: ${savedAnswer}</p></div><button type="button" class="button-secondary" id="restart-scenario">Mulai ulang skenario</button></div>` : `<form id="scenario-response" class="scenario-response"><label for="scenario-answer">${scenario.answerPrompt}</label><div class="response-controls"><select id="scenario-answer" required><option value="">Pilih jawaban...</option>${answerOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select><button class="button-primary" type="submit">Selesaikan skenario</button></div><p class="response-note">Pilihanmu disimpan di browser ini untuk sesi pengujian.</p></form>`}</article><div class="scenario-navigation">${index > 0 ? `<a href="#/${scenarios[index - 1].id}" class="button-text">← Skenario sebelumnya</a>` : '<span></span>'}${index < scenarios.length - 1 ? `<a href="#/${scenarios[index + 1].id}" class="button-text">Lanjut ke skenario berikutnya →</a>` : '<a href="#/" class="button-text">Kembali ke daftar ruang →</a>'}</div></section>`;
    if (savedRecord?.completedAt) {
      $('#restart-scenario').addEventListener('click', () => { experiment.restart(scenario.id); scenarioPage(index); });
      return;
    }
    $('#scenario-response').addEventListener('submit', event => {
      event.preventDefault();
      const answer = $('#scenario-answer').value;
      if (!answer) return;
      if (!experiment.complete(scenario.id, answer)) { announce('Data belum dapat disimpan di browser ini.'); return; }
      announce('Jawaban tersimpan. Terima kasih.');
      $('#scenario-response').innerHTML = `<div class="completed-message"><span class="completed-icon">✓</span><div><strong>Skenario selesai</strong><p>Jawaban tersimpan untuk sesi pengujian ini.</p></div><button type="button" class="button-secondary" id="restart-scenario">Mulai ulang skenario</button></div>`;
      $('#restart-scenario').addEventListener('click', () => { experiment.restart(scenario.id); scenarioPage(index); });
    });
  }
  function moderator() {
    nav('');
    const runs = experiment.exportData().runs;
    app.innerHTML = `<section class="moderator-page"><div class="moderator-heading"><div><span class="eyebrow">RUANGKITA <span class="eyebrow-separator">/</span> FASILITATOR</span><h1>Panel moderator</h1><p class="hero-copy">Instruksi, kriteria observasi, dan catatan sesi tersimpan di browser ini.</p></div><a href="#/" class="button-secondary">Buka tampilan peserta</a></div>
      <div class="moderator-note"><strong>Catatan privasi</strong><span>Catatan sesi disimpan di localStorage browser dan tidak dikirim ke server. Ekspor data untuk membuat salinan sebelum mengganti perangkat atau menghapus data browser.</span></div>
      <section class="moderator-section"><div class="list-heading"><div><h2>Panduan skenario</h2><p>Instruksi lengkap untuk disampaikan kepada peserta.</p></div></div><div class="moderator-scenarios">${scenarios.map((scenario, index) => `<article class="moderator-scenario"><div class="scenario-kicker">SKENARIO 0${index + 1}</div><h3>${scenario.title}</h3><blockquote>${scenario.task}</blockquote><p><strong>Tujuan observasi</strong>${scenario.objective}</p><p><strong>Kriteria keberhasilan</strong></p><ul>${scenario.criteria.map(item => `<li>${item}</li>`).join('')}</ul><div class="moderator-actions"><a href="#/${scenario.id}" class="button-primary">Buka skenario</a><button class="button-secondary" data-restart="${scenario.id}" type="button">Mulai ulang</button></div></article>`).join('')}</div></section>
      <section class="moderator-section"><div class="list-heading"><div><h2>Data eksperimen</h2><p>${runs.length} sesi tersimpan di browser ini.</p></div><div class="moderator-actions"><button class="button-secondary" id="export-data" type="button">Ekspor JSON</button><button class="button-danger" id="reset-data" type="button">Reset data</button></div></div>${runs.length ? `<div class="session-list">${runs.slice().reverse().map(run => `<article class="session-card"><header><strong>${run.id}</strong><span>Dimulai ${new Date(run.startedAt).toLocaleString('id-ID')}</span></header>${scenarios.map((scenario, index) => { const record = run.scenarios[scenario.id]; return `<div class="session-row"><div><strong>Skenario ${index + 1}: ${scenario.title}</strong><span>${record?.completedAt ? `Selesai dalam ${experiment.formatDuration(record.startedAt, record.completedAt)}` : record ? 'Belum selesai' : 'Belum dimulai'}</span></div><div><span class="session-answer">${record?.answer ? (rooms.find(room => room.id === record.answer)?.name || record.answer) : 'Belum ada jawaban'}</span>${record?.events?.length ? `<details><summary>${record.events.length} catatan interaksi</summary><ol>${record.events.map(item => `<li><time>${new Date(item.at).toLocaleTimeString('id-ID')}</time> · ${item.type}: ${item.value}</li>`).join('')}</ol></details>` : ''}</div></div>`; }).join('')}</article>`).join('')}</div>` : '<div class="empty-state"><strong>Belum ada data sesi</strong>Sesi akan muncul di sini saat peserta mulai menjalankan skenario.</div>'}</section></section>`;
    document.querySelectorAll('[data-restart]').forEach(button => button.addEventListener('click', () => { experiment.restart(button.dataset.restart); location.hash = `/${button.dataset.restart}`; }));
    $('#reset-data').addEventListener('click', () => {
      if (!window.confirm('Hapus seluruh data eksperimen yang tersimpan di browser ini? Tindakan ini tidak dapat dibatalkan.')) return;
      experiment.resetAll(); moderator();
    });
    $('#export-data').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(experiment.exportData(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = 'ruangkita-data-eksperimen.json'; link.click(); URL.revokeObjectURL(url);
    });
  }

  function route() {
    const path = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    previousPath = currentPath;
    currentPath = path;
    experiment.log('halaman dibuka', path || 'beranda');
    if (!path) { home(); return; }
    if (path === 'compare') { comparison(); return; }
    if (path === 'moderator') { moderator(); return; }
    const scenarioPath = path.match(/^(?:test\/scenario-|scenario-?)(\d+)$/);
    if (scenarioPath) { scenarioPage(Number(scenarioPath[1]) - 1); return; }
    if (path === 'test') { scenarioPage(0); return; }
    const roomPath = path.match(/^room\/(.+)$/);
    if (roomPath) { detail(roomPath[1]); return; }
    home();
  }

  window.addEventListener('hashchange', route);
  route();
})();
