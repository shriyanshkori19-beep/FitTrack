import { useEffect, useState } from 'react';
import { api, localDate, fmtDate } from '../api.js';

export default function Sleep() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ date: localDate(), hours: '', quality: 3 });
  const [error, setError] = useState('');

  const load = () => api('/sleep').then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try { await api('/sleep', { method: 'POST', body: form }); setForm({ ...form, hours: '' }); load(); }
    catch (err) { setError(err.message); }
  };
  const remove = async (id) => { await api(`/sleep/${id}`, { method: 'DELETE' }); load(); };

  return (
    <>
      <header className="page-head"><h1>Sleep</h1><p>Log the morning you woke up. Logging the same date again updates it.</p></header>
      <form className="panel" onSubmit={submit}>
        <div className="row">
          <label>Date<input type="date" value={form.date} max={localDate()} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
          <label>Hours slept<input type="number" min="0" max="24" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} required /></label>
          <label>Quality: {form.quality}/5
            <input type="range" min="1" max="5" value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })} />
          </label>
        </div>
        <button className="btn">Save sleep</button>
        {error && <div className="error" role="alert">{error}</div>}
      </form>

      <h2 className="section-title">History</h2>
      {list.length === 0 && <div className="notice">No sleep logged yet. Enter last night's hours above.</div>}
      <div className="log">
        {list.map((s) => (
          <div key={s._id} className="log-item flat">
            <span className="log-date">{fmtDate(s.date)}</span>
            <span className="log-title">{s.hours} h</span>
            <span className="log-meta">Quality {s.quality}/5</span>
            <button className="link danger" onClick={() => remove(s._id)}>Delete</button>
          </div>
        ))}
      </div>
    </>
  );
}
