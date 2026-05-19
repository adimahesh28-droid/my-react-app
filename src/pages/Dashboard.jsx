import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Ring, Checkbox, TaskInput, card, yellowBubble, purpleBubble, fredoka, P, Y, AM, GS, G, BG, PS, WH } from '../components/ui'

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function computeStreak(tasksByDate) {
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const tasks = tasksByDate[key] || []
    if (tasks.length === 0) { if (i === 0) continue; break }
    if (!tasks.every(t => t.done)) { if (i > 0) break; continue }
    streak++
  }
  return streak
}

export default function Dashboard({ session }) {
  const userId = session.user.id
  const today  = todayStr()
  const now    = new Date()

  const [todayTasks,  setTodayTasks]  = useState([])
  const [habits,      setHabits]      = useState([])
  const [habitLogs,   setHabitLogs]   = useState({}) // habitId → bool
  const [tasksByDate, setTasksByDate] = useState({})
  const [loading,     setLoading]     = useState(true)

  // ── Load all data ─────────────────────────────────────
  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    await Promise.all([loadTasks(), loadHabits(), loadHabitLogs(), loadAllTasks()])
    setLoading(false)
  }

  async function loadTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('task_date', today)
      .order('created_at', { ascending: true })
    setTodayTasks(data || [])
  }

  async function loadAllTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('task_date, done')
      .eq('user_id', userId)
    const map = {}
    ;(data || []).forEach(t => {
      if (!map[t.task_date]) map[t.task_date] = []
      map[t.task_date].push(t)
    })
    setTasksByDate(map)
  }

  async function loadHabits() {
    const { data } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    setHabits(data || [])
  }

  async function loadHabitLogs() {
    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today)
    const map = {}
    ;(data || []).forEach(l => { map[l.habit_id] = l.done })
    setHabitLogs(map)
  }

  // ── Task actions ──────────────────────────────────────
  async function addTask(text) {
    const { data } = await supabase
      .from('tasks')
      .insert({ user_id: userId, task_date: today, text, done: false })
      .select().single()
    if (data) setTodayTasks(prev => [...prev, data])
  }

  async function toggleTask(id, currentDone) {
    await supabase.from('tasks').update({ done: !currentDone }).eq('id', id)
    setTodayTasks(prev => prev.map(t => t.id === id ? { ...t, done: !currentDone } : t))
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    setTodayTasks(prev => prev.filter(t => t.id !== id))
  }

  // ── Habit actions ─────────────────────────────────────
  async function toggleHabit(habitId) {
    const current = habitLogs[habitId]
    if (current === undefined) {
      // Insert new log
      await supabase.from('habit_logs').insert({ user_id: userId, habit_id: habitId, log_date: today, done: true })
      setHabitLogs(prev => ({ ...prev, [habitId]: true }))
    } else {
      // Toggle existing
      await supabase.from('habit_logs').update({ done: !current }).eq('user_id', userId).eq('habit_id', habitId).eq('log_date', today)
      setHabitLogs(prev => ({ ...prev, [habitId]: !current }))
    }
  }

  const done = todayTasks.filter(t => t.done).length
  const pct  = todayTasks.length ? (done / todayTasks.length) * 100 : 0
  const streak = computeStreak(tasksByDate)

  if (loading) return <div style={{ ...fredoka, fontSize: 20, color: P, padding: '3rem', textAlign: 'center' }}>Loading your day...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 14 }}>
        {/* Date */}
        <div style={{ background: `linear-gradient(135deg,#6B67D4,#4B47B0)`, borderRadius: 16, padding: '1.25rem 1.5rem', border: '3px solid #1A1560', boxShadow: '5px 5px 0 #1A1560' }}>
          <div style={{ ...fredoka, fontSize: 13, color: 'rgba(255,255,255,.75)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>{DAYS[now.getDay()]}</div>
          <div style={{ ...purpleBubble(54), lineHeight: 1 }}>{now.getDate()}</div>
          <div style={{ ...fredoka, fontSize: 16, color: 'rgba(255,255,255,.85)', marginTop: 8 }}>{MONTHS[now.getMonth()]} {now.getFullYear()}</div>
        </div>

        {/* Streak */}
        <div style={card}>
          <div style={{ ...fredoka, fontSize: 11, color: P, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Streak</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ ...fredoka, fontSize: 48, lineHeight: 1, color: streak > 0 ? Y : '#C5C3E8', textShadow: streak > 0 ? '3px 3px 0 #7A5A00' : 'none' }}>{streak}</span>
            <span style={{ ...fredoka, fontSize: 16, color: '#8885CC' }}>days</span>
          </div>
          <div style={{ marginTop: 8, fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 13, color: streak > 0 ? AM : '#B0AEDE' }}>
            {streak === 0 ? 'Start your streak!' : streak > 13 ? 'On fire! 🔥' : streak > 6 ? 'Great run!' : 'Keep going!'}
          </div>
        </div>

        {/* Progress ring */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Ring pct={pct} size={110} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...fredoka, fontSize: 22, lineHeight: 1, color: P }}>
              {done}<span style={{ fontSize: 15, color: '#8885CC' }}> / {todayTasks.length}</span>
            </div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 12, color: '#8885CC', marginTop: 4 }}>tasks done</div>
          </div>
        </div>
      </div>

      {/* Habits */}
      {habits.length > 0 && (
        <div style={card}>
          <div style={{ ...yellowBubble(20), marginBottom: 16 }}>Daily Habits</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {habits.map(h => {
              const checked = habitLogs[h.id]
              return (
                <button key={h.id} onClick={() => toggleHabit(h.id)} style={{
                  padding: '9px 20px', borderRadius: 24, cursor: 'pointer',
                  background: checked ? GS : BG, color: checked ? G : P,
                  border: `2px solid ${checked ? G : '#C5C3E8'}`,
                  ...fredoka, fontSize: 15, boxShadow: checked ? '2px 2px 0 #15803d' : '2px 2px 0 #C5C3E8',
                  transition: 'all .15s',
                }}>
                  {checked ? '✓ ' : ''}{h.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Tasks */}
      <div style={card}>
        <div style={{ ...yellowBubble(22), marginBottom: 16 }}>Today's Tasks</div>
        {todayTasks.length === 0 && <p style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 600, color: '#8885CC', fontSize: 15, margin: '0 0 16px' }}>Nothing yet — add your first task!</p>}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 18 }}>
          {todayTasks.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '2px dashed #ECEEFE' }}>
              <Checkbox done={t.done} onToggle={() => toggleTask(t.id, t.done)} />
              <span style={{ flex: 1, fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 16, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#B0AEDE' : '#2D2B6B', transition: 'all .15s' }}>{t.text}</span>
              <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B0AEDE', fontSize: 20, padding: '2px 8px', fontWeight: 700 }}>×</button>
            </div>
          ))}
        </div>
        <TaskInput onAdd={addTask} placeholder="Add a task for today…" />
      </div>
    </div>
  )
}
