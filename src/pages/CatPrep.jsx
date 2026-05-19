import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { card, fredoka, P, PS, WH, BG, Y } from '../components/ui'

const CAT_SYLLABUS = {
  VARC: {
    label: "VARC – Verbal Ability & Reading Comprehension",
    color: "#5E6AD2",
    accent: "#ECEEFE",
    totalQ: 24, totalMarks: 72,
    sections: [
      {
        name: "Reading Comprehension",
        questions: 16, difficulty: "Moderate to Difficult",
        topics: [
          "Passage-based questions",
          "Inference from passages",
          "Critical reasoning from text",
          "Tone and theme identification",
          "Vocabulary in context",
        ],
      },
      {
        name: "Para Jumbles",
        questions: 3, difficulty: "Moderate to Difficult",
        topics: [
          "Sentence rearrangement",
          "Logical sequencing",
          "Coherence and cohesion",
        ],
      },
      {
        name: "Odd Sentence Out",
        questions: 2, difficulty: "Easy to Moderate",
        topics: [
          "Identify misfit sentence",
          "Paragraph unity",
        ],
      },
      {
        name: "Summary",
        questions: 3, difficulty: "Easy to Moderate",
        topics: [
          "Para completion",
          "Para inference",
          "Verbal logic",
        ],
      },
      {
        name: "Verbal Ability",
        questions: 0, difficulty: "Moderate",
        topics: [
          "Fill in the blanks",
          "Subject-verb agreement",
          "Grammar & parts of speech",
          "Idioms & phrases",
          "Syllogisms & analogies",
          "Antonyms & one-word substitution",
          "Sentence correction & errors in tenses",
          "Articles usage & prepositions",
          "Foreign language words used in English",
          "Types of clauses & phrase modifiers",
        ],
      },
    ],
  },
  DILR: {
    label: "DILR – Data Interpretation & Logical Reasoning",
    color: "#D97706",
    accent: "#FEF3C7",
    totalQ: 20, totalMarks: 60,
    sections: [
      {
        name: "Data Interpretation (Easy)",
        questions: 4, difficulty: "Easy",
        topics: [
          "Tables",
          "Pie Charts",
          "Bars & Line Graphs",
          "Data Sufficiency",
        ],
      },
      {
        name: "Data Interpretation (Moderate)",
        questions: 4, difficulty: "Moderate",
        topics: [
          "Sets & Caselets",
          "Data Arrangement",
          "Data Structures",
          "Complex multi-chart questions",
        ],
      },
      {
        name: "Logical Reasoning (Easy-Moderate)",
        questions: 6, difficulty: "Easy to Moderate",
        topics: [
          "Blood Relations",
          "Clocks and Calendars",
          "Direction Sense",
          "Coding-Decoding",
          "Family Tree",
          "Venn Diagram",
        ],
      },
      {
        name: "Logical Reasoning (Moderate-Difficult)",
        questions: 6, difficulty: "Moderate to Difficult",
        topics: [
          "Seating Arrangement",
          "Puzzles",
          "Syllogism",
          "Series & Statements",
          "Assumptions & Propositions",
          "Binary Logic",
        ],
      },
    ],
  },
  QA: {
    label: "QA – Quantitative Aptitude",
    color: "#16a34a",
    accent: "#DCFCE7",
    totalQ: 22, totalMarks: 66,
    sections: [
      {
        name: "Arithmetic",
        questions: 10, difficulty: "Moderate",
        topics: [
          "Averages, Mean, Median, Mode",
          "Percentages",
          "Ratio and Proportion",
          "Simple and Compound Interest",
          "Profit and Loss",
          "Mixtures and Allegations",
          "Time and Work",
          "Time, Speed and Distance",
        ],
      },
      {
        name: "Algebra",
        questions: 5, difficulty: "Moderate",
        topics: [
          "Basic Algebraic Formulae",
          "Linear Equations & Problems on Ages",
          "Quadratic Equations – Finding Roots",
          "Maxima and Minima",
          "Higher Degree Equations & Descartes Rule",
          "Inequalities",
          "Logarithm & Functions",
          "Modifications of Graphs",
        ],
      },
      {
        name: "Geometry",
        questions: 3, difficulty: "Moderate",
        topics: [
          "Lines and Angles",
          "Triangles – Area, Angles, Similar Triangles",
          "Polygons & Circles",
          "Mensuration – 3D Geometry",
          "Coordinate Geometry",
          "Trigonometry",
        ],
      },
      {
        name: "Number System",
        questions: 0, difficulty: "Moderate",
        topics: [
          "Basics & Properties of Numbers",
          "Divisibility Rules & Factors",
          "HCF and LCM",
          "Last Digit & Last Two Digits",
          "Number of Trailing Zeroes",
          "Remainders – Fermat, Euler, Wilson Theorems",
          "Binomial Theorem",
          "Base Systems & Conversion",
        ],
      },
      {
        name: "Modern Maths",
        questions: 4, difficulty: "Moderate",
        topics: [
          "Sequence and Series",
          "Binomial Theorem",
          "Set Theory",
          "Permutation and Combination",
          "Probability",
        ],
      },
    ],
  },
}

