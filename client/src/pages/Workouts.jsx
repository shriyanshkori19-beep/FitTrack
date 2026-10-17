import { useEffect, useMemo, useState } from 'react';
import { api, localDate, fmtDate } from '../api.js';

const newExercise = () => ({ name: '', sets: [{ reps: '', weight: '' }] });

export default function Workouts() {
  const [list, setList] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ date: localDate(), title: '', intensity: 6, duration: '' });
  const [exercises, setExercises] = useState([newExercise()]);

  const load = () => api('/workouts').then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const volume = useMemo(
    () => exercises.reduce((t, ex) => t + ex.sets.reduce((s, x) => s + (Number(x.reps) || 0) * (Number(x.weight) || 0), 0), 0),
    [exercises]
  );

  const updateEx = (i, patch) => setExercises(exercises.map((ex, idx) => (idx === i ? { ...ex, ...patch } : ex)));
  const updateSet = (i, j, patch) =>
    updateEx(i, { sets: exercises[i].sets.map((s, idx) => (idx === j ? { ...s, ...patch } : s)) });
  const addSet = (i) => {
    const last = exercises[i].sets.at(-1) || { reps: '', weight: '' };
    updateEx(i, { sets: [...exercises[i].sets, { ...last }] });
  };
  const removeSet = (i, j) => updateEx(i, { sets: exercises[i].sets.filter((_, idx) => idx !== j) });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/workouts', { method: 'POST', body: { ...form, exercises } });
      setForm({ ...form, title: '', duration: '' });
      setExercises([newExercise()]);
      load();
    } catch (err) { setError(err.message); }
  };

  const remove = async (id) => { await api(`/workouts/${id}`, { method: 'DELETE' }); load(); };

  return (
    <>
      <header className="page-head"><h1>Workouts</h1><p>Volume is calculated for you from sets × reps × weight.</p></header>

      <form className="panel" onSubmit={submit}>
        <div className="row">
          <label>Date<input type="date" value={form.date} max={localDate()} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
          <label>Session name<input value={form.title} placeholder="Push day" onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label>Duration (min)<input type="number" min="0" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></label>
          <label>Intensity: {form.intensity}/10
            <input type="range" min="1" max="10" value={form.intensity} onChange={(e) => setForm({ ...form, intensity: e.target.value })} />
          </label>
        </div>

        {exercises.map((ex, i) => (
          <fieldset key={i} className="exercise">
            <div className="ex-head">
              <input placeholder="Exercise (e.g. Bench press)" value={ex.name} onChange={(e) => updateEx(i, { name: e.target.value })} />
              {exercises.length > 1 && <button type="button" className="link danger" onClick={() => setExercises(exercises.filter((_, idx) => idx !== i))}>Remove exercise</button>}
            </div>
            {ex.sets.map((s, j) => (
              <div className="set" key={j}>
                <span className="set-n">Set {j + 1}</span>
                <input type="number" min="0" placeholder="Reps" value={s.reps} onChange={(e) => updateSet(i, j, { reps: e.target.value })} aria-label="Reps" />
                <span>×</span>
                <input type="number" min="0" step="0.5" placeholder="kg" value={s.weight} onChange={(e) => updateSet(i, j, { weight: e.target.value })} aria-label="Weight in kg" />
                {ex.sets.length > 1 && <button type="button" className="link danger" onClick={() => removeSet(i, j)}>Remove</button>}
              </div>
            ))}
            <button type="button" className="link" onClick={() => addSet(i)}>Add set</button>
          </fieldset>
        ))}

        <div className="form-foot">
          <button type="button" className="btn ghost" onClick={() => setExercises([...exercises, newExercise()])}>Add exercise</button>
          <span className="vol">Total volume <strong>{volume.toLocaleString()} kg</strong></span>
          <button className="btn">Save workout</button>
        </div>
        {error && <div className="error" role="alert">{error}</div>}
      </form>

      <h2 className="section-title">History</h2>
      {list.length === 0 && <div className="notice">No workouts logged yet. Add your first session above.</div>}
      <div className="log">
        {list.map((w) => (
          <details key={w._id} className="log-item">
            <summary>
              <span className="log-date">{fmtDate(w.date)}</span>
              <span className="log-title">{w.title}</span>
              <span className="log-meta">{w.totalVolume.toLocaleString()} kg · RPE {w.intensity}{w.duration ? ` · ${w.duration} min` : ''}</span>
            </summary>
            <div className="log-body">
              {w.exercises.map((ex, i) => (
                <div key={i}><strong>{ex.name}</strong>: {ex.sets.map((s) => `${s.reps}×${s.weight}kg`).join(', ')}</div>
              ))}
              <button className="link danger" onClick={() => remove(w._id)}>Delete workout</button>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
