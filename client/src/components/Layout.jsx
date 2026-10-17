import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/workouts', label: 'Workouts' },
  { to: '/sleep', label: 'Sleep' },
  { to: '/nutrition', label: 'Nutrition' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">Fit<span>Track</span></div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="who">
          <div>{user.name}</div>
          <button className="link" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
