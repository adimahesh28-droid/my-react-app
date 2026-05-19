import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Checkbox, TaskInput, card, yellowBubble, purpleBubble, fredoka, P, PS, G, Y, WH } from '../components/ui'

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function toDateStr(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

export default function Calendar({ session }) {
  const userId = session.user.id
  const todayStr = new Date().toISOString().split('T')[0]

  const [calMonth,     setCalMonth]     = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })
  const [selectedDay,  setSelectedDay]  = useState(null)
  const [taskMap,      setTaskMap]      = useState({}) // date → tasks[]
  const [loading,      setLoading]      = useState(true)

  useEffect(() => { loadMonthTasks() }, [calMonth])

  async function loadMonthTasks() {
    setLoading(true)
    const from = toDateStr(calMonth.y, calMonth.m, 1)
    const lastDay = new Date(calMonth.y, calMonth.m + 1, 0).getDate()
    const to   = toDateStr(calMonth.y, calMonth.m, lastDay)

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('task_date', from)
      .lte('task_date', to)
      .order('created_at', { ascending: true })

    const map = {}
    ;(data || []).forEach(t => {
      if (!map[t.task_date]) map[t.task_date] = []
      map[t.task_date].push(t)
    })
    setTaskMap(map)
    setLoading(false)
  }

  const selKey   = selectedDay ? toDateStr(calMonth.y, calMonth.m, selectedDay) : null
  const selTasks = selKey ? (taskMap[selKey] || []) : []

  async function addTask(text) {
    if (!selKey) return
    const { data } = await supabase
      .from('tasks')
      .insert({ user_id: userId, task_date: selKey, text, done: false })
      .select().single()
    if (data) setTaskMap(prev => ({ ...prev, [selKey]: [...(prev[selKey] || []), data] }))
  }

  async function toggleTask(id, currentDone) {
    await supabase.from('tasks').update({ done: !currentDone }).eq('id', id)
    setTaskMap(prev => ({
      ...prev,
      [selKey]: prev[selKey].map(t => t.id === id ? { ...t, done: !currentDone } : t)
    }))
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    setTaskMap(prev => ({ ...prev, [selKey]: prev[selKey].filter(t => t.id !== id) }))
  }

  const firstDay    = new Date(calMonth.y, calMonth.m, 1).getDay()
  const daysInMonth = new Date(calMonth.y, calMonth.m + 1, 0).getDate()
  const cells       = Array.from({ length: 42 }, (_, i) => { const d = i - firstDay + 1; return d >= 1 && d <= daysInMonth ? d : null })

  const navBtn = {
    background: 'none', border: `0.5px solid ${PS}`, borderRadius: 8,
    padding: '7px 16px', cursor: 'pointer', fontSize: 16, color: '#2D2B6B',
    ...fredoka,
  }

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Calendar grid */}
      <div style={{ flex: '0 0 380px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button style={navBtn} onClick={() => setCalMonth(p => { const d = new Date(p.y, p.m - 1); return { y: d.getFullYear(), m: d.getMonth() } })}>‹</button>
          <span style={{ ...fredoka, fontSize: 18, color: P }}>{MONTHS[calMonth.m]} {calMonth.y}</span>
          <button style={navBtn} onClick={() => setCalMonth(p => { const d = new Date(p.y, p.m + 1); return { y: d.getFullYear(), m: d.getMonth() } })}>›</button>
        </div>

        <div style={card}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 12 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: 'center', ...fredoka, fontSize: 13, color: '#6B67D4', padding: '4px 0' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const key = toDateStr(calMonth.y, calMonth.m, day)
              const isToday = key === todayStr
              const isSel   = day === selectedDay
              const tasks   = taskMap[key] || []
              const allDone = tasks.length > 0 && tasks.every(t => t.done)
              return (
                <div key={i} onClick={() => setSelectedDay(day === selectedDay ? null : day)} style={{
                  textAlign: 'center', padding: '9px 2px', borderRadius: 12, cursor: 'pointer',
                  background: isSel ? P : isToday ? PS : 'transparent',
                  border: isToday && !isSel ? `2px solid ${P}` : '2px solid transparent',
                  transition: 'all .1s',
                }}>
                  <span style={{ ...fredoka, fontSize: 15, color: isSel ? WH : isToday ? P : '#2D2B6B' }}>{day}</span>
                  {tasks.length > 0 && <div style={{ width: 6, height: 6, borderRadius: '50%', margin: '3px auto 0', background: isSel ? 'rgba(255,255,255,.8)' : allDone ? G : Y, border: allDone ? 'none' : '1px solid #C49A10' }} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Day panel */}
      <div style={{ flex: 1 }}>
        {!selectedDay ? (
          <div style={{ ...card, textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ ...fredoka, fontSize: 18, color: '#B0AEDE' }}>← Pick a day to view tasks</div>
          </div>
        ) : (
          <div style={card}>
            <div style={{ ...purpleBubble(18), color: P, textShadow: 'none', marginBottom: 16 }}>
              {DAYS[new Date(calMonth.y, calMonth.m, selectedDay).getDay()]}, {selectedDay} {MONTHS[calMonth.m]} {calMonth.y}
            </div>
            {selTasks.length === 0 && <p style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 600, color: '#8885CC', fontSize: 15, margin: '0 0 16px' }}>No tasks for this day yet!</p>}
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 18 }}>
              {selTasks.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: '2px dashed #ECEEFE' }}>
                  <Checkbox done={t.done} onToggle={() => toggleTask(t.id, t.done)} />
                  <span style={{ flex: 1, fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 15, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#B0AEDE' : '#2D2B6B' }}>{t.text}</span>
                  <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B0AEDE', fontSize: 20, fontWeight: 700 }}>×</button>
                </div>
              ))}
            </div>
            <TaskInput onAdd={addTask} placeholder="Add a task for this day…" />
          </div>
        )}
      </div>
    </div>
  )
}
