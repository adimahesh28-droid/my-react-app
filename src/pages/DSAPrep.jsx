import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { card, fredoka, P, PS, WH, BG } from '../components/ui'

/* ── Striver's A2Z DSA Sheet ── */
const DSA_SHEET = [
  {
    step: "Step 1",
    name: "Learn the Basics",
    color: "#E11D48",
    accent: "#FFE4E6",
    topics: [
      { title: "Things to Know in C++/Java/Python", problems: ["User Input/Output", "Data Types", "If-Else / Switch", "What are arrays, strings?", "For loops", "While loops", "Functions (pass by value, reference)", "Time Complexity basics"] },
      { title: "Build-up Logic Thinking", problems: ["Pattern 1 – Rectangle Star", "Pattern 2 – Right Triangle", "Pattern 3 – Right Triangle (n to 1)", "Pattern 4 – Right Triangle (1 to n)", "Pattern 5 – Inverted Right Triangle", "Pattern 6 – Inverted Numbered Triangle", "Pattern 7 – Star Pyramid", "Pattern 8 – Inverted Star Pyramid", "Pattern 9 – Diamond Star", "Pattern 10 – Half Diamond", "Pattern 11 – Binary Triangle", "Pattern 12 – Number Crown", "Pattern 13 – Increasing Number Triangle", "Pattern 14 – Increasing Letter Triangle", "Pattern 15 – Reverse Letter Triangle", "Pattern 16 – Alpha Hill", "Pattern 17 – Alpha Triangle", "Pattern 18 – Symmetric-Void", "Pattern 19 – Star diamond", "Pattern 20 – Spiral Matrix", "Pattern 21 – Butterfly", "Pattern 22 – Hollow Rectangle"] },
      { title: "Learn STL / Java Collections / Python Collections", problems: ["Pairs", "Vectors / ArrayList", "Dynamic Arrays", "List", "Maps (ordered, unordered, multi)", "Sets (ordered, unordered, multi)", "Queues & Stacks & PQ (heaps)", "Iterators"] },
      { title: "Basic Maths", problems: ["Count Digits", "Reverse a Number", "Check Palindrome", "GCD or HCF", "Armstrong Numbers", "Print all Divisors", "Check for Prime"] },
      { title: "Basic Recursion", problems: ["Understand recursion by printing something N times", "Print name N times using recursion", "Print 1 to N using recursion", "Print N to 1 using recursion", "Sum of first N numbers", "Factorial of N numbers", "Reverse an array", "Check if a string is palindrome", "Fibonacci Number"] },
      { title: "Basic Hashing", problems: ["Counting frequencies of array elements", "Find the highest/lowest frequency element"] },
    ],
  },
  {
    step: "Step 2",
    name: "Sorting Techniques",
    color: "#D97706",
    accent: "#FEF3C7",
    topics: [
      { title: "Sorting I", problems: ["Selection Sort", "Bubble Sort", "Insertion Sort"] },
      { title: "Sorting II", problems: ["Merge Sort", "Quick Sort", "Recursive Bubble Sort", "Recursive Insertion Sort"] },
    ],
  },
  {
    step: "Step 3",
    name: "Arrays",
    color: "#0284C7",
    accent: "#E0F2FE",
    topics: [
      { title: "Easy", problems: ["Largest Element in an Array", "Second Largest Element", "Check if Array is Sorted", "Remove duplicates from Sorted Array", "Left Rotate an array by one place", "Left rotate an array by D places", "Move Zeros to end", "Linear Search", "Find the Union", "Find missing number in an array", "Maximum Consecutive Ones", "Find the number that appears once", "Longest subarray with given sum K (positives)", "Longest subarray with sum K (positives and negatives)"] },
      { title: "Medium", problems: ["2Sum Problem", "Sort an array of 0s, 1s and 2s", "Majority Element (>n/2 times)", "Kadane's Algorithm (Maximum subarray sum)", "Stock Buy and Sell", "Rearrange Array Elements by Sign", "Next Permutation", "Leaders in an Array", "Longest Consecutive Sequence", "Set Matrix Zeros", "Rotate Matrix by 90°", "Print the Matrix in Spiral Manner", "Count subarrays with given sum"] },
      { title: "Hard", problems: ["Pascal's Triangle", "Majority Element (n/3 times)", "3-Sum Problem", "4-Sum Problem", "Largest Subarray with 0 Sum", "Count number of subarrays with given XOR K", "Merge Overlapping Sub-intervals", "Merge two sorted arrays without extra space", "Find the repeating and missing number", "Count inversions", "Reverse pairs", "Maximum Product Subarray"] },
    ],
  },
  {
    step: "Step 4",
    name: "Binary Search",
    color: "#7C3AED",
    accent: "#EDE9FE",
    topics: [
      { title: "BS on 1D Arrays", problems: ["Binary Search to find X in sorted array", "Implement Lower Bound", "Implement Upper Bound", "Search Insert Position", "Floor/Ceil in Sorted Array", "Find the first or last occurrence of a given number in a sorted array", "Count occurrences of a number in a sorted array", "Search in Rotated Sorted Array I", "Search in Rotated Sorted Array II", "Find minimum in Rotated Sorted Array", "Find out how many times has an array been rotated", "Single element in a sorted array", "Find peak element"] },
      { title: "BS on Answers", problems: ["Find square root of a number in log n", "Find the Nth root of a number", "Koko Eating Bananas", "Minimum number of days to make M bouquets", "Find the smallest Divisor", "Capacity to Ship Packages within D Days", "Kth Missing Positive Number", "Aggressive Cows", "Book Allocation Problem", "Split array – Largest Sum", "Painter's Partition", "Minimize Max Distance to Gas Station", "Median of 2 sorted arrays", "K-th element of 2 sorted Arrays"] },
      { title: "BS on 2D Arrays", problems: ["Find the row with the maximum number of 1's", "Search in a 2D Matrix", "Search in a Row and Column wise sorted matrix", "Find Peak Element (2D Matrix)", "Matrix Median"] },
    ],
  },
  {
    step: "Step 5",
    name: "Strings",
    color: "#059669",
    accent: "#D1FAE5",
    topics: [
      { title: "Basic & Easy String Problems", problems: ["Remove Outermost Parentheses", "Reverse Words in a String", "Largest Odd Number in a String", "Longest Common Prefix", "Isomorphic Strings", "Check whether one string is a rotation of another", "Check if two strings are anagrams of each other"] },
      { title: "Medium String Problems", problems: ["Sort Characters by Frequency", "Maximum Nesting Depth of Parentheses", "Roman Number to Integer and vice versa", "Implement Atoi", "Count Number of Substrings", "Longest Palindromic Substring [DO NOT USE DP]", "Sum of Beauty of all Substrings", "Minimum number of bracket reversals needed to make an expression balanced"] },
      { title: "Hard String Problems", problems: ["Minimum number of operations to sort a Binary String", "Implement KMP algorithm / LPS array", "Shortest Palindrome", "Longest happy prefix", "String to Integer (atoi)"] },
    ],
  },
  {
    step: "Step 6",
    name: "Linked List",
    color: "#0891B2",
    accent: "#CFFAFE",
    topics: [
      { title: "1D LinkedList", problems: ["Introduction to LinkedList, learn about struct, create first linked list", "Inserting a node in LinkedList", "Deleting a node in LinkedList", "Find the length of the linkedlist [learn traversal]", "Search an element in the LL"] },
      { title: "Doubly LinkedList", problems: ["Introduction to DLL, learn about struct, create first DLL", "Insert a node in DLL", "Delete a node in DLL", "Reverse a DLL"] },
      { title: "Medium Problems of LL", problems: ["Middle of a LinkedList [TortoiseHare Method]", "Reverse a LinkedList [Iterative]", "Reverse a LL [Recursive]", "Detect a loop in LL", "Find the starting point in LL", "Length of Loop in LL", "Check if LL is palindrome or not", "Segrregate odd and even nodes in LL", "Remove Nth node from the back of the LL", "Delete the middle node of LL", "Sort LL", "Sort a LL of 0s, 1s and 2s by changing links", "Find the intersection point of Y LL", "Add 1 to a number represented by LL", "Add two numbers in LL"] },
      { title: "Hard Problems of LL", problems: ["Reverse LL in group of given size K", "Rotate a LL", "Flattening of LL", "Clone a Linked List with random and next pointer"] },
    ],
  },
  {
    step: "Step 7",
    name: "Recursion",
    color: "#BE185D",
    accent: "#FCE7F3",
    topics: [
      { title: "Get a Strong Hold", problems: ["Recursive implementation of atoi()", "Pow(x, n)", "Count Good numbers", "Sort a stack using recursion", "Reverse a stack using recursion"] },
      { title: "Subsequences Pattern", problems: ["Generate all binary strings", "Generate Parentheses", "Print all subsequences / Power Set", "Count all subsequences with sum K", "Check if there exists a subsequence with sum K", "Combination Sum", "Combination Sum II", "Subset Sum I", "Subset Sum II", "Combination Sum III"] },
      { title: "Trying out all Combos / Hard", problems: ["Letter Combinations of a Phone Number", "Palindrome Partitioning", "Word Search", "N Queen", "Rat in a Maze", "Word Break", "M Coloring Problem", "Sudoku Solver", "Expression Add Operators"] },
    ],
  },
  {
    step: "Step 8",
    name: "Bit Manipulation",
    color: "#D97706",
    accent: "#FEF3C7",
    topics: [
      { title: "Learn Bit Manipulation", problems: ["Introduction to Bit Manipulation", "Check if the i-th bit is set or not", "Check if a number is odd or not", "Check if a number is power of 2 or not", "Count the number of set bits", "Set/Unset the rightmost unset bit", "Swap two numbers", "Divide two integers without using multiplication, division and mod operator"] },
      { title: "Interview Problems", problems: ["Count number of bits to be flipped to convert A to B", "Find the number that appears odd number of times", "Power Set", "Find XOR of numbers from L to R", "Find the two numbers appearing odd number of times"] },
      { title: "Advanced Maths", problems: ["Print Prime Factors of a Number", "All Divisors of a Number", "Sieve of Eratosthenes", "Find Prime Factorisation of a Number using Sieve", "Power(n, m)"] },
    ],
  },
  {
    step: "Step 9",
    name: "Stack and Queues",
    color: "#4F46E5",
    accent: "#E0E7FF",
    topics: [
      { title: "Learning", problems: ["Implement stack using Arrays", "Implement Queue using Arrays", "Implement Stack using Queue", "Implement Queue using Stack", "Implement stack using Linked List", "Implement Queue using Linked List", "Check for balanced parenthesis", "Implement Min Stack"] },
      { title: "Prefix, Infix, PostFix Conversion Problems", problems: ["Infix to Postfix Conversion using Stack", "Prefix to Infix Conversion", "Prefix to Postfix Conversion", "Postfix to Prefix Conversion", "Postfix to Infix", "Convert Infix To Prefix Notation"] },
      { title: "Monotonic Stack/Queue Problems [VVV. Imp]", problems: ["Next Greater Element", "Next Greater Element 2", "Next Smaller Element", "Number of NGEs to the right", "Trapping Rainwater", "Sum of Subarray Minimums", "Asteroid Collision", "Sum of Subarray Ranges", "Remove k Digits", "Largest rectangle in a histogram", "Maximal Rectangles"] },
      { title: "Implementation Problems", problems: ["Sliding Window maximum", "Stock span problem", "The Celebrity Problem", "LRU cache (IMPORTANT)", "LFU cache"] },
    ],
  },
  {
    step: "Step 10",
    name: "Sliding Window & Two Pointer",
    color: "#0D9488",
    accent: "#CCFBF1",
    topics: [
      { title: "Medium Problems", problems: ["Longest Substring Without Repeating Characters", "Max Consecutive Ones III", "Fruit Into Baskets", "Longest repeating character replacement", "Binary subarray with sum", "Count number of nice subarrays", "Number of substring containing all three characters", "Maximum point you can obtain from cards"] },
      { title: "Hard Problems", problems: ["Longest Substring with At Most K Distinct Characters", "Subarray with k different integers", "Minimum Window Substring", "Minimum Window Subsequence"] },
    ],
  },
  {
    step: "Step 11",
    name: "Heaps",
    color: "#BE123C",
    accent: "#FFE4E6",
    topics: [
      { title: "Learning", problems: ["Introduction to Priority Queues using Binary Heaps", "Min Heap and Max Heap Implementation", "Check if an array represents a min-heap or not", "Convert min Heap to max Heap"] },
      { title: "Medium Problems", problems: ["Kth largest element in an array [use priority queue]", "Kth smallest element", "Sort K sorted array", "Merge M sorted Lists", "Replace each array element by its corresponding rank", "Task Scheduler", "Hands of Straights"] },
      { title: "Hard Problems", problems: ["Design Twitter", "Connect n ropes with minimum cost", "Kth largest element in a stream of running integers", "Maximum Sum Combination", "Find Median from Data Stream", "K most frequent elements", "Top K Frequent Words"] },
    ],
  },
  {
    step: "Step 12",
    name: "Greedy Algorithms",
    color: "#CA8A04",
    accent: "#FEF9C3",
    topics: [
      { title: "Easy Problems", problems: ["Assign Cookies", "Fractional Knapsack", "Greedy algorithm to find minimum number of coins", "Lemonade Change", "Valid Parenthesis String"] },
      { title: "Medium/Hard", problems: ["N meetings in one room", "Jump Game", "Jump Game 2", "Minimum number of platforms required for a railway", "Job Sequencing Problem", "Candy", "Shortest Job First", "Page Faults in LRU", "Insert Interval", "Non-overlapping Intervals", "Merge Intervals"] },
    ],
  },
  {
    step: "Step 13",
    name: "Binary Trees",
    color: "#2563EB",
    accent: "#DBEAFE",
    topics: [
      { title: "Traversals", problems: ["Introduction to Trees", "BFS / Level Order Traversal", "DFS Traversals (Inorder, Preorder, Postorder)", "Iterative Inorder Traversal of Binary Tree", "Iterative Preorder Traversal of Binary Tree", "Iterative Postorder Traversal (using 2 stacks)", "Iterative Postorder Traversal (using 1 stack)", "All Traversals in one"] },
      { title: "Medium Problems", problems: ["Height of a Binary Tree", "Check if the Binary tree is height-balanced or not", "Diameter of Binary Tree", "Maximum path sum", "Check if two trees are identical or not", "Zig Zag Traversal of Binary Tree", "Boundary Traversal of Binary Tree", "Vertical Order Traversal of Binary Tree", "Top View of Binary Tree", "Bottom View of Binary Tree", "Right/Left View of Binary Tree", "Symmetric Binary Tree"] },
      { title: "Hard Problems", problems: ["Root to Node Path in Binary Tree", "LCA in Binary Tree", "Maximum width of Binary Tree", "Check for Children Sum Property", "All Nodes Distance K in Binary Tree", "Minimum time taken to BURN the Binary Tree from a Node", "Count total Nodes in a COMPLETE Binary Tree", "Requirements needed to construct a Unique Binary Tree", "Construct Binary Tree from inorder and preorder", "Construct the Binary Tree from Postorder and Inorder Traversal", "Serialize and deserialize Binary Tree", "Morris Inorder Traversal of a Binary Tree", "Morris Preorder Traversal of a Binary Tree", "Flatten Binary Tree to LinkedList"] },
    ],
  },
  {
    step: "Step 14",
    name: "Binary Search Trees",
    color: "#7C3AED",
    accent: "#EDE9FE",
    topics: [
      { title: "Concepts", problems: ["Introduction to Binary Search Tree", "Search in a Binary Search Tree", "Find Min/Max in BST"] },
      { title: "Practice Problems", problems: ["Ceil in a Binary Search Tree", "Floor in a Binary Search Tree", "Insert a given Node in Binary Search Tree", "Delete a Node in Binary Search Tree", "Find K-th smallest/largest element in BST", "Check if a tree is a BST or BT", "LCA in Binary Search Tree", "Construct a BST from a preorder traversal", "Inorder Successor/Predecessor in BST", "BST iterator", "Two Sum In BST | Check if there exists a pair with Sum K", "Recover BST | Correct BST with two nodes swapped", "Largest BST in Binary Tree"] },
    ],
  },
  {
    step: "Step 15",
    name: "Graphs",
    color: "#0F766E",
    accent: "#CCFBF1",
    topics: [
      { title: "Learning", problems: ["Graph and Types", "BFS", "DFS", "Time Complexities"] },
      { title: "Problems on BFS/DFS", problems: ["Number of provinces (leetcode)", "Connected Components Problem in Matrix", "Rotten Oranges", "Flood fill", "Cycle Detection in unirected Graph (bfs)", "Cycle Detection in undirected Graph (dfs)", "01 Matrix", "Surrounded Regions", "Number of Enclaves", "Word ladder – 1", "Word ladder – 2", "Number of Distinct Islands", "Bipartite Check using BFS", "Bipartite Check using DFS"] },
      { title: "Topo Sort and Problems", problems: ["Topo Sort", "Kahn's Algorithm", "Cycle Detection in Directed Graph (BFS)", "Cycle Detection in Directed Graph (DFS)", "Course Schedule – I", "Course Schedule – II", "Find eventual safe states", "Alien dictionary"] },
      { title: "Shortest Path Algorithms and Problems", problems: ["Shortest Path in UG with unit weights", "Shortest Path in DAG", "Djikstra's Algorithm", "Why priority Queue is used in Dijkstra's Algorithm", "Shortest path in a binary maze", "Path with minimum effort", "Cheapest flights within k stops", "Network delay time", "Number of ways to arrive at destination", "Minimum steps to reach end from first in given Boolean Matrix", "Bellman Ford Algorithm", "Floyd Warshal Algorithm", "Find the city with the smallest number of neighbors"] },
      { title: "MinimumSpanning Tree/Disjoint Set and Problems", problems: ["MST using Prim's Algo", "Disjoint Set [Union by Rank]", "Disjoint Set [Union by Size]", "Kruskal's Algorithm", "Number of operations to make network connected", "Most stones removed with same rows or columns", "Accounts Merge", "Number of island II", "Making a Large Island", "Swim in rising water"] },
      { title: "Other Algorithms", problems: ["Bridges in Graph", "Articulation Point", "Kosaraju's Algorithm", "Tarjan's Algorithm"] },
    ],
  },
  {
    step: "Step 16",
    name: "Dynamic Programming",
    color: "#9333EA",
    accent: "#F3E8FF",
    topics: [
      { title: "Introduction to DP", problems: ["Dynamic Programming Introduction", "Memoization", "Tabulation", "Space Optimization"] },
      { title: "1D DP", problems: ["Climbing Stairs", "Frog Jump (DP 3)", "Frog Jump with K distances (DP 4)", "Maximum sum of non-adjacent elements", "House Robber", "House Robber 2"] },
      { title: "2D/3D DP and DP on Grids", problems: ["Ninja's Training", "Grid Unique Paths", "Grid Unique Paths 2", "Minimum path sum in Grid", "Minimum path sum in Triangular Grid", "Minimum/Maximum Falling Path Sum", "3d DP : Chocolate Pickup"] },
      { title: "DP on Subsequences", problems: ["Subset Sum equal to target", "Partition Equal Subset Sum", "Partition Set Into 2 Subsets With Min Absolute Sum Diff", "Count Subsets with Sum K", "Count Partitions with Given Difference", "0/1 Knapsack", "Minimum Coins", "Target Sum", "Coin Change 2", "Unbounded Knapsack", "Rod Cutting Problem"] },
      { title: "DP on Strings", problems: ["Longest Common Subsequence", "Print Longest Common Subsequence", "Longest Common Substring", "Longest Palindromic Subsequence", "Minimum insertions to make string palindrome", "Minimum Insertions/Deletions to Convert String", "Shortest Common Supersequence", "Number of Distinct Subsequences", "Edit Distance", "Wildcard Matching"] },
      { title: "DP on Stocks", problems: ["Best Time to Buy and Sell Stock", "Buy and Sell Stock – II", "Buy and Sell Stocks III", "Buy and Sell Stocks IV", "Buy and Sell Stocks With Cooldown", "Buy and Sell Stocks With Transaction Fee"] },
      { title: "DP on LIS", problems: ["Longest Increasing Subsequence (DP-41)", "Print Longest Increasing Subsequence", "Longest Increasing Subsequence (binary search)", "Longest Divisible Subset", "Longest String Chain", "Longest Bitonic Subsequence", "Number of LIS"] },
      { title: "MCM DP | Partition DP", problems: ["Matrix Chain Multiplication", "Matrix Chain Multiplication (Bottom-Up)", "Minimum Cost to Cut the Stick", "Burst Balloons", "Evaluate Boolean Expression to True", "Palindrome Partitioning – II", "Partition Array for Maximum Sum", "Maximum Rectangle Area with all 1's"] },
      { title: "DP on Squares", problems: ["Count Square Submatrices with All Ones", "Maximal Rectangle"] },
    ],
  },
  {
    step: "Step 17",
    name: "Tries",
    color: "#0369A1",
    accent: "#E0F2FE",
    topics: [
      { title: "Theory", problems: ["Implement TRIE – I [Insertion, Search, StartsWith]", "Implement Trie – II [Count distinct words, Count words equal to and starting with]"] },
      { title: "Problems", problems: ["Longest String with All Prefixes", "Number of Distinct Substrings in a String", "Bit PreRequisites for this Chapter [3 videos]", "Maximum XOR of two numbers in an array", "Maximum XOR With an Element From Array"] },
    ],
  },
]

