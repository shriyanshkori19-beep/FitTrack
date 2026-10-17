const COLORS = { Ready: 'var(--good)', Moderate: 'var(--warn)', Rest: 'var(--bad)' };

export default function RecoveryGauge({ recovery }) {
  const { score, status, breakdown } = recovery;
  const r = 78;
  const circ = 2 * Math.PI * r;
  const color = COLORS[status];
  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 200 200" className="gauge" role="img" aria-label={`Recovery score ${score} out of 100, ${status}`}>
        <circle cx="100" cy="100" r={r} fill="none" stroke="var(--line)" strokeWidth="14" />
        <circle
          cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * circ} ${circ}`} transform="rotate(-90 100 100)"
        />
        <text x="100" y="108" textAnchor="middle" className="gauge-num" fill="var(--ink)">{score}</text>
        <text x="100" y="134" textAnchor="middle" className="gauge-sub" fill={color}>{status}</text>
      </svg>
      <div className="breakdown">
        <Bar label="Sleep" value={breakdown.sleep} max={50} note={breakdown.sleepHours === null ? 'not logged' : `${breakdown.sleepHours} h`} />
        <Bar label="Rest days" value={breakdown.rest} max={20} note={`${breakdown.restDays} of last 3`} />
        <Bar label="Recent load" value={breakdown.load} max={30} note={`avg intensity ${breakdown.avgIntensity}`} />
      </div>
    </div>
  );
}

function Bar({ label, value, max, note }) {
  return (
    <div className="bar-row">
      <div className="bar-head"><span>{label}</span><small>{note}</small></div>
      <div className="bar-track"><div className="bar-fill" style={{ width: `${(value / max) * 100}%` }} /></div>
    </div>
  );
}
