import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { TaskInput, card, yellowBubble, purpleBubble, fredoka, P, PS, G, BG, WH } from '../components/ui'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function getLastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

export default function Habits({ session }) {
  const userId   = session.user.id
  const today    = new Date().toISOString().split('T')[0]
  const last7    = getLastNDays(7)

  const [habits,    setHabits]    = useState([])
  const [logMap,    setLogMap]    = useState({}) // `${habitId}_${date}` → bool
  const [loading,   setLoading]   = useState(true)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [{ data: hData }, { data: lData }] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('habit_logs').select('*').eq('user_id', userId).gte('log_date', last7[0]),
    ])
    setHabits(hData || [])
    const map = {}
    ;(lData || []).forEach(l => { map[`${l.habit_id}_${l.log_date}`] = l.done })
    setLogMap(map)
    setLoading(false)
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
        const weekDone = last7.filter(date => logMap[`${h.id}_${date}`]).length
        return (
          <div key={h.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ ...purpleBubble(18), color: P, textShadow: 'none' }}>{h.name}</span>
                <span style={{ background: PS, color: P, borderRadius: 10, padding: '3px 10px', ...fredoka, fontSize: 13 }}>
                  {weekDone}/7 this week
                </span>
              </div>
              <button onClick={() => removeHabit(h.id)} style={{
                background: 'none', border: `2px solid #C5C3E8`, borderRadius: 8,
                cursor: 'pointer', color: '#8885CC', ...fredoka, fontSize: 13, padding: '5px 12px',
              }}>Remove</button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {last7.map(date => {
                const done    = logMap[`${h.id}_${date}`]
                const isToday = date === today
                const label   = DAYS[new Date(date).getDay()]
                return (
                  <div key={date} onClick={() => toggleHabit(h.id, date)} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ ...fredoka, fontSize: 11, color: isToday ? P : '#8885CC', fontWeight: isToday ? 'bold' : 'normal', marginBottom: 6 }}>{label}</div>
                    <div style={{
                      width: '100%', paddingTop: '100%', borderRadius: 10, position: 'relative',
                      background: done ? P : BG,
                      border: `2.5px solid ${done ? P : isToday ? P : '#C5C3E8'}`,
                      boxShadow: done ? '2px 2px 0 #1A1560' : '2px 2px 0 #C5C3E8',
                      transition: 'all .15s',
                    }}>
                      {done && (
                        <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} width="14" height="11" viewBox="0 0 14 11">
                          <path d="M1 5.5l4 4 8-8" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
