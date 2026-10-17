import { useEffect, useState } from 'react';
import { api, localDate } from '../api.js';

const blank = { meal: '', calories: '', protein: '', carbs: '', fat: '' };

export default function Nutrition() {
  const [date, setDate] = useState(localDate());
  const [list, setList] = useState([]);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');

  const load = () => api(`/nutrition?date=${date}`).then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [date]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try { await api('/nutrition', { method: 'POST', body: { ...form, date } }); setForm(blank); load(); }
    catch (err) { setError(err.message); }
  };
  const remove = async (id) => { await api(`/nutrition/${id}`, { method: 'DELETE' }); load(); };

  const total = list.reduce(
    (t, m) => ({ calories: t.calories + m.calories, protein: t.protein + m.protein, carbs: t.carbs + m.carbs, fat: t.fat + m.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <>
      <header className="page-head"><h1>Nutrition</h1><p>Add meals for a day and see the running totals.</p></header>

      <div className="panel">
        <label className="inline">Day<input type="date" value={date} max={localDate()} onChange={(e) => setDate(e.target.value)} /></label>
        <div className="macros">
          <div><strong>{total.calories}</strong><span>kcal</span></div>
          <div><strong>{total.protein} g</strong><span>protein</span></div>
          <div><strong>{total.carbs} g</strong><span>carbs</span></div>
          <div><strong>{total.fat} g</strong><span>fat</span></div>
        </div>
      </div>

      <form className="panel" onSubmit={submit}>
        <div className="row">
          <label>Meal<input value={form.meal} placeholder="Oats and eggs" onChange={set('meal')} required /></label>
          <label>Calories<input type="number" min="0" value={form.calories} onChange={set('calories')} required /></label>
          <label>Protein (g)<input type="number" min="0" value={form.protein} onChange={set('protein')} /></label>
          <label>Carbs (g)<input type="number" min="0" value={form.carbs} onChange={set('carbs')} /></label>
          <label>Fat (g)<input type="number" min="0" value={form.fat} onChange={set('fat')} /></label>
        </div>
        <button className="btn">Add meal</button>
        {error && <div className="error" role="alert">{error}</div>}
      </form>

      {list.length === 0 && <div className="notice">No meals logged for this day. Add one above.</div>}
      <div className="log">
        {list.map((m) => (
          <div key={m._id} className="log-item flat">
            <span className="log-title">{m.meal}</span>
            <span className="log-meta">{m.calories} kcal · P {m.protein} · C {m.carbs} · F {m.fat}</span>
            <button className="link danger" onClick={() => remove(m._id)}>Delete</button>
          </div>
        ))}
      </div>
    </>
  );
}
