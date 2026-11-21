# ALGOVIZ

> **Interactive, Step-by-Step Visual Learning Platform for Data Structures & Algorithms**

ALGOVIZ is an educational web application designed to bridge the cognitive gap between abstract algorithmic syntax and dynamic runtime behavior. Instead of passively reading textbook pseudocode or watching static videos, ALGOVIZ provides an active, tactile sandbox where users can construct custom graphs, manipulate trees, inspect pointer mutations, and step through algorithms with line-by-line synchronized code highlighting.

---

## 🌟 Key Visualizer Modules

### 1. 🕸️ Graph Visualizer
- **Interactive Graph Editor:** Click on the canvas to add vertices; Shift-drag between nodes to create directed or undirected weighted edges.
- **Algorithms Supported:**
  - **Dijkstra's Algorithm** (Single-source shortest path with live distance table updates)
  - **Breadth-First Search (BFS)** & **Depth-First Search (DFS)**
  - **Bellman-Ford Algorithm** (Shortest path handling negative edge weights)
  - **Prim's & Kruskal's Minimum Spanning Tree (MST)**
- **Live Overlays:** Dynamic distance table, visited/frontier queues, and step-by-step plain-English narrative logs.
- **Graph Generator:** One-click random graph generation with configurable node counts.

### 2. 🌲 Tree Visualizer
- **Binary Search Tree (BST):** Interactive node insertion, value search, and node deletion.
- **Collision-Free Dynamic Layout:** Recursive spatial partitioning algorithm ensuring child branches never overlap regardless of tree depth.
- **Traversals with Animation:**
  - **DFS Traversals:** Preorder (Root-Left-Right), Inorder (Left-Root-Right), and Postorder (Left-Right-Root).
  - **BFS / Level-Order:** Queue-based row-by-row traversal.
- **Step Highlights:** Visual comparison indicators showing binary decision branches ($<$ vs $>$).

### 3. 📊 Sorting Visualizer
- **Algorithms Supported:**
  - **Comparison Sorts:** Bubble Sort, Selection Sort, Insertion Sort
  - **Divide-and-Conquer:** Merge Sort, Quick Sort (with active pivot tracking)
  - **Tree/Heap:** Heap Sort
- **State Highlights:** Color-coded array bars for active comparisons, swaps, pivot indices, and sorted partitions.
- **Live Metrics:** Real-time counters tracking total comparisons and swap operations.
- **Sort Tree View:** Visual breakdown of recursive divide-and-conquer calls.

### 4. 🔗 Linked List Visualizer
- **Multiple List Types:** Singly Linked Lists, Doubly Linked Lists (bidirectional pointers), and Circular Linked Lists.
- **Pointer Mutation Visualizer:** Animated pointer redirection for:
  - Insertion (at Head, Tail, or arbitrary Index)
  - Deletion (at Head, Tail, or arbitrary Index)
  - In-Place List Reversal with moving `prev`, `curr`, and `next` pointers
- **Cycle Detection:** Floyd's Tortoise and Hare algorithm with slow and fast pointers.

### 5. 📚 Learn Hub & Complexity Explorer
- Comprehensive algorithm theory cards covering:
  - Best, Average, and Worst-case **Time Complexity** ($O$-notation)
  - Auxiliary **Space Complexity**
  - Plain-English breakdown of core mechanics and edge cases
  - Formatted pseudocode and real-world system applications

---

## 🎮 The Synchronized Triad & Playback Engine

ALGOVIZ is built around a **Deterministic Timeline Architecture**:
1. **Visual Canvas:** Renders physical components (nodes, edges, array bars, list pointers) with fluid physics via Framer Motion.
2. **Synchronized Code Panel:** Automatically highlights the exact line of code that triggered each state transition.
3. **Floating Playback Pill:**
   - **Time-Travel Stepping:** Step forward or backward with $O(1)$ deterministic index navigation.
   - **Variable Speed Slider:** Continuous control from 0.25x micro-stepping up to 5x rapid execution.
   - **Play / Pause / Reset:** Instant timeline controls with zero state corruption.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite 8](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Custom dark surface design system)
- **Animation:** [Framer Motion 12](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Markdown & Math:** React Markdown with GFM support

---

## 📂 Project Structure

```text
ALGOVIZ/
├── src/
│   ├── algorithms/          # Pure ADT timeline builders (Graph, Tree, Sorting, LinkedList)
│   ├── components/          # Visualizer components
│   │   ├── GraphVisualizer.jsx
│   │   ├── TreeVisualizer.jsx
│   │   ├── SortingVisualizer.jsx
│   │   ├── LinkedListVisualizer.jsx
│   │   ├── CodePanel.jsx
│   │   └── ui/              # PlaybackPill, ParamPanel, VisualizerWorkspace
│   ├── models/              # Core data structure models (GraphModel, TreeModel, LinkedListModel)
│   ├── pages/               # HomePage, LearnPage
│   ├── data/                # Algorithm theory, pseudocode, and complexity metadata
│   ├── utils/               # SVG math, curve routing, syntax highlighting, color palettes
│   ├── App.jsx              # Application router & layout
│   └── main.jsx
├── presentation/            # 7-Slide presentation package (Interactive deck + Markdown + Script)
│   ├── index.html           # Full-screen interactive slide deck application
│   ├── 01_title_and_overview.md
│   ├── 02_problem_and_motivation.md
│   ├── 03_system_architecture_tech_stack.md
│   ├── 04_core_visualizer_modules.md
│   ├── 05_interactive_features_and_controls.md
│   ├── 06_engineering_challenges_and_solutions.md
│   ├── 07_impact_and_future_roadmap.md
│   ├── PRESENTATION_SCRIPT.md # Complete speaker talk track & defense Q&A
│   └── README.md
├── index.html
├── package.json
└── vite.config.js
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🎙️ Presentation Deck

A ready-to-present, 7-slide presentation deck is included in the [`presentation/`](./presentation/) directory:
- Open [`presentation/index.html`](./presentation/index.html) in any browser to launch the presentation deck.
- Use keyboard shortcuts: `→` (Next), `←` (Prev), `S` (Speaker Notes), `F` (Fullscreen).
- Refer to [`presentation/PRESENTATION_SCRIPT.md`](./presentation/PRESENTATION_SCRIPT.md) for full speaker notes and Q&A defense preparation.

---

## 📄 License

This project is licensed under the MIT License.
