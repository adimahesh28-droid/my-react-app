import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { TaskInput, card, yellowBubble, purpleBubble, fredoka, P, G } from '../components/ui'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getLastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

function getMonthDays(year, month) {
  // month: 0-11
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1)
    return d.toISOString().split('T')[0]
  })
}

export default function Habits({ session }) {
  const userId   = session.user.id
  const today    = new Date().toISOString().split('T')[0]
  const last7    = getLastNDays(7)

  const now = new Date()
  const [viewYear,  setViewYear]  = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-11
  const monthDays = getMonthDays(viewYear, viewMonth)

  const [habits,    setHabits]    = useState([])
  const [logMap,    setLogMap]    = useState({}) // `${habitId}_${date}` → bool
  const [loading,   setLoading]   = useState(true)

  useEffect(() => { loadAll() }, [])
  useEffect(() => { loadMonthLogs() }, [viewYear, viewMonth])

  async function loadAll() {
    setLoading(true)
    const [{ data: hData }, { data: lData }] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('habit_logs').select('*').eq('user_id', userId).gte('log_date', last7[0]),
    ])
    setHabits(hData || [])
    const map = {}
    ;(lData || []).forEach(l => { map[`${l.habit_id}_${l.log_date}`] = l.done })
    setLogMap(prev => ({ ...prev, ...map }))
    setLoading(false)
  }

  async function loadMonthLogs() {
    const start = monthDays[0]
    const end   = monthDays[monthDays.length - 1]
    const { data: lData } = await supabase
      .from('habit_logs').select('*').eq('user_id', userId)
      .gte('log_date', start).lte('log_date', end)
    const map = {}
    ;(lData || []).forEach(l => { map[`${l.habit_id}_${l.log_date}`] = l.done })
    setLogMap(prev => ({ ...prev, ...map }))
  }

  async function addHabit(name) {
    const { data } = await supabase.from('habits').insert({ user_id: userId, name }).select().single()
    if (data) setHabits(prev => [...prev, data])
  }

  async function removeHabit(id) {
    await supabase.from('habits').delete().eq('id', id)
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  async function toggleHabit(habitId, date) {
    const key     = `${habitId}_${date}`
    const current = logMap[key]

    if (current === undefined) {
      const { data } = await supabase.from('habit_logs').insert({ user_id: userId, habit_id: habitId, log_date: date, done: true }).select().single()
      if (data) setLogMap(prev => ({ ...prev, [key]: true }))
    } else {
      await supabase.from('habit_logs').update({ done: !current }).eq('user_id', userId).eq('habit_id', habitId).eq('log_date', date)
      setLogMap(prev => ({ ...prev, [key]: !current }))
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  if (loading) return <div style={{ ...fredoka, fontSize: 20, color: P, padding: '3rem', textAlign: 'center' }}>Loading habits...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={card}>
        <div style={{ ...yellowBubble(20), marginBottom: 16 }}>Add New Habit</div>
        <TaskInput onAdd={addHabit} placeholder="e.g. Morning run, Read 20 pages, Meditate…" />
      </div>

      {habits.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ ...fredoka, fontSize: 18, color: '#B0AEDE' }}>Add a habit above to start tracking!</p>
        </div>
      )}

      {habits.map(h => {
        return (
          <div key={h.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ ...purpleBubble(18), color: P, textShadow: 'none' }}>{h.name}</span>
              </div>
              <button onClick={() => removeHabit(h.id)} style={{
                background: 'none', border: `2px solid #C5C3E8`, borderRadius: 8,
                cursor: 'pointer', color: '#8885CC', ...fredoka, fontSize: 13, padding: '5px 12px',
              }}>Remove</button>
            </div>

            {/* Monthly heatmap */}
            <div style={{ paddingTop: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ ...fredoka, fontSize: 13, color: '#8885CC' }}>{MONTHS[viewMonth]} {viewYear}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={prevMonth} style={{
                    background: 'none', border: `2px solid #C5C3E8`, borderRadius: 6,
                    cursor: 'pointer', color: '#8885CC', ...fredoka, fontSize: 12, padding: '2px 8px',
                  }}>‹</button>
                  <button onClick={nextMonth} style={{
                    background: 'none', border: `2px solid #C5C3E8`, borderRadius: 6,
                    cursor: 'pointer', color: '#8885CC', ...fredoka, fontSize: 12, padding: '2px 8px',
                  }}>›</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, maxWidth: 280 }}>
                {Array.from({ length: new Date(viewYear, viewMonth, 1).getDay() }).map((_, i) => (
                  <div key={`pad_${i}`} />
                ))}
                {monthDays.map(date => {
                  const done    = logMap[`${h.id}_${date}`]
                  const isToday = date === today
                  const dayNum  = new Date(date).getDate()
                  return (
                    <div
                      key={date}
                      onClick={() => toggleHabit(h.id, date)}
                      title={date}
                      style={{
                        width: '100%', paddingTop: '100%', borderRadius: 5, position: 'relative', cursor: 'pointer',
                        background: done ? G : '#ECEEFE',
                        border: isToday ? `2px solid ${P}` : '2px solid transparent',
                        boxSizing: 'border-box',
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 1, left: 2, fontSize: 8,
                        ...fredoka, color: done ? '#fff' : '#B0AEDE',
                      }}>{dayNum}</span>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}
