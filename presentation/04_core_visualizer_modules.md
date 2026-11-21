# Slide 4: Core Visualizer Modules

## Slide Meta
- **Slide Number:** 4 of 7
- **Estimated Timing:** 1:45 min
- **Key Theme:** Detailed breakdown of the 4 primary visualization suites

---

## Slide Content

### The Four Comprehensive Visualizer Suites

```
+---------------------------------------------------------------------------------------+
|                                    ALGOVIZ SUITE                                      |
+---------------------------+---------------------------+-------------------------------+
|  1. GRAPH VISUALIZER      |  2. TREE VISUALIZER       |  3. SORTING VISUALIZER        |
|  - Dijkstra's Algorithm   |  - Binary Search Tree     |  - Bubble, Selection, Insert  |
|  - BFS & DFS Traversal    |  - DFS (Pre/In/Postorder) |  - Merge Sort & Quick Sort    |
|  - Kruskal's & Prim's MST |  - BFS (Level Order)      |  - Heap Sort & Pivot Tracking |
|  - Bellman-Ford           |  - Insert, Delete, Search |  - Real-time Comps & Swaps    |
+---------------------------+---------------------------+-------------------------------+
|                               4. LINKED LIST VISUALIZER                               |
|  - Singly, Doubly & Circular Linked Lists                                             |
|  - Head / Tail / Index Operations  |  - In-Place Reversal  |  - Cycle Detection       |
+---------------------------------------------------------------------------------------+
```

---

### Module Deep-Dives

#### 1. Graph Visualizer
- **Interactive Canvas**: Click to place nodes, Shift-drag to create weighted directed/undirected edges.
- **Real-Time Data Overlays**: Live distance table updating dynamically during Dijkstra's algorithm.
- **Node State Tracking**: Unvisited (Slate), Frontier/Queue (Cyan), Current (Amber), Visited (Emerald).

#### 2. Tree Visualizer
- **BST Dynamic Tree Layout**: Automated coordinate calculation preventing branch overlaps.
- **Traversal Modes**: Visual demonstration of Preorder, Inorder, and Postorder recursion trees.
- **Search & Mutation**: Visual highlighting of binary comparison paths ($<$, $>$) down the tree.

#### 3. Sorting Visualizer
- **Bar Array & Multi-Color Coding**: Active comparison, swap state, pivot indicator, and sorted partition.
- **Sort Tree Visualization**: Hierarchical divide-and-conquer tree breakdown for recursive sorts (Merge/Quick).
- **Live Metrics**: Running counter of comparisons and swaps performed.

#### 4. Linked List Visualizer
- **Multi-Type Support**: Singly, Doubly (bidirectional pointers), and Circular linked lists.
- **Pointers in Motion**: Animated arrow redirection showing pointer re-assignment during in-place reversal.
- **Floyd's Algorithm**: Fast & Slow pointer (Tortoise and Hare) cycle detection demonstration.

---

## Speaker Script / Talking Points
> "ALGOVIZ is divided into four distinct visualizer suites, covering the most critical topics in computer science curricula:
> 
> First, the **Graph Visualizer**: this is a fully interactive canvas. You don't just pick a canned graph; you can click to drop vertices, shift-drag to wire up weighted edges, and run Dijkstra, Bellman-Ford, Prim's, or Kruskal's with live distance tables.
> 
> Second, our **Tree Visualizer**: supports full Binary Search Tree insertion, deletion, and searches, alongside animated Preorder, Inorder, Postorder, and BFS traversals with automated collision-free node layout.
> 
> Third, the **Sorting Visualizer**: covers both elementary sorts and divide-and-conquer powerhouses like Quick Sort and Merge Sort. It includes real-time comparison counters and a specialized 'Sort Tree' that illustrates recursion trees.
> 
> Finally, our **Linked List Visualizer**: handles Singly, Doubly, and Circular lists. It visually exposes pointer mutation during insertion, deletion, reversal, and Floyd's cycle detection. Each of these modules transforms a known stumbling block into an intuitive visual story."
