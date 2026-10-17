import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ReferenceLine,
} from 'recharts';
import { api, localDate } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import RecoveryGauge from '../components/RecoveryGauge.jsx';

const DAY = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [goals, setGoals] = useState({ weeklyGoal: user.weeklyGoal, sleepGoal: user.sleepGoal });
  const [saved, setSaved] = useState(false);

  const load = () => api(`/dashboard?today=${localDate()}`).then(setData).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const saveGoals = async (e) => {
    e.preventDefault();
    const d = await api('/auth/goals', { method: 'PUT', body: goals });
    setUser(d.user); setSaved(true); setTimeout(() => setSaved(false), 1500);
    load();
  };

  if (error) return <div className="error">{error}</div>;
  if (!data) return <div className="muted">Loading your dashboard…</div>;

  const { recovery, streak, weekly, volumeSeries, sleepSeries, attendance, nutritionToday, totals } = data;
  const empty = totals.workouts === 0;

  return (
    <>
      <header className="page-head">
        <h1>Hi, {user.name.split(' ')[0]}</h1>
        <p>{recovery.advice}</p>
      </header>

      <section className="hero panel">
        <RecoveryGauge recovery={recovery} />
      </section>

      <section className="stats">
        <div className="stat">
          <span className="stat-num">{streak}</span>
          <span className="stat-label">day streak</span>
        </div>
        <div className="stat wide">
          <div className="stat-top">
            <span className="stat-num">{weekly.done}<small>/{weekly.goal}</small></span>
            <span className="stat-label">workouts this week</span>
          </div>
          <div className="week">
            {weekly.days.map((d, i) => (
              <span key={d.date} className={`pip ${d.trained ? 'on' : ''} ${d.date === data.today ? 'today' : ''}`} title={d.date}>{DAY[i]}</span>
            ))}
          </div>
        </div>
        <div className="stat">
          <span className="stat-num">{totals.volume30.toLocaleString()}</span>
          <span className="stat-label">kg lifted, 30 days</span>
        </div>
        <div className="stat">
          <span className="stat-num">{nutritionToday.calories}</span>
          <span className="stat-label">kcal today · {nutritionToday.protein} g protein</span>
        </div>
      </section>

      {empty && <div className="notice">No workouts yet. Log your first session on the Workouts page and your charts will fill in.</div>}

      <section className="grid2">
        <div className="panel">
          <h2>Training volume</h2>
          <p className="muted">Sets × reps × weight (kg), last 14 days</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={volumeSeries} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={1} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="volume" name="Volume (kg)" fill="var(--accent)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h2>Sleep</h2>
          <p className="muted">Hours per night, last 14 days</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={sleepSeries} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={1} />
              <YAxis domain={[0, 12]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <ReferenceLine y={user.sleepGoal} stroke="var(--good)" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="hours" name="Hours" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid2">
        <div className="panel">
          <h2>Attendance</h2>
          <p className="muted">Last 28 days, newest at the bottom right</p>
          <div className="heat">
            {attendance.map((d) => (
              <span key={d.date} className={d.trained ? 'on' : ''} title={`${d.date}${d.trained ? ' · trained' : ''}`} />
            ))}
          </div>
        </div>

        <form className="panel" onSubmit={saveGoals}>
          <h2>Goals</h2>
          <div className="row">
            <label>Workouts per week
              <input type="number" min="1" max="7" value={goals.weeklyGoal} onChange={(e) => setGoals({ ...goals, weeklyGoal: e.target.value })} />
            </label>
            <label>Sleep goal (hours)
              <input type="number" min="4" max="12" step="0.5" value={goals.sleepGoal} onChange={(e) => setGoals({ ...goals, sleepGoal: e.target.value })} />
            </label>
          </div>
          <button className="btn">{saved ? 'Saved' : 'Save goals'}</button>
        </form>
      </section>
    </>
  );
}
