import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Habits from './pages/Habits'
import GatePrep from './pages/GatePrep'
import CatPrep from './pages/CatPrep'
import GateMountain from './pages/GateMountain'
import Layout from './components/Layout'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Still checking auth
  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F7FF' }}>
        <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: '#4B47B0' }}>Loading...</span>
      </div>
    )
  }

  // Not logged in → always show Login
  if (!session) {
    return <Login onLogin={setSession} />
  }

  // Logged in → show app with nav
  return (
    <Layout session={session}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard session={session} />} />
        <Route path="/calendar" element={<Calendar session={session} />} />
        <Route path="/habits" element={<Habits session={session} />} />
        <Route path="/gate-prep" element={<GatePrep session={session} />} />
        <Route path="/cat-prep" element={<CatPrep session={session} />} />
        <Route path="/gate-mountain" element={<GateMountain session={session} />} />
        <Route path="/dsa-prep" element={<Navigate to="/gate-mountain" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}