export default function CatPrep({ session }) {
  const userId = session.user.id
  const STORE_KEY = 'cat_progress'

  const [activeSubject,    setActiveSubject]    = useState('VARC')
  const [expandedSections, setExpandedSections] = useState({})
  const [editingQ,         setEditingQ]         = useState(null)
  const [catLogs,          setCatLogs]          = useState({})
  const [loading,          setLoading]          = useState(true)

  useEffect(() => { loadProgress() }, [])

  async function loadProgress() {
    const { data: { user } } = await supabase.auth.getUser()
    const saved = user?.user_metadata?.[STORE_KEY] || {}
    setCatLogs(saved)
    setLoading(false)
  }

  async function saveProgress(updated) {
    setCatLogs(updated)
    await supabase.auth.updateUser({ data: { [STORE_KEY]: updated } })
  }

  function topicKey(subjectKey, secName, topic) {
    return `${subjectKey}__${secName}__${topic}`
  }

  function getSubjectProgress(subjectKey) {
    const syllabus = CAT_SYLLABUS[subjectKey]
    let total = 0, watched = 0
    syllabus.sections.forEach(sec => {
      sec.topics.forEach(topic => {
        total++
        if (catLogs[topicKey(subjectKey, sec.name, topic)]?.watched) watched++
      })
    })
    return { total, watched, pct: total ? (watched / total) * 100 : 0 }
  }

  function getSectionProgress(secName, topics) {
    let watched = 0, totalQ = 0
    topics.forEach(topic => {
      const k = topicKey(activeSubject, secName, topic)
      if (catLogs[k]?.watched) watched++
      totalQ += catLogs[k]?.qCount || 0
    })
    return { watched, total: topics.length, totalQ }
  }

  async function toggleWatched(key) {
    const updated = { ...catLogs }
    if (!updated[key]) updated[key] = { watched: false, qCount: 0 }
    updated[key] = { ...updated[key], watched: !updated[key].watched }
    await saveProgress(updated)
  }

  async function setQCount(key, val) {
    const num = Math.max(0, parseInt(val) || 0)
    const updated = { ...catLogs }
    if (!updated[key]) updated[key] = { watched: false, qCount: 0 }
    updated[key] = { ...updated[key], qCount: num }
    await saveProgress(updated)
  }

  function toggleSection(secName) {
    setExpandedSections(p => ({ ...p, [secName]: !p[secName] }))
  }

  if (loading) return (
    <div style={{ ...fredoka, fontSize: 20, color: P, padding: '3rem', textAlign: 'center' }}>Loading CAT prep...</div>
  )

  const subjectData   = CAT_SYLLABUS[activeSubject]
  const subjectColor  = subjectData.color
  const subjectAccent = subjectData.accent

  const varcP = getSubjectProgress('VARC')
  const dilrP = getSubjectProgress('DILR')
  const qaP   = getSubjectProgress('QA')
  const progressMap = { VARC: varcP, DILR: dilrP, QA: qaP }

  const overallDone  = varcP.watched + dilrP.watched + qaP.watched
  const overallTotal = varcP.total + dilrP.total + qaP.total
  const overallPct   = overallTotal ? Math.round((overallDone / overallTotal) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#6B67D4,#4B47B0)', borderRadius: 20,
        padding: '1.5rem 2rem', border: '3px solid #1A1560', boxShadow: '5px 5px 0 #1A1560',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ ...fredoka, fontSize: 28, color: '#fff', textShadow: '2px 2px 0 #1A1560' }}>CAT Prep Tracker 🎯</div>
          <div style={{ ...fredoka, fontSize: 14, color: 'rgba(255,255,255,.8)', marginTop: 4 }}>
            Common Admission Test — 66 questions · 198 marks
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...fredoka, fontSize: 42, color: Y, textShadow: '3px 3px 0 #7A5A00', lineHeight: 1 }}>{overallPct}%</div>
          <div style={{ ...fredoka, fontSize: 13, color: 'rgba(255,255,255,.7)', marginTop: 4 }}>
            {overallDone}/{overallTotal} topics done
          </div>
        </div>
      </div>

      {/* Subject tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {['VARC', 'DILR', 'QA'].map(sk => {
          const prog     = progressMap[sk]
          const sc       = CAT_SYLLABUS[sk]
          const isActive = activeSubject === sk
          return (
            <div key={sk} onClick={() => setActiveSubject(sk)} style={{
              cursor: 'pointer',
              background: isActive ? sc.color : WH,
              border: `3px solid ${isActive ? sc.color : '#C5C3E8'}`,
              borderRadius: 20, padding: '1.2rem 1.4rem',
              boxShadow: isActive ? `5px 5px 0 ${sc.color}88` : `4px 4px 0 ${PS}`,
              transition: 'all .2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ ...fredoka, fontSize: 20, color: isActive ? '#fff' : sc.color, textShadow: isActive ? '1px 1px 0 rgba(0,0,0,.2)' : 'none' }}>{sk}</div>
                  <div style={{ ...fredoka, fontSize: 11, color: isActive ? 'rgba(255,255,255,.75)' : '#8885CC', marginTop: 2 }}>
                    {sc.totalQ}Q · {sc.totalMarks}M
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ ...fredoka, fontSize: 26, color: isActive ? '#fff' : sc.color }}>{prog.watched}</div>
                  <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, fontWeight: 700, color: isActive ? 'rgba(255,255,255,.7)' : '#8885CC' }}>/ {prog.total}</div>
                </div>
              </div>
              <div style={{ height: 8, borderRadius: 8, background: isActive ? 'rgba(255,255,255,.25)' : sc.accent }}>
                <div style={{ height: '100%', borderRadius: 8, background: isActive ? '#fff' : sc.color, width: `${prog.pct}%`, transition: 'width .5s ease' }} />
              </div>
              <div style={{ marginTop: 5, ...fredoka, fontSize: 12, color: isActive ? 'rgba(255,255,255,.8)' : sc.color }}>{Math.round(prog.pct)}% done</div>
            </div>
          )
        })}
      </div>

      {/* Section list — identical pattern to GATE */}
      <div style={{ ...card, padding: '1.4rem 1.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: subjectColor, flexShrink: 0 }} />
          <div style={{ ...fredoka, fontSize: 20, color: subjectColor }}>{subjectData.label} — Syllabus Tracker</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {subjectData.sections.map(sec => {
            const isOpen = expandedSections[sec.name]
            const { watched, total, totalQ } = getSectionProgress(sec.name, sec.topics)
            const secPct = total ? (watched / total) * 100 : 0

            return (
              <div key={sec.name} style={{ border: `2px solid ${subjectAccent}`, borderRadius: 16, overflow: 'hidden' }}>
                {/* Section header */}
                <div onClick={() => toggleSection(sec.name)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                  cursor: 'pointer', background: isOpen ? subjectAccent : 'transparent', transition: 'background .15s',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ ...fredoka, fontSize: 16, color: subjectColor }}>{sec.name}</span>
                      <span style={{ background: subjectColor, color: WH, borderRadius: 20, padding: '2px 10px', ...fredoka, fontSize: 12 }}>{watched}/{total}</span>
                      {sec.questions > 0 && (
                        <span style={{ background: subjectAccent, color: subjectColor, borderRadius: 20, padding: '2px 10px', ...fredoka, fontSize: 12, border: `1px solid ${subjectColor}44` }}>
                          {sec.questions} in exam
                        </span>
                      )}
                      {totalQ > 0 && (
                        <span style={{ background: '#FEF3C7', color: '#92400E', borderRadius: 20, padding: '2px 10px', ...fredoka, fontSize: 12, border: '1px solid #FCD34D' }}>
                          {totalQ} Qs done
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: 6, height: 5, borderRadius: 5, background: 'rgba(0,0,0,.06)' }}>
                      <div style={{ height: '100%', borderRadius: 5, background: subjectColor, width: `${secPct}%`, transition: 'width .4s' }} />
                    </div>
                  </div>
                  <div style={{ ...fredoka, fontSize: 18, color: subjectColor, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</div>
                </div>

                {/* Topics */}
                {isOpen && (
                  <div style={{ borderTop: `2px solid ${subjectAccent}` }}>
                    {sec.topics.map((topic, ti) => {
                      const k   = topicKey(activeSubject, sec.name, topic)
                      const log = catLogs[k] || { watched: false, qCount: 0 }
                      const isEditingThis = editingQ === k

                      return (
                        <div key={k} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 18px',
                          borderBottom: ti < sec.topics.length - 1 ? `1.5px dashed ${subjectAccent}` : 'none',
                          background: log.watched ? `${subjectAccent}44` : 'transparent',
                          transition: 'background .15s',
                        }}>
                          {/* Watched checkbox */}
                          <div onClick={() => toggleWatched(k)} style={{
                            width: 22, height: 22, borderRadius: 7, flexShrink: 0, cursor: 'pointer',
                            border: `2.5px solid ${log.watched ? subjectColor : '#C5C3E8'}`,
                            background: log.watched ? subjectColor : WH,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all .15s', boxShadow: log.watched ? `2px 2px 0 ${subjectColor}88` : '2px 2px 0 #C5C3E8',
                          }}>
                            {log.watched && <svg width="11" height="9" viewBox="0 0 12 10"><path d="M1 5l3.5 3.5 6.5-7" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </div>

                          {/* Topic name */}
                          <span style={{
                            flex: 1, fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 14,
                            color: log.watched ? '#6B7280' : '#2D2B6B',
                            textDecoration: log.watched ? 'line-through' : 'none', transition: 'all .15s',
                          }}>{topic}</span>

                          {/* Questions counter */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            {isEditingThis ? (
                              <input
                                autoFocus type="number" min="0" defaultValue={log.qCount}
                                onBlur={e => { setQCount(k, e.target.value); setEditingQ(null) }}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') { setQCount(k, e.target.value); setEditingQ(null) } }}
                                style={{
                                  width: 64, padding: '4px 8px', borderRadius: 8,
                                  border: `2px solid ${subjectColor}`, outline: 'none',
                                  ...fredoka, fontSize: 14, color: subjectColor,
                                  textAlign: 'center', background: WH,
                                }}
                              />
                            ) : (
                              <div onClick={() => setEditingQ(k)} style={{
                                display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                                background: log.qCount > 0 ? '#FEF3C7' : '#F3F4F6',
                                border: `1.5px solid ${log.qCount > 0 ? '#FCD34D' : '#E5E7EB'}`,
                                borderRadius: 8, padding: '3px 10px', transition: 'all .15s',
                              }}>
                                <span style={{ fontSize: 12 }}>📝</span>
                                <span style={{ ...fredoka, fontSize: 13, color: log.qCount > 0 ? '#92400E' : '#9CA3AF' }}>
                                  {log.qCount} Q{log.qCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