const STORE_KEY = 'dsa_progress'

export default function DSAPrep({ session }) {
  const [progress, setProgress] = useState({})
  const [expanded, setExpanded] = useState({})
  const [loading, setLoading]   = useState(true)
  const [activeStep, setActiveStep] = useState(null)

  useEffect(() => { loadProgress() }, [])

  async function loadProgress() {
    const { data: { user } } = await supabase.auth.getUser()
    const saved = user?.user_metadata?.[STORE_KEY] || {}
    setProgress(saved)
    setLoading(false)
  }

  async function saveProgress(updated) {
    setProgress(updated)
    await supabase.auth.updateUser({ data: { [STORE_KEY]: updated } })
  }

  function problemKey(stepName, topicTitle, problem) {
    return `${stepName}__${topicTitle}__${problem}`
  }

  async function toggleProblem(key) {
    const updated = { ...progress, [key]: !progress[key] }
    await saveProgress(updated)
  }

  function getStepProgress(step) {
    let total = 0, done = 0
    step.topics.forEach(t => t.problems.forEach(p => {
      total++
      if (progress[problemKey(step.name, t.title, p)]) done++
    }))
    return { total, done, pct: total ? (done / total) * 100 : 0 }
  }

  function getTopicProgress(step, topic) {
    let done = 0
    topic.problems.forEach(p => {
      if (progress[problemKey(step.name, topic.title, p)]) done++
    })
    return { done, total: topic.problems.length }
  }

  function getTotalProgress() {
    let total = 0, done = 0
    DSA_SHEET.forEach(step => {
      step.topics.forEach(t => t.problems.forEach(p => {
        total++
        if (progress[problemKey(step.name, t.title, p)]) done++
      }))
    })
    return { total, done, pct: total ? (done / total) * 100 : 0 }
  }

  function toggleExpanded(key) {
    setExpanded(p => ({ ...p, [key]: !p[key] }))
  }

  if (loading) return (
    <div style={{ ...fredoka, fontSize: 20, color: P, padding: '3rem', textAlign: 'center' }}>Loading DSA sheet...</div>
  )

  const overall = getTotalProgress()
  const filteredSteps = activeStep !== null ? [DSA_SHEET[activeStep]] : DSA_SHEET

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ ...card, background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', border: 'none', boxShadow: '6px 6px 0 #0F0D2B' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ ...fredoka, fontSize: 26, color: '#fff', marginBottom: 4 }}>
              Striver's A2Z DSA Sheet 🚀
            </div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
              {overall.done} / {overall.total} problems solved
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ ...fredoka, fontSize: 38, color: '#A78BFA' }}>{Math.round(overall.pct)}%</div>
            <div style={{ width: 180, height: 10, borderRadius: 10, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, #818CF8, #A78BFA)', width: `${overall.pct}%`, transition: 'width .6s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Step filter pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setActiveStep(null)} style={{
          padding: '7px 16px', borderRadius: 20, border: '2px solid #C5C3E8', cursor: 'pointer',
          background: activeStep === null ? P : WH, color: activeStep === null ? WH : P,
          ...fredoka, fontSize: 13, boxShadow: activeStep === null ? '2px 2px 0 #1A1560' : '2px 2px 0 #C5C3E8',
          transition: 'all .15s',
        }}>All Steps</button>
        {DSA_SHEET.map((step, idx) => {
          const prog = getStepProgress(step)
          return (
            <button key={step.name} onClick={() => setActiveStep(activeStep === idx ? null : idx)} style={{
              padding: '7px 14px', borderRadius: 20, border: `2px solid ${step.color}`, cursor: 'pointer',
              background: activeStep === idx ? step.color : WH, color: activeStep === idx ? WH : step.color,
              ...fredoka, fontSize: 13, boxShadow: activeStep === idx ? `2px 2px 0 ${step.color}99` : `2px 2px 0 ${step.accent}`,
              transition: 'all .15s',
            }}>
              {step.step} {prog.pct === 100 ? '✅' : ''}
            </button>
          )
        })}
      </div>

      {/* Steps */}
      {filteredSteps.map((step) => {
        const prog = getStepProgress(step)
        const stepKey = step.name

        return (
          <div key={step.name} style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {/* Step Header */}
            <div onClick={() => toggleExpanded(stepKey)} style={{
              padding: '1.2rem 1.6rem', cursor: 'pointer',
              background: expanded[stepKey] ? step.accent : WH,
              transition: 'background .15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `3px 3px 0 ${step.color}55` }}>
                  <span style={{ ...fredoka, fontSize: 13, color: WH }}>{step.step.replace('Step ', '')}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ ...fredoka, fontSize: 17, color: step.color }}>{step.name}</span>
                    <span style={{ background: step.color, color: WH, borderRadius: 20, padding: '2px 10px', ...fredoka, fontSize: 12 }}>
                      {prog.done}/{prog.total}
                    </span>
                    {prog.pct === 100 && <span style={{ fontSize: 16 }}>🎉</span>}
                  </div>
                  <div style={{ height: 6, borderRadius: 6, background: step.accent, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 6, background: step.color, width: `${prog.pct}%`, transition: 'width .4s ease' }} />
                  </div>
                </div>
                <div style={{ ...fredoka, fontSize: 16, color: step.color, transform: expanded[stepKey] ? 'rotate(180deg)' : 'none', transition: 'transform .2s', marginLeft: 8 }}>▾</div>
              </div>
            </div>

            {/* Topics */}
            {expanded[stepKey] && (
              <div style={{ borderTop: `2px solid ${step.accent}` }}>
                {step.topics.map((topic, ti) => {
                  const topicProg = getTopicProgress(step, topic)
                  const topicKey = `${stepKey}__${topic.title}`
                  const isTopicOpen = expanded[topicKey]

                  return (
                    <div key={topic.title} style={{ borderBottom: ti < step.topics.length - 1 ? `2px solid ${step.accent}` : 'none' }}>
                      {/* Topic Header */}
                      <div onClick={() => toggleExpanded(topicKey)} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px 12px 24px',
                        cursor: 'pointer', background: isTopicOpen ? `${step.accent}66` : 'transparent',
                        transition: 'background .15s',
                      }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, color: step.color }}>{topic.title}</span>
                          <span style={{ background: topicProg.done === topicProg.total ? step.color : step.accent, color: topicProg.done === topicProg.total ? WH : step.color, borderRadius: 20, padding: '1px 9px', ...fredoka, fontSize: 12, border: `1px solid ${step.color}44` }}>
                            {topicProg.done}/{topicProg.total}
                          </span>
                        </div>
                        <div style={{ ...fredoka, fontSize: 14, color: step.color, transform: isTopicOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>›</div>
                      </div>

                      {/* Problems */}
                      {isTopicOpen && (
                        <div style={{ borderTop: `1.5px dashed ${step.accent}` }}>
                          {topic.problems.map((problem, pi) => {
                            const key = problemKey(step.name, topic.title, problem)
                            const done = !!progress[key]
                            return (
                              <div key={key} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '11px 20px 11px 36px',
                                borderBottom: pi < topic.problems.length - 1 ? `1px solid ${step.accent}55` : 'none',
                                background: done ? `${step.accent}44` : 'transparent',
                                transition: 'background .15s',
                                cursor: 'pointer',
                              }} onClick={() => toggleProblem(key)}>
                                {/* Checkbox */}
                                <div style={{
                                  width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                  border: `2.5px solid ${done ? step.color : '#C5C3E8'}`,
                                  background: done ? step.color : WH,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all .15s', boxShadow: done ? `2px 2px 0 ${step.color}66` : '2px 2px 0 #C5C3E8',
                                }}>
                                  {done && <svg width="10" height="8" viewBox="0 0 12 10"><path d="M1 5l3.5 3.5 6.5-7" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                </div>

                                {/* Problem number + name */}
                                <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 13.5, color: done ? '#9CA3AF' : '#2D2B6B', textDecoration: done ? 'line-through' : 'none', flex: 1, transition: 'all .15s' }}>
                                  <span style={{ color: done ? '#C5C3E8' : `${step.color}88`, fontSize: 11, marginRight: 6, fontWeight: 900 }}>#{pi + 1}</span>
                                  {problem}
                                </span>

                                {done && <span style={{ fontSize: 14 }}>✅</span>}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
