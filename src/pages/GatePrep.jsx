import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { card, purpleBubble, fredoka, P, PS, WH, BG } from '../components/ui'

/* ── GATE Syllabus Data ── */
const GATE_SYLLABUS = {
  DA: {
    label: "DA – Data Science & AI",
    color: "#7C3AED",
    accent: "#DDD6FE",
    sections: [
      {
        name: "Probability & Statistics",
        topics: [
          "Counting (permutations & combinations)",
          "Probability axioms, Sample space, Events",
          "Independent & mutually exclusive events",
          "Marginal, conditional & joint probability",
          "Bayes Theorem",
          "Conditional expectation and variance",
          "Mean, Median, Mode, Std Deviation",
          "Correlation and Covariance",
          "Discrete RVs & PMF (Uniform, Bernoulli, Binomial)",
          "Continuous RVs & PDF (Uniform, Exponential, Poisson, Normal)",
          "t-distribution, chi-squared distribution",
          "CDF, Conditional PDF",
          "Central Limit Theorem, Confidence interval",
          "z-test, t-test, chi-squared test",
        ],
      },
      {
        name: "Linear Algebra",
        topics: [
          "Vector spaces and subspaces",
          "Linear dependence & independence",
          "Matrices: projection, orthogonal, idempotent, partition",
          "Quadratic forms",
          "Systems of linear equations – Gaussian elimination",
          "Eigenvalues and eigenvectors",
          "Determinant, Rank, Nullity",
          "LU decomposition",
          "Singular Value Decomposition (SVD)",
        ],
      },
      {
        name: "Calculus & Optimization",
        topics: [
          "Limits, continuity and differentiability",
          "Taylor series",
          "Maxima and minima",
          "Optimization (single variable)",
        ],
      },
      {
        name: "Programming, DSA",
        topics: [
          "Python programming basics",
          "Stacks, Queues, Linked Lists",
          "Trees and Hash Tables",
          "Linear & Binary Search",
          "Selection, Bubble, Insertion Sort",
          "Mergesort, Quicksort (Divide & Conquer)",
          "Introduction to Graph Theory",
          "Graph traversals & Shortest Path",
        ],
      },
      {
        name: "Database Management & Warehousing",
        topics: [
          "ER-model, Relational model",
          "Relational algebra, Tuple calculus, SQL",
          "Integrity constraints, Normal forms",
          "File organization, Indexing",
          "Data transformation (normalization, discretization, sampling)",
          "Data warehouse modelling, Schema, Concept hierarchies",
        ],
      },
      {
        name: "Machine Learning",
        topics: [
          "Simple & Multiple Linear Regression",
          "Ridge Regression, Logistic Regression",
          "k-Nearest Neighbour, Naive Bayes Classifier",
          "Linear Discriminant Analysis, SVM",
          "Decision Trees",
          "Bias-Variance Trade-off",
          "LOO & k-fold Cross-Validation",
          "Multi-layer Perceptron, Feed-forward Neural Network",
          "k-means / k-medoid Clustering",
          "Hierarchical Clustering (single/multiple linkage)",
          "Dimensionality Reduction, PCA",
        ],
      },
      {
        name: "Artificial Intelligence",
        topics: [
          "Informed, Uninformed, Adversarial Search",
          "Propositional and Predicate Logic",
          "Conditional independence representation",
          "Exact inference – Variable Elimination",
          "Approximate inference – Sampling",
        ],
      },
    ],
  },
  CS: {
    label: "CS – Computer Science & IT",
    color: "#0F766E",
    accent: "#CCFBF1",
    sections: [
      {
        name: "Discrete Mathematics",
        topics: [
          "Propositional and first order logic",
          "Sets, relations, functions",
          "Partial orders and lattices, Monoids, Groups",
          "Graphs: connectivity, matching, colouring",
          "Combinatorics: counting, recurrence relations",
          "Generating functions",
        ],
      },
      {
        name: "Linear Algebra",
        topics: [
          "Matrices and determinants",
          "System of linear equations",
          "Eigenvalues and eigenvectors",
          "LU decomposition",
        ],
      },
      {
        name: "Calculus",
        topics: [
          "Limits, continuity and differentiability",
          "Maxima and minima",
          "Mean value theorem",
          "Integration",
        ],
      },
      {
        name: "Probability & Statistics",
        topics: [
          "Random variables, Uniform, Normal, Exponential, Poisson, Binomial",
          "Mean, Median, Mode, Std Deviation",
          "Conditional probability and Bayes theorem",
        ],
      },
      {
        name: "Digital Logic",
        topics: [
          "Boolean algebra",
          "Combinational and sequential circuits",
          "Minimization",
          "Number representations (fixed and floating point)",
        ],
      },
      {
        name: "Computer Organization & Architecture",
        topics: [
          "Machine instructions and addressing modes",
          "ALU, data-path and control unit",
          "Instruction pipelining, pipeline hazards",
          "Memory hierarchy (cache, main memory, secondary storage)",
          "I/O interface (interrupt and DMA mode)",
        ],
      },
      {
        name: "Programming & Data Structures",
        topics: [
          "Programming in C, Recursion",
          "Arrays, Stacks, Queues, Linked Lists",
          "Trees, Binary Search Trees, Binary Heaps",
          "Graphs",
        ],
      },
      {
        name: "Algorithms",
        topics: [
          "Searching, Sorting, Hashing",
          "Asymptotic worst-case time & space complexity",
          "Greedy algorithms",
          "Dynamic programming",
          "Divide and conquer",
          "Graph traversals, MST, Shortest paths",
        ],
      },
      {
        name: "Theory of Computation",
        topics: [
          "Regular expressions and finite automata",
          "Context-free grammars and push-down automata",
          "Regular and context-free languages, Pumping lemma",
          "Turing machines and undecidability",
        ],
      },
      {
        name: "Compiler Design",
        topics: [
          "Lexical analysis, Parsing, Syntax-directed translation",
          "Runtime environments",
          "Intermediate code generation",
          "Local optimization, Data flow analyses",
        ],
      },
      {
        name: "Operating Systems",
        topics: [
          "System calls, Processes, Threads",
          "Inter-process communication, Concurrency & Synchronization",
          "Deadlock",
          "CPU and I/O scheduling",
          "Memory management and virtual memory",
          "File systems",
        ],
      },
      {
        name: "Databases",
        topics: [
          "ER-model, Relational model",
          "Relational algebra, Tuple calculus, SQL",
          "Integrity constraints, Normal forms",
          "File organization, Indexing (B and B+ trees)",
          "Transactions and concurrency control",
        ],
      },
      {
        name: "Computer Networks",
        topics: [
          "OSI and TCP/IP Protocol Stacks",
          "Packet, circuit and virtual circuit switching",
          "Data link layer: framing, error detection, MAC, Ethernet",
          "Routing protocols (shortest path, distance vector, link state)",
          "IP addressing, IPv4, CIDR, ARP, DHCP, ICMP, NAT",
          "Transport layer: flow control, congestion control, UDP, TCP",
          "Application layer: DNS, SMTP, HTTP, FTP, Email",
        ],
      },
    ],
  },
}

