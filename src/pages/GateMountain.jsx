import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import topicSpec from '../data/gateTopics.json'
import { P, PL, PS, WH, GS, fredoka } from '../components/ui'
import './GateMountain.css'

const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const STORAGE_KEY = 'gate_mountain_progress_v3'
const OLD_KEYS = ['gate_mountain_os_v1', 'gate_mountain_progress_v2']
const STATUS_COLOR = { mastered: GS, revise: '#fee2e2', not_started: WH }
const CLASS_COLOR = { Numerical: '#e0f2fe', 'Conceptual + Numerical': '#f3e8ff', Conceptual: PS }
const CLASSIFY_NUMERICAL = /truth tabl|normal form|calculate|calculation|conversion|arithmetic|overflow|underflow|counting|permutation|combination|recurrence|generating function|coefficient extraction|probability|expectation|variance|distribution|matrix|determinant|rank|eigen|gaussian|lu decomposition|derivative|integration|integral|limit|maximum|minimum|numerical|truth table|simplif|minimiz|prime implicant|adder|subtractor|multiplex|decoder|encoder|comparator|parity|circuit design|flip-flop conversion|counter|state table|state diagram|register-based|address calculation|row-major|column-major|insertion|deletion|traversal|search|complexity|heap|hash|collision|probe|sorting|recursion tree|master theorem|knapsack|huffman|shortest path|spanning tree|graph traversal|disjoint-set|DFA|NFA|automata|language acceptance|parse tree|grammar|pumping lemma|Turing machine configuration|reduction|token|FIRST|FOLLOW|parsing table|shift-reduce|LR\(|SLR|LALR|translation|syntax-directed|backpatch|activation record|code-flow|data-flow|basic block|reaching definition|live-variable|available expression|process state|context switch|fork graph|scheduling|turnaround|waiting time|response time|Gantt|interleaving|Peterson|semaphore|producer-consumer|readers-writers|resource allocation graph|safe sequence|Banker|address translation|fragmentation|page table|effective access|page replacement|page fault|file allocation|inode|free-space|disk scheduling|head movement|ER model|cardinality|relational algebra|relational calculus|SQL quer|functional depend|candidate key|minimal cover|decomposition|serializability|precedence graph|schedule|lock-based|timestamp ordering|B-tree|B\+ tree|index height|join cost|query optimization|subnet|CIDR|fragmentation|checksum|CRC|ARQ|sliding-window|CSMA|routing|Dijkstra|Bellman-Ford|TCP|sequence number|congestion control|RTT|delay|throughput|bandwidth-delay|time, speed|work and rate|interest|data interpretation|equations|mensuration/i
const CLASSIFY_MIXED = /mutual exclusion|functional depend|DFA minimization|TCP congestion control|equivalence relation|partial order|Hasse diagram|lattice|group|graph coloring|graph colouring|binary search tree|hashing|recursion|pointer|floating-point|cache|pipeline|synchronization|deadlock|virtual memory|SQL|normalization|transaction|routing|ARQ|congestion|distribution|random variable/i
function classifyTopic(name) {
  if (CLASSIFY_MIXED.test(name)) return 'Conceptual + Numerical'
  return CLASSIFY_NUMERICAL.test(name) ? 'Numerical' : 'Conceptual'
}
const subjects = topicSpec.map(subject => ({
  ...subject,
  groups: subject.groups.map(group => ({ ...group, topics: group.topics.map(name => {
    const id = `${subject.id}-${group.id}-${slug(name)}`
    const classification = classifyTopic(name)
    return { id, subjectId: subject.id, groupId: group.id, groupName: group.name, subjectName: subject.name, name, classification }
  }) })),
}))
const allTopics = subjects.flatMap(subject => subject.groups.flatMap(group => group.topics))
function blankRecord(topic) {
  return { id: topic.id, subjectId: topic.subjectId, topicName: topic.name, classification: topic.classification, mastery: 'not_started', pyq: 'Not started', revisionCount: 0, lastRevised: null, notes: '' }
}
function normalizeRecord(topic, value) {
  if (typeof value === 'string') return { ...blankRecord(topic), mastery: value === 'mastered' ? 'mastered' : value === 'revise' ? 'revise' : 'not_started' }
  return { ...blankRecord(topic), ...(value || {}), id: topic.id, subjectId: topic.subjectId, topicName: topic.name, classification: topic.classification }
}
function topicFor(subject, group, name) {
  return subject.groups.find(item => item.id === group.id)?.topics.find(topic => topic.name === name)
}
function topicExplanation(topic) {
  const numerical = topic.classification !== 'Conceptual'
  return {
    what: `${topic.name} is a distinct learning objective in ${topic.groupName}, under ${topic.subjectName}.`,
    learn: numerical
      ? `Be able to define the inputs and assumptions, select the applicable rule or procedure, work through a small example, and check the result. Practice both direct questions and multi-step variations.`
      : `Learn the precise definition, important properties and conditions, how it differs from related concepts, and how to recognize it in a GATE question.`,
    formulas: numerical ? 'Use the exact rule or equation taught for this concept; write assumptions and units before applying it. The applicable formula depends on the question variant.' : 'No general formula applies. Record the defining rule, properties or conditions where relevant.',
    patterns: numerical ? 'GATE may ask for a calculation, trace, construction, simulation or step-by-step quantitative result.' : 'GATE may ask for a definition, property, comparison, proof idea or a short conceptual application.',
    mistakes: numerical ? 'Skipping an intermediate step, overlooking boundary conditions, or applying a rule outside its assumptions.' : 'Confusing a necessary condition with a sufficient one, or treating related terms as interchangeable.',
    prerequisites: `Review earlier concepts in ${topic.groupName} and the foundations of ${topic.subjectName}.`,
  }
}

export default function GateMountain({ session }) {
  const [mountainIndex, setMountainIndex] = useState(9)
  const [progress, setProgress] = useState({})
  const [selectedId, setSelectedId] = useState(null)
  const [openTopic, setOpenTopic] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [notesDraft, setNotesDraft] = useState('')
  const [loaded, setLoaded] = useState(false)
  const importRef = useRef(null)
  const activeSubject = subjects[mountainIndex]
  const subjectTopics = activeSubject.groups.flatMap(group => group.topics)
  const visibleGroups = useMemo(() => activeSubject.groups.map(group => ({
    ...group,
    topics: group.topics.filter(topic => {
      const record = progress[topic.id] || blankRecord(topic)
      const matchesQuery = !query.trim() || topic.name.toLowerCase().includes(query.trim().toLowerCase()) || group.name.toLowerCase().includes(query.trim().toLowerCase())
      const matchesStatus = statusFilter === 'all' || record.mastery === statusFilter
      const matchesClass = classFilter === 'all' || topic.classification === classFilter
      return matchesQuery && matchesStatus && matchesClass
    }),
  })).filter(group => group.topics.length), [activeSubject, progress, query, statusFilter, classFilter])
  const visibleTopics = visibleGroups.flatMap(group => group.topics)
  const selectedTopic = visibleTopics.find(topic => topic.id === selectedId) || visibleTopics[0] || null
  const topicStats = topics => topics.reduce((result, topic) => { result[progress[topic.id]?.mastery || 'not_started']++; return result }, { mastered: 0, revise: 0, not_started: 0 })
  const subjectStats = topicStats(subjectTopics)
  const overallStats = topicStats(allTopics)
  const subjectPct = Math.round(subjectStats.mastered / subjectTopics.length * 100)
  const overallPct = Math.round(overallStats.mastered / allTopics.length * 100)
  const currentRecord = openTopic ? progress[openTopic.id] || blankRecord(openTopic) : null

  useEffect(() => {
    let active = true
    async function load() {
      let remote = {}
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const metadata = user?.user_metadata || {}
        remote = { ...(metadata.gate_mountain_os_v1 || {}), ...(metadata.gate_mountain_progress_v2 || {}), ...(metadata[STORAGE_KEY] || {}) }
      } catch { /* Local storage still supports offline use. */ }
      let local = {}
      try {
        local = OLD_KEYS.reduce((merged, key) => ({ ...merged, ...JSON.parse(localStorage.getItem(key) || '{}') }), {})
        local = { ...local, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
      } catch { /* Ignore invalid local backup data. */ }
      const source = { ...local, ...remote }
      const next = {}
      for (const topic of allTopics) {
        let value = source[topic.id]
        if (value === undefined && topic.subjectId === 'operating-systems') {
          const wanted = slug(topic.name).replace(/-numerical$/, '')
          const old = Object.entries(source).find(([key]) => key.startsWith('os-') && (key.endsWith(`-${wanted}`) || key.endsWith(`-${wanted}-numerical`)))
          if (old) value = old[1]
        }
        if (value !== undefined) next[topic.id] = normalizeRecord(topic, value)
      }
      if (active) { setProgress(next); setLoaded(true) }
    }
    load()
    return () => { active = false }
  }, [session?.user?.id])

  useEffect(() => {
    if (!visibleTopics.some(topic => topic.id === selectedId)) setSelectedId(visibleTopics[0]?.id || null)
  }, [visibleTopics, selectedId])
  useEffect(() => { setNotesDraft(currentRecord?.notes || '') }, [openTopic?.id])

  async function save(next) {
    setProgress(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* Browser storage may be disabled. */ }
    try { await supabase.auth.updateUser({ data: { [STORAGE_KEY]: next } }) } catch { /* Keep local progress if remote save is unavailable. */ }
  }
  function updateTopic(topic, patch) {
    const next = { ...progress, [topic.id]: { ...blankRecord(topic), ...(progress[topic.id] || {}), ...patch } }
    save(next)
  }
  function setMastery(topic, mastery) {
    const record = { ...blankRecord(topic), ...(progress[topic.id] || {}) }
    updateTopic(topic, {
      mastery,
      revisionCount: mastery === 'revise' ? record.revisionCount + 1 : record.revisionCount,
      lastRevised: mastery === 'revise' ? new Date().toISOString() : record.lastRevised,
    })
  }
  function moveMountain(index) {
    const bounded = Math.max(0, Math.min(subjects.length - 1, index))
    setMountainIndex(bounded)
    setOpenTopic(null)
    setSelectedId(subjects[bounded].groups[0]?.topics[0]?.id || null)
  }
  function moveTopic(offset) {
    if (!visibleTopics.length) return
    const current = visibleTopics.findIndex(topic => topic.id === selectedId)
    const nextIndex = Math.max(0, Math.min(visibleTopics.length - 1, (current < 0 ? 0 : current) + offset))
    setSelectedId(visibleTopics[nextIndex].id)
  }
  useEffect(() => {
    function onKeyDown(event) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target?.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(event.target?.tagName || '')) return
      const key = event.key.toLowerCase()
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(event.key)) event.preventDefault()
      if (event.key === 'ArrowLeft') moveMountain(mountainIndex - 1)
      else if (event.key === 'ArrowRight') moveMountain(mountainIndex + 1)
      else if (event.key === 'ArrowUp') moveTopic(-1)
      else if (event.key === 'ArrowDown') moveTopic(1)
      else if (key === 'g' && selectedTopic) setMastery(selectedTopic, 'mastered')
      else if (key === 'r' && selectedTopic) setMastery(selectedTopic, 'revise')
      else if (event.key === 'Enter' && selectedTopic) { setOpenTopic(selectedTopic); setSelectedId(selectedTopic.id) }
      else if (event.key === 'Escape') setOpenTopic(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  function exportBackup() {
    const blob = new Blob([JSON.stringify({ version: 3, exportedAt: new Date().toISOString(), progress }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'gate-mountain-progress.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }
  async function importBackup(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      const imported = parsed.progress || parsed
      if (!imported || typeof imported !== 'object' || Array.isArray(imported)) throw new Error('Invalid backup')
      const merged = { ...progress }
      for (const topic of allTopics) if (imported[topic.id] !== undefined) merged[topic.id] = normalizeRecord(topic, imported[topic.id])
      await save(merged)
      window.alert('GATE Mountain progress imported.')
    } catch { window.alert('That file is not a valid GATE Mountain progress backup.') }
    event.target.value = ''
  }

  if (!loaded) return <div style={{ padding: 24, color: '#344054' }}>Loading GATE Mountain…</div>
  return <main className="gate-mountain-page" style={{ color: '#2D2B6B', fontFamily: "'Nunito', Arial, sans-serif" }}>
    <header className="gm-header">
      <div className="gm-topline">
        <div className="gm-title-block">
          <div className="gm-eyebrow">GATE CSE 2027 · TOPIC MASTERY</div>
          <h1 className="gm-title" style={{ ...fredoka, color: P }}>GATE Mountain</h1>
          <div className="gm-subtitle">Mountain {mountainIndex + 1} of {subjects.length} <span>·</span> {activeSubject.name}</div>
          <div className="gm-grouping">Official syllabus grouping: {activeSubject.syllabusGroup}</div>
        </div>
        <div className="gm-header-actions">
          <button className="gm-utility-button" onClick={exportBackup}>Export progress</button>
          <button className="gm-utility-button" onClick={() => importRef.current?.click()}>Import progress</button>
          <input ref={importRef} type="file" accept="application/json,.json" onChange={importBackup} className="gm-hidden-input" />
          <button className="gm-utility-button gm-reset-button" onClick={() => { if (window.confirm('Reset all GATE Mountain topic statuses across every subject? This cannot be undone.')) save({}) }}>Reset all</button>
        </div>
      </div>

      <div className="gm-progress-overview">
        <div className="gm-progress-stat"><strong>{subjectStats.mastered}</strong><span>Mastered</span></div>
        <div className="gm-progress-stat gm-revise-stat"><strong>{subjectStats.revise}</strong><span>Needs revision</span></div>
        <div className="gm-progress-stat"><strong>{subjectStats.not_started}</strong><span>Not started</span></div>
        <div className="gm-progress-stat gm-percent-stat"><strong>{subjectPct}%</strong><span>This mountain</span></div>
        <div className="gm-overall-stat">Overall CSE mastery <strong>{overallStats.mastered}/{allTopics.length}</strong><span>{overallPct}%</span></div>
      </div>
      <div className="gm-progress-track" aria-label={`Subject mastery ${subjectPct}%`}><div style={{ width: `${subjectPct}%`, background: P }} /></div>

      <nav aria-label="GATE CSE subject mountains" className="gm-subject-nav">
        {subjects.map((subject, index) => {
          const mastered = subject.groups.flatMap(group => group.topics).filter(topic => progress[topic.id]?.mastery === 'mastered').length
          const count = subject.groups.reduce((sum, group) => sum + group.topics.length, 0)
          return <button key={subject.id} onClick={() => moveMountain(index)} aria-current={index === mountainIndex ? 'page' : undefined} className={`gm-subject-tab ${index === mountainIndex ? 'is-active' : ''}`}>
            {subject.name}<span>{mastered}/{count}</span>
          </button>
        })}
      </nav>

      <div className="gm-mountain-controls">
        <button aria-label="Previous subject mountain" className="gm-arrow-button" onClick={() => moveMountain(mountainIndex - 1)} disabled={mountainIndex === 0}>←</button>
        <input aria-label="Choose subject mountain" type="range" min="0" max={subjects.length - 1} value={mountainIndex} onChange={event => moveMountain(Number(event.target.value))} style={{ accentColor: PL }} />
        <button aria-label="Next subject mountain" className="gm-arrow-button" onClick={() => moveMountain(mountainIndex + 1)} disabled={mountainIndex === subjects.length - 1}>→</button>
        <div className="gm-shortcut-legend"><span><i className="gm-dot gm-green-dot" /> G mastered</span><span><i className="gm-dot gm-red-dot" /> R revise</span><span className="gm-shortcut-hint">↑↓ topic · ←→ mountain · Enter details · Esc close</span></div>
      </div>

      <div className="gm-toolbar">
        <input className="gm-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search concepts…" aria-label="Search concepts" />
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label="Filter by mastery" className="gm-select">
          <option value="all">All mastery states</option><option value="not_started">Not started</option><option value="revise">Needs revision</option><option value="mastered">Mastered</option>
        </select>
        <select value={classFilter} onChange={event => setClassFilter(event.target.value)} aria-label="Filter by topic classification" className="gm-select">
          <option value="all">All topic types</option><option value="Numerical">Numerical</option><option value="Conceptual">Conceptual</option><option value="Conceptual + Numerical">Conceptual + Numerical</option>
        </select>
        <span className="gm-results-count">Showing {visibleTopics.length} of {subjectTopics.length}</span>
      </div>
    </header>

    {visibleTopics.length ? <section aria-label={`${activeSubject.name} topic groups`} className="gm-group-grid">
      {visibleGroups.map(group => <section key={group.id} className="gm-group">
        <div className="gm-group-heading"><h2 style={{ ...fredoka, color: P }}>{group.name}</h2><span>{group.topics.length} topics</span></div>
        <div className="gm-topic-list">
          {group.topics.map(topic => {
            const record = progress[topic.id] || blankRecord(topic)
            const isSelected = selectedTopic?.id === topic.id
            return <button key={topic.id} onFocus={() => setSelectedId(topic.id)} onClick={() => { setSelectedId(topic.id); setOpenTopic(topic) }} className={`gm-topic-tile ${isSelected ? 'is-selected' : ''}`} style={{ background: STATUS_COLOR[record.mastery] || WH }}>
              <span className="gm-topic-name">{topic.name}</span><span className="gm-classification" style={{ background: CLASS_COLOR[topic.classification] }}>{topic.classification}</span>
            </button>
          })}
        </div>
      </section>)}
    </section> : <p className="gm-empty-state">No topics match these search and filter settings.</p>}

    <footer className="gm-sources">
      Topic breakdown: <a href="https://www.goclasses.in/courses/GATE-CSE-Complete-Course" target="_blank" rel="noreferrer">GO Classes GATE CSE course structures</a>. Numerical topic labels are guided by the classification examples and question formats in <a href="https://gateoverflow.in/previous-years" target="_blank" rel="noreferrer">GATE Overflow previous papers</a> and its <a href="https://db.gateoverflow.in/tests" target="_blank" rel="noreferrer">subject question archive</a>.
    </footer>

    {openTopic && currentRecord && (() => { const detail = topicExplanation(openTopic); return <div role="dialog" aria-modal="true" aria-label={`${openTopic.name} topic card`} onClick={() => setOpenTopic(null)} className="gm-dialog-backdrop">
      <aside onClick={event => event.stopPropagation()} className="gm-topic-dialog">
        <div className="gm-dialog-heading"><div><div className="gm-dialog-kicker">{openTopic.subjectName} · {openTopic.groupName}</div><h2 style={{ ...fredoka, color: P }}>{openTopic.name}</h2><span className="gm-classification gm-dialog-classification" style={{ background: CLASS_COLOR[openTopic.classification] }}>{openTopic.classification}</span></div><button aria-label="Close topic card" onClick={() => setOpenTopic(null)} className="gm-close-button">×</button></div>
        <div className="gm-learning-card">
          <h3>What is this concept?</h3><p>{detail.what}</p>
          <h3>What exactly must I learn?</h3><p>{detail.learn}</p>
          <h3>Important formulas or rules</h3><p>{detail.formulas}</p>
          <h3>Common GATE question patterns</h3><p>{detail.patterns}</p>
          <h3>Common mistakes</h3><p>{detail.mistakes}</p>
          <h3>Prerequisites</h3><p>{detail.prerequisites}</p>
        </div>
        <div className="gm-dialog-fields">
          <label>PYQ practice status<select value={currentRecord.pyq} onChange={event => updateTopic(openTopic, { pyq: event.target.value })} className="gm-select gm-dialog-select"><option>Not started</option><option>In progress</option><option>Completed</option></select></label>
          <label>Personal notes<textarea value={notesDraft} onChange={event => setNotesDraft(event.target.value)} rows={3} placeholder="Add a reminder or question pattern…" className="gm-notes-input" /></label>
        </div>
        <div className="gm-dialog-actions">
          <button onClick={() => setMastery(openTopic, 'mastered')} className="gm-action-button gm-mastered-button">G · Mastered</button>
          <button onClick={() => setMastery(openTopic, 'revise')} className="gm-action-button gm-revise-button">R · Needs revision</button>
          <button onClick={() => setMastery(openTopic, 'not_started')} className="gm-action-button">Clear status</button>
          <button onClick={() => updateTopic(openTopic, { revisionCount: currentRecord.revisionCount + 1, lastRevised: new Date().toISOString() })} className="gm-action-button">Log revision</button>
          <button onClick={() => updateTopic(openTopic, { notes: notesDraft })} className="gm-action-button gm-save-note-button">Save note</button>
        </div>
        <div className="gm-record-meta">Mastery: {currentRecord.mastery.replace('_', ' ')} <span>·</span> PYQs: {currentRecord.pyq} <span>·</span> Revisions: {currentRecord.revisionCount} <span>·</span> Last revised: {currentRecord.lastRevised ? new Date(currentRecord.lastRevised).toLocaleDateString() : '—'}</div>
      </aside>
    </div> })()}
  </main>
}
