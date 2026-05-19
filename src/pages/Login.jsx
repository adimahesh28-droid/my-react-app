import { useState } from 'react'
import { supabase } from '../lib/supabase'

const P = '#4B47B0'
const fredoka = { fontFamily: "'Fredoka One', cursive" }

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Account created! Check your email to confirm, then log in.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F8F7FF',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '2.5rem 2rem',
        border: '2px solid #ECEEFE', boxShadow: '6px 6px 0 #ECEEFE',
        width: '100%', maxWidth: 400,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            ...fredoka, fontSize: 36, color: '#fff',
            background: P, borderRadius: 20, display: 'inline-block',
            padding: '10px 28px', border: '3px solid #1A1560',
            boxShadow: '4px 4px 0 #1A1560',
            textShadow: '2px 2px 0 #1A1560',
          }}>
            My Planner
          </div>
          <p style={{ marginTop: 14, color: '#8885CC', ...fredoka, fontSize: 16 }}>
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ ...fredoka, fontSize: 14, color: P, marginBottom: 6, display: 'block' }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 15,
                border: '2.5px solid #ECEEFE', background: '#F8F7FF', color: '#2D2B6B',
                outline: 'none', fontFamily: "'Nunito', sans-serif", fontWeight: 600,
              }}
            />
          </div>

          <div>
            <label style={{ ...fredoka, fontSize: 14, color: P, marginBottom: 6, display: 'block' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 15,
                border: '2.5px solid #ECEEFE', background: '#F8F7FF', color: '#2D2B6B',
                outline: 'none', fontFamily: "'Nunito', sans-serif", fontWeight: 600,
              }}
            />
          </div>

          {error && (
            <div style={{ background: '#fee2e2', border: '2px solid #fca5a5', borderRadius: 10,
              padding: '10px 14px', color: '#dc2626', fontSize: 14, fontWeight: 700 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: '#dcfce7', border: '2px solid #86efac', borderRadius: 10,
              padding: '10px 14px', color: '#16a34a', fontSize: 14, fontWeight: 700 }}>
              {success}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', borderRadius: 14,
            background: loading ? '#8885CC' : P, color: '#fff',
            border: '2.5px solid #1A1560', cursor: loading ? 'not-allowed' : 'pointer',
            ...fredoka, fontSize: 18, letterSpacing: '.5px',
            boxShadow: '4px 4px 0 #1A1560', marginTop: 4,
          }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ color: '#8885CC', fontSize: 14, fontWeight: 700 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
            style={{ background: 'none', border: 'none', color: P, cursor: 'pointer', ...fredoka, fontSize: 15 }}>
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  )
}