export default function GatePrep({ session }) {
  const userId = session.user.id
  const STORE_KEY = 'gate_progress'

  const [activeSubject,    setActiveSubject]    = useState('DA')
  const [expandedSections, setExpandedSections] = useState({})
  const [editingQ,         setEditingQ]         = useState(null)
  const [gateLogs,         setGateLogs]         = useState({}) // { topicKey: { watched, qCount } }
  const [loading,          setLoading]          = useState(true)

  // ── Load from Supabase user_metadata ─────────────────────────────────────
  useEffect(() => { loadProgress() }, [])

  async function loadProgress() {
    const { data: { user } } = await supabase.auth.getUser()
    const saved = user?.user_metadata?.[STORE_KEY] || {}
    setGateLogs(saved)
    setLoading(false)
  }

  async function saveProgress(updated) {
    setGateLogs(updated)
    await supabase.auth.updateUser({ data: { [STORE_KEY]: updated } })
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function topicKey(subjectKey, secName, topic) {
    return `${subjectKey}__${secName}__${topic}`
  }

  function getSubjectProgress(subjectKey) {
    const syllabus = GATE_SYLLABUS[subjectKey]
    let total = 0, watched = 0
    syllabus.sections.forEach(sec => {
      sec.topics.forEach(topic => {
        const key = topicKey(subjectKey, sec.name, topic)
        total++
        if (gateLogs[key]?.watched) watched++
      })
    })
    return { total, watched, pct: total ? (watched / total) * 100 : 0 }
  }

  function getSectionProgress(secName, topics) {
    let watched = 0, totalQ = 0
    topics.forEach(topic => {
      const k = topicKey(activeSubject, secName, topic)
      if (gateLogs[k]?.watched) watched++
      totalQ += gateLogs[k]?.qCount || 0
    })
    return { watched, total: topics.length, totalQ }
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  async function toggleWatched(key) {
    const updated = { ...gateLogs }
    if (!updated[key]) updated[key] = { watched: false, qCount: 0 }
    updated[key] = { ...updated[key], watched: !updated[key].watched }
    await saveProgress(updated)
  }

  async function setQCount(key, val) {
    const num = Math.max(0, parseInt(val) || 0)
    const updated = { ...gateLogs }
    if (!updated[key]) updated[key] = { watched: false, qCount: 0 }
    updated[key] = { ...updated[key], qCount: num }
    await saveProgress(updated)
  }

  function toggleSection(secName) {
    setExpandedSections(p => ({ ...p, [secName]: !p[secName] }))
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ ...fredoka, fontSize: 20, color: P, padding: '3rem', textAlign: 'center' }}>Loading GATE prep...</div>
  )

  const subjectData   = GATE_SYLLABUS[activeSubject]
  const subjectColor  = subjectData.color
  const subjectAccent = subjectData.accent
  const daProgress    = getSubjectProgress('DA')
  const csProgress    = getSubjectProgress('CS')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Subject switcher cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {['DA', 'CS'].map(sk => {
          const prog     = sk === 'DA' ? daProgress : csProgress
          const sc       = GATE_SYLLABUS[sk]
          const isActive = activeSubject === sk
          return (
            <div key={sk} onClick={() => setActiveSubject(sk)} style={{
              cursor: 'pointer',
              background: isActive ? sc.color : WH,
              border: `3px solid ${isActive ? sc.color : '#C5C3E8'}`,
              borderRadius: 20,
              padding: '1.4rem 1.6rem',
              boxShadow: isActive ? `5px 5px 0 ${sc.color}88` : `4px 4px 0 ${PS}`,
              transition: 'all .2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ ...fredoka, fontSize: 13, color: isActive ? 'rgba(255,255,255,.7)' : sc.color, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>{sk}</div>
                  <div style={{ ...fredoka, fontSize: 17, color: isActive ? WH : sc.color, lineHeight: 1.2 }}>
                    {sk === 'DA' ? 'Data Science & AI' : 'Computer Science & IT'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ ...fredoka, fontSize: 28, color: isActive ? WH : sc.color }}>{prog.watched}</div>
                  <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, color: isActive ? 'rgba(255,255,255,.7)' : '#8885CC' }}>/ {prog.total} topics</div>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ height: 10, borderRadius: 10, background: isActive ? 'rgba(255,255,255,.2)' : sc.accent }}>
                <div style={{ height: '100%', borderRadius: 10, background: isActive ? WH : sc.color, width: `${prog.pct}%`, transition: 'width .5s ease' }} />
              </div>
              <div style={{ marginTop: 6, ...fredoka, fontSize: 13, color: isActive ? 'rgba(255,255,255,.75)' : sc.color }}>{Math.round(prog.pct)}% complete</div>
            </div>
          )
        })}
      </div>

      {/* Section list */}
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
                      const log = gateLogs[k] || { watched: false, qCount: 0 }
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
