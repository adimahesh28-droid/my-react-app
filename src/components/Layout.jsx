import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const P = '#4B47B0'
const WH = '#FFFFFF'
const PS = '#ECEEFE'

const fredoka = { fontFamily: "'Fredoka One', cursive" }

export default function Layout({ children, session }) {
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  const username = session?.user?.email?.split('@')[0] || 'User'

  const navBtn = (path) => ({
    padding: '9px 20px',
    borderRadius: 9,
    cursor: 'pointer',
    border: 'none',
    background: location.pathname === path ? P : 'transparent',
    color: location.pathname === path ? WH : P,
    ...fredoka,
    fontSize: 16,
    letterSpacing: '.5px',
    boxShadow: location.pathname === path ? '3px 3px 0 #1A1560' : 'none',
    transition: 'all .15s',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7FF' }}>
      {/* Navbar */}
      <div style={{ background: WH, borderBottom: '3px solid #ECEEFE', padding: '0 2rem', boxShadow: '0 4px 0 #ECEEFE' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, height: 64 }}>
          <span style={{ ...fredoka, fontSize: 26, marginRight: 28, color: '#4B47B0',
            textShadow: '2px 2px 0 #1A1560, -1px -1px 0 #1A1560, 1px -1px 0 #1A1560, -1px 1px 0 #1A1560' }}>
            My Planner
          </span>

          <button onClick={() => navigate('/dashboard')} style={navBtn('/dashboard')}>Dashboard</button>
          <button onClick={() => navigate('/calendar')} style={navBtn('/calendar')}>Calendar</button>
          <button onClick={() => navigate('/habits')} style={navBtn('/habits')}>Habits</button>
          <button onClick={() => navigate('/gate-prep')} style={navBtn('/gate-prep')}>GATE Prep 🎯</button>
          <button onClick={() => navigate('/cat-prep')} style={navBtn('/cat-prep')}>CAT Prep 🎯</button>
          <button onClick={() => navigate('/dsa-prep')} style={navBtn('/dsa-prep')}>DSA Sheet 💻</button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* User + logout */}
          <span style={{ ...fredoka, fontSize: 15, color: '#8885CC', marginRight: 12 }}>
            Hey, {username}!
          </span>
          <button onClick={handleLogout} style={{
            padding: '8px 18px', borderRadius: 10, background: '#fee2e2', color: '#dc2626',
            border: '2px solid #fca5a5', cursor: 'pointer', ...fredoka, fontSize: 14,
            boxShadow: '2px 2px 0 #fca5a5',
          }}>
            Logout
          </button>
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        {children}
      </div>
    </div>
  )
}
