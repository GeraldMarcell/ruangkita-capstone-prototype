(() => {
  const KEY = 'ruangkita-q204-experiment-v1';
  const scenarios = () => window.RuangKita.scenarios;
  let activeScenarioId = '';
  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || { runs: [] }; }
    catch { return { runs: [] }; }
  };
  const write = data => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch { return false; }
  };
  const makeRun = data => {
    const run = { id: `Sesi-${Date.now().toString(36).toUpperCase()}`, startedAt: new Date().toISOString(), scenarios: {} };
    data.runs.push(run);
    return run;
  };
  const latest = data => data.runs[data.runs.length - 1];

  function startScenario(id) {
    activeScenarioId = id;
    const data = read();
    let run = latest(data);
    const first = scenarios()[0].id;
    if (!run || (id === first && run.scenarios[id]?.completedAt)) run = makeRun(data);
    if (!run.scenarios[id]) run.scenarios[id] = { startedAt: new Date().toISOString(), completedAt: null, answer: '', events: [] };
    write(data);
  }

  function log(type, value = '') {
    const data = read();
    const run = latest(data);
    if (!run) return;
    const current = run.scenarios[activeScenarioId] && !run.scenarios[activeScenarioId].completedAt ? activeScenarioId : '';
    if (!current) return;
    run.scenarios[current].events.push({ at: new Date().toISOString(), type, value: String(value).slice(0, 140) });
    write(data);
  }

  function complete(id, answer) {
    const data = read();
    const run = latest(data);
    if (!run || !run.scenarios[id]) return false;
    const record = run.scenarios[id];
    if (!record.completedAt) record.completedAt = new Date().toISOString();
    record.answer = answer;
    record.events.push({ at: record.completedAt, type: 'jawaban-dikirim', value: answer });
    activeScenarioId = '';
    return write(data);
  }

  function restart(id) {
    activeScenarioId = id;
    const data = read();
    let run = latest(data);
    if (!run) run = makeRun(data);
    run.scenarios[id] = { startedAt: new Date().toISOString(), completedAt: null, answer: '', events: [] };
    write(data);
  }

  function resetAll() { localStorage.removeItem(KEY); }
  function exportData() { return read(); }
  function getScenarioRecord(id) { return latest(read())?.scenarios?.[id] || null; }
  function getActiveScenarioId() { return activeScenarioId; }

  function formatDuration(start, end) {
    if (!start || !end) return 'Belum selesai';
    const seconds = Math.max(0, Math.round((new Date(end) - new Date(start)) / 1000));
    return `${Math.floor(seconds / 60)} m ${seconds % 60} d`; 
  }

  window.RuangKita = window.RuangKita || {};
  window.RuangKita.experiment = { startScenario, log, complete, restart, resetAll, exportData, getScenarioRecord, getActiveScenarioId, formatDuration, storageKey: KEY };
})();
