// ── Palette ───────────────────────────────────────────────
export const P  = '#4B47B0'
export const PL = '#6B67D4'
export const PS = '#ECEEFE'
export const Y  = '#F5C842'
export const G  = '#22c55e'
export const GS = '#dcfce7'
export const AM = '#f59e0b'
export const BG = '#F8F7FF'
export const WH = '#FFFFFF'

export const fredoka = { fontFamily: "'Fredoka One', cursive" }

export const purpleBubble = (size = 22) => ({
  ...fredoka,
  fontSize: size,
  color: '#fff',
  textShadow: '2px 2px 0 #1A1560, -1px -1px 0 #1A1560, 1px -1px 0 #1A1560, -1px 1px 0 #1A1560',
  letterSpacing: '0.5px',
})

export const yellowBubble = (size = 22) => ({
  ...fredoka,
  fontSize: size,
  color: Y,
  textShadow: '2px 2px 0 #7A5A00, -1px -1px 0 #7A5A00, 1px -1px 0 #7A5A00, -1px 1px 0 #7A5A00',
})

export const card = {
  background: WH,
  borderRadius: 20,
  border: `2px solid ${PS}`,
  padding: '1.4rem 1.6rem',
  boxShadow: `4px 4px 0 ${PS}`,
}

// ── Mood Ring ─────────────────────────────────────────────
export function Ring({ pct, size = 110, stroke = 9 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const cx = size / 2, cy = size / 2
  const totalH = size + 24

  const mood = pct === 100 ? 'happy' : pct >= 50 ? 'meh' : 'sad'
  const faceColor = mood === 'happy' ? '#22c55e' : mood === 'meh' ? '#f59e0b' : '#ef4444'
  const ringColor = mood === 'happy' ? '#22c55e' : mood === 'meh' ? '#f59e0b' : '#ef4444'
  const ringBg    = mood === 'happy' ? '#dcfce7' : mood === 'meh' ? '#fef3c7' : '#fee2e2'

  const fr = 26
  const eyeY = cy - 7, eyeOff = 9, eyeR = 3
  const mouthY = cy + 10, mouthW = 14
  let mouthPath
  if (mood === 'happy') mouthPath = `M ${cx-mouthW} ${mouthY} Q ${cx} ${mouthY+12} ${cx+mouthW} ${mouthY}`
  else if (mood === 'meh') mouthPath = `M ${cx-mouthW} ${mouthY+3} L ${cx+mouthW} ${mouthY+3}`
  else mouthPath = `M ${cx-mouthW} ${mouthY+8} Q ${cx} ${mouthY-2} ${cx+mouthW} ${mouthY+8}`

  return (
    <svg width={size} height={totalH} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.08))' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={ringBg} strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={ringColor} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dasharray .6s ease, stroke .4s ease' }} />
      <circle cx={cx} cy={cy} r={fr} fill={ringBg} style={{ transition: 'fill .4s ease' }} />
      <circle cx={cx-eyeOff} cy={eyeY} r={eyeR} fill={faceColor} />
      <circle cx={cx+eyeOff} cy={eyeY} r={eyeR} fill={faceColor} />
      {mood === 'sad' && <>
        <path d={`M ${cx-eyeOff-5} ${eyeY-8} Q ${cx-eyeOff} ${eyeY-12} ${cx-eyeOff+5} ${eyeY-8}`} stroke={faceColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d={`M ${cx+eyeOff-5} ${eyeY-8} Q ${cx+eyeOff} ${eyeY-12} ${cx+eyeOff+5} ${eyeY-8}`} stroke={faceColor} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>}
      {mood === 'happy' && <>
        <circle cx={cx-eyeOff} cy={eyeY} r={eyeR+1.5} fill="none" stroke={faceColor} strokeWidth="1.5" opacity=".5" />
        <circle cx={cx+eyeOff} cy={eyeY} r={eyeR+1.5} fill="none" stroke={faceColor} strokeWidth="1.5" opacity=".5" />
      </>}
      <path d={mouthPath} stroke={faceColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <text x={cx} y={size+16} textAnchor="middle" fontSize="14" fontWeight="700" fill={ringColor}
        style={{ fontFamily: "'Fredoka One',cursive", transition: 'fill .4s' }}>{Math.round(pct)}%</text>
    </svg>
  )
}

// ── Checkbox ──────────────────────────────────────────────
export function Checkbox({ done, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      width: 24, height: 24, borderRadius: 8, flexShrink: 0, cursor: 'pointer',
      border: `3px solid ${done ? P : '#C5C3E8'}`,
      background: done ? P : WH,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all .15s', boxShadow: done ? '2px 2px 0 #1A1560' : '2px 2px 0 #C5C3E8',
    }}>
      {done && <svg width="12" height="10" viewBox="0 0 12 10"><path d="M1 5l3.5 3.5 6.5-7" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </div>
  )
}

// ── Task Input ────────────────────────────────────────────
export function TaskInput({ onAdd, placeholder }) {
  const [val, setVal] = useState('')
  function submit() {
    if (!val.trim()) return
    onAdd(val.trim())
    setVal('')
  }
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <input value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder={placeholder}
        style={{
          flex: 1, fontSize: 15, padding: '11px 16px', borderRadius: 14,
          border: `2.5px solid ${PS}`, background: BG, color: '#2D2B6B',
          outline: 'none', fontFamily: "'Nunito','Poppins',sans-serif", fontWeight: 600,
          boxShadow: `3px 3px 0 ${PS}`,
        }} />
      <button onClick={submit} style={{
        padding: '11px 24px', borderRadius: 14, background: P, color: WH,
        border: '2.5px solid #1A1560', cursor: 'pointer',
        ...fredoka, fontSize: 16, boxShadow: '3px 3px 0 #1A1560',
      }}>Add</button>
    </div>
  )
}

import { useState } from 'react'
