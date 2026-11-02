export const ALGORITHMS = [
  
  
    // ==========================================
  // TREE ALGORITHMS
  // ==========================================
  {
    id: "tree-dfs",
    name: "DFS Traversals (Pre/In/Postorder)",
    category: "trees",
    complexity: "O(N)",
    summary: "Visit nodes before their children, between them, or after them.",
    timeComplexity: { best: "O(N)", average: "O(N)", worst: "O(N)" },
    spaceComplexity: "O(H) where H is tree height (call stack)",
    explanation: "A **tree** is made of nodes connected like branches. It starts at a top node called the **root**. In a binary tree, each node can have a left child and a right child.\n\nDepth-first search (DFS) follows one branch down as far as it can, then comes back and tries another. The three names describe when we visit a node compared with its children:\n\n* **Preorder: Root, Left, Right.** Visit a node first, then its left and right branches.\n* **Inorder: Left, Root, Right.** Visit the left branch, then the node, then the right branch. In a binary search tree, this gives values from smallest to largest.\n* **Postorder: Left, Right, Root.** Visit both branches before the node. This is useful when a parent needs results from its children, such as when calculating heights.\n\nFor example, if a node is `2`, with `1` on the left and `3` on the right, the orders are `2, 1, 3`; `1, 2, 3`; and `1, 3, 2`.",
    steps: [
      "Start at the root (the top node).",
      "If there is no node here, stop this branch and go back.",
      "For **Preorder**, record the node, then visit its left branch and its right branch.",
      "For **Inorder**, visit the left branch, record the node, then visit the right branch.",
      "For **Postorder**, visit both branches, then record the node."
    ],
    pseudocode: `// DFS Preorder Traversal
function preorder(node):
    if node is null:
        return
    visit(node.value)
    preorder(node.left)
    preorder(node.right)

// DFS Inorder Traversal
function inorder(node):
    if node is null:
        return
    inorder(node.left)
    visit(node.value)
    inorder(node.right)

// DFS Postorder Traversal
function postorder(node):
    if node is null:
        return
    postorder(node.left)
    postorder(node.right)
    visit(node.value)`
  },
  {
    id: "tree-bfs",
    name: "BFS (Level Order Traversal)",
    category: "trees",
    complexity: "O(N)",
    summary: "Visit the root, then its children, then the next row of the tree.",
    timeComplexity: { best: "O(N)", average: "O(N)", worst: "O(N)" },
    spaceComplexity: "O(W) where W is maximum level width",
    explanation: "Breadth-first search (BFS), also called level-order traversal, visits the tree one row at a time: the root first, then its children, then the next row. It uses a **queue**, which works like a line: the first node added is the first one visited.\n\nBecause nodes are handled in the order they are discovered, every parent is visited before its children. This is useful when you want to inspect or print the tree by rows.",
    steps: [
      "Make an empty queue (a first-in, first-out line).",
      "Add the root to the queue if the tree is not empty.",
      "While the queue has a node, take the node at the front.",
      "Record its value.",
      "Add its left child to the back of the queue, if it has one.",
      "Add its right child to the back of the queue, if it has one.",
      "Repeat until the queue is empty."
    ],
    pseudocode: `function levelOrder(root):
    if root is null:
        return
    
    let queue = new Queue()
    queue.enqueue(root)
    
    while queue is not empty:
        current = queue.dequeue()
        visit(current.value)
        
        if current.left is not null:
            queue.enqueue(current.left)
        if current.right is not null:
            queue.enqueue(current.right)`
  },
  {
    id: "tree-height-diameter",
    name: "Height & Diameter of a Tree",
    category: "trees",
    complexity: "O(N)",
    summary: "Find how tall the tree is and the longest route between any two nodes.",
    timeComplexity: { best: "O(N)", average: "O(N)", worst: "O(N)" },
    spaceComplexity: "O(H) recursion stack depth",
    explanation: "The **height** is the number of nodes on the longest route from the root down to a leaf (a node with no children). The **diameter** is the number of connections on the longest route between any two nodes. The route does not have to pass through the root. (Diameter is different from width: width counts how many nodes are on one row.)\n\nAt each node, the longest route that passes through it is the left branch height plus the right branch height. The algorithm checks this at every node and keeps the largest result. It works from the leaves upward so each parent can use the heights of its children.",
    steps: [
      "Set the longest route found so far to `0`.",
      "Start at the root and ask each node for the heights of its left and right branches.",
      "An empty branch has height `0`.",
      "At each node, add the left and right heights to get the longest route through it.",
      "Keep the largest route seen so far.",
      "Return the taller branch height plus `1` for the current node.",
      "When the walk is done, the root's height and the largest route are the answers."
    ],
    pseudocode: `let maxDiameter = 0

function calculateHeightAndDiameter(root):
    maxDiameter = 0
    getHeight(root)
    return maxDiameter

function getHeight(node):
    if node is null:
        return 0
        
    leftHeight = getHeight(node.left)
    rightHeight = getHeight(node.right)
    
    // Diameter through current node is leftHeight + rightHeight
    maxDiameter = max(maxDiameter, leftHeight + rightHeight)
    
    // Return node's height
    return max(leftHeight, rightHeight) + 1`
  },
  {
    id: "tree-lca",
    name: "Lowest Common Ancestor (LCA)",
    category: "trees",
    complexity: "O(N)",
    summary: "Find the closest shared ancestor of two nodes in the tree.",
    timeComplexity: { best: "O(N)", average: "O(N)", worst: "O(N)" },
    spaceComplexity: "O(H) recursion stack depth",
    explanation: "The **lowest common ancestor (LCA)** is the first node where the paths from two chosen nodes meet as you travel upward. For example, if nodes `4` and `5` sit under node `2`, their LCA is `2`. “Lowest” means the shared ancestor closest to the chosen nodes.\n\nThe search checks both branches. If one chosen node is found on the left and the other on the right, the current node is their LCA. If both are found in the same branch, the answer is farther down that branch. This version assumes both chosen nodes are in the tree.",
    steps: [
      "Start at the root and look for either chosen node.",
      "If the current node is empty or is one of the chosen nodes, return it.",
      "Search the left branch for either chosen node.",
      "Search the right branch for either chosen node.",
      "If each branch found one chosen node, the current node is their shared ancestor.",
      "If only one branch found a node, pass that result back up the tree."
    ],
    pseudocode: `function findLCA(root, p, q):
    // Base Cases
    if root is null or root == p or root == q:
        return root
        
    leftLCA = findLCA(root.left, p, q)
    rightLCA = findLCA(root.right, p, q)
    
    // If both left and right return non-null, this node is the LCA
    if leftLCA is not null and rightLCA is not null:
        return root
        
    // Otherwise, return the one that is not null
    return leftLCA if leftLCA is not null else rightLCA`
  },
  {
    id: "tree-path-sum",
    name: "Path Sum",
    category: "trees",
    complexity: "O(N)",
    summary: "Check whether a route from the root to a leaf adds up to the target.",
    timeComplexity: { best: "O(N)", average: "O(N)", worst: "O(N)" },
    spaceComplexity: "O(H) recursion stack depth",
    explanation: "This checks whether one complete route from the root to a leaf adds up to a chosen target. A **leaf** is a node with no children; stopping at an earlier node does not count.\n\nAs the search moves down a branch, it subtracts each node's value from the amount still needed. At a leaf, the route works if nothing is left to add. The search tries both branches until it finds a match or runs out of paths.",
    steps: [
      "Begin at the root with the full target amount.",
      "If the tree is empty, there is no matching route.",
      "Subtract the current node's value from the amount still needed.",
      "If this is a leaf (a node with no children), the route matches when the amount left is `0`.",
      "If it is not a leaf, continue down its left and right branches.",
      "Return true as soon as one complete route matches."
    ],
    pseudocode: `function hasPathSum(node, targetSum):
    if node is null:
        return false
        
    // Check if it is a leaf node
    if node.left is null and node.right is null:
        return targetSum == node.value
        
    remainingSum = targetSum - node.value
    
    // Recursively check subtrees
    return hasPathSum(node.left, remainingSum) or hasPathSum(node.right, remainingSum)`
  },
  {
    id: "tree-binary-lifting",
    name: "Binary Lifting",
    category: "trees",
    complexity: "O(N log N) / O(log N)",
    summary: "Save large upward jumps so ancestor and LCA questions take fewer steps.",
    timeComplexity: { best: "O(log N) per query", average: "O(log N) per query", worst: "O(log N) per query (O(N log N) preprocessing)" },
    spaceComplexity: "O(N log N) storage matrix",
    explanation: "Binary lifting is a way to answer “who is this node's ancestor?” questions quickly. Instead of saving only each node's parent, it also saves where you land after jumping up `2`, `4`, `8`, and more steps. These are called **power-of-two jumps**.\n\nFor example, to move up `13` levels, the algorithm can jump `8`, then `4`, then `1` instead of taking 13 separate steps. It builds the jump table once, then uses it to find an ancestor or the lowest common ancestor (LCA) with fewer lookups. The tradeoff is extra memory for the table.",
    steps: [
      "Walk through the tree and record each node's parent and depth (distance from the root).",
      "Save each node's parent as its one-step jump.",
      "Build larger jumps: a four-step jump is two two-step jumps, and so on.",
      "To move up `k` steps, combine the saved jumps that add up to `k`.",
      "To find an LCA, first move the deeper node up until both nodes are at the same depth.",
      "Then move both upward using the largest jumps that keep them apart. Their parent is the LCA."
    ],
    pseudocode: `// Preprocessing step
let up[MAX_NODES][LOG_N]
let depth[MAX_NODES]

function preprocess(root):
    dfs(root, null, 0)
    
    // Fill binary lifting table
    for i from 1 to LOG_N - 1:
        for each node u:
            ancestor = up[u][i-1]
            if ancestor is not null:
                up[u][i] = up[ancestor][i-1]
            else:
                up[u][i] = null

function dfs(node, parent, d):
    depth[node] = d
    up[node][0] = parent
    for each child in node.children:
        dfs(child, node, d + 1)

// Query LCA in O(log N)
function getLCA(u, v):
    if depth[u] < depth[v]:
        swap(u, v)
        
    // Lift u to the same level as v
    diff = depth[u] - depth[v]
    for i from 0 to LOG_N - 1:
        if (diff & (1 << i)) != 0:
            u = up[u][i]
            
    if u == v:
        return u
        
    // Lift both until they are just below LCA
    for i from LOG_N - 1 down to 0:
        if up[u][i] != up[v][i]:
            u = up[u][i]
            v = up[v][i]
            
    return up[u][0]`
  },

  // ==========================================
  // GRAPH ALGORITHMS
  // ==========================================
  {
    id: "graph-bfs",
    name: "Breadth-First Search (BFS)",
    category: "graphs",
    complexity: "O(V + E)",
    summary: "Explore nearby nodes first, moving outward from a starting node.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V) for queue and visited set",
    explanation: "A **graph** is a set of nodes joined by connections called edges. Breadth-first search (BFS) starts at one node and visits its direct neighbors before moving farther away. It uses a **queue**, like a line: the first node added is the first one explored.\n\nBFS finds a path with the fewest edges when every edge has the same cost (or the graph has no weights). If edges have different costs, use a weighted shortest-path algorithm instead.",
    steps: [
      "Make an empty queue and an empty list of visited nodes.",
      "Add the start node to both the queue and the visited list.",
      "While the queue has nodes, take the one at the front.",
      "Process that node.",
      "For each neighbor not yet visited, mark it visited and add it to the back of the queue.",
      "Continue until the queue is empty."
    ],
    pseudocode: `function BFS(Graph, start_node):
    let Q = new Queue()
    let visited = new Set()
    
    visited.add(start_node)
    Q.enqueue(start_node)
    
    while Q is not empty:
        curr = Q.dequeue()
        process(curr)
        
        for each neighbor in Graph.neighbors(curr):
            if neighbor is not in visited:
                visited.add(neighbor)
                Q.enqueue(neighbor)`
  },
  {
    id: "graph-dfs",
    name: "Depth-First Search (DFS)",
    category: "graphs",
    complexity: "O(V + E)",
    summary: "Follow one route as far as possible, then back up and try another.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V) recursion stack depth",
    explanation: "Depth-first search (DFS) follows one route as far as it can. When it reaches a dead end, it goes back to the last place with an unexplored connection and tries another route. A **visited** set remembers which nodes have already been seen, so the search does not get stuck going around a loop.\n\nDFS can use a stack (a last-in, first-out pile) or function calls to remember where to return. It is also a building block for finding cycles, ordering tasks, and grouping connected nodes.",
    steps: [
      "Start with an empty list of visited nodes.",
      "Choose a starting node and mark it visited.",
      "Process it, then choose one neighbor that has not been visited yet.",
      "Repeat the search from that neighbor, going as far as possible.",
      "When a node has no unvisited neighbors, go back and try another route.",
      "If some nodes remain unvisited, start again from one of them."
    ],
    pseudocode: `function DFS(Graph):
    let visited = new Set()
    for each node in Graph.vertices:
        if node not in visited:
            dfsHelper(node, visited, Graph)

function dfsHelper(node, visited, Graph):
    visited.add(node)
    process(node)
    
    for each neighbor in Graph.neighbors(node):
        if neighbor not in visited:
            dfsHelper(neighbor, visited, Graph)`
  },
  {
    id: "graph-topo",
    name: "Topological Sort (Kahn's Algorithm)",
    category: "graphs",
    complexity: "O(V + E)",
    summary: "Put dependent tasks in an order where every prerequisite comes first.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V) to store in-degrees and queue",
    explanation: "A topological order lines up tasks so each task comes after its prerequisites. For example, install a tool before using it. Connections must have a direction (prerequisite → task), and the graph must have no loops. Such a graph is called a **directed acyclic graph (DAG)**.\n\nKahn's algorithm starts with tasks that have no remaining prerequisites. It adds one to the list, removes its outgoing connections, then adds any newly unblocked tasks. If some tasks are still blocked at the end, the graph contains a loop, so no valid order exists.",
    steps: [
      "Count how many prerequisites point to each task.",
      "Put every task with no prerequisites into a queue.",
      "Take one ready task from the queue and add it to the result.",
      "Remove that task's prerequisite links from the tasks that depend on it.",
      "When a task has no prerequisites left, add it to the queue.",
      "Repeat until no task is ready.",
      "If every task was added, the result is a valid order. If not, some tasks depend on each other in a loop."
    ],
    pseudocode: `function KahnTopologicalSort(Graph):
    in_degree = array of size V, initialized to 0
    let order = []
    let Q = new Queue()
    
    // Step 1: Calculate in-degrees
    for each vertex u in Graph:
        for each neighbor v in Graph.neighbors(u):
            in_degree[v] = in_degree[v] + 1
            
    // Step 2: Enqueue nodes with in-degree 0
    for each vertex u in Graph:
        if in_degree[u] == 0:
            Q.enqueue(u)
            
    // Step 3: Process the queue
    while Q is not empty:
        u = Q.dequeue()
        order.push(u)
        
        for each neighbor v in Graph.neighbors(u):
            in_degree[v] = in_degree[v] - 1
            if in_degree[v] == 0:
                Q.enqueue(v)
                
    if order.length < Graph.vertices.length:
        return "Cycle detected: Topological sort impossible!"
    return order`
  },
  {
    id: "graph-cycle",
    name: "Cycle Detection (Directed & Undirected)",
    category: "graphs",
    complexity: "O(V + E)",
    summary: "Check whether following connections can lead back to a node already on the route.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V) for recursion call stack and states",
    explanation: "A **cycle** is a route that returns to a node it has already reached. The check uses depth-first search, but the rule depends on whether connections have arrows:\n\n* **With directed edges**, a cycle exists if an arrow leads back to a node still on the current search route.\n* **Without directed edges**, seeing a visited neighbor means a cycle only when that neighbor is not the node we just came from. This parent check avoids mistaking the way back along the same connection for a cycle.\n\nThe search starts again at each unvisited node, so disconnected parts of the graph are checked too.",
    steps: [
      "**For Directed Graphs**:",
      "Maintain a `visited` set and a `recursionStack` set.",
      "For each node, if unvisited, call `dfsDirected(node)`.",
      "In `dfsDirected(node)`: Add the node to `visited` and `recursionStack`. For each neighbor, if unvisited, recurse. If visited and present in `recursionStack`, return `true` (cycle detected). Remove the node from `recursionStack` before backtracking.",
      "**For Undirected Graphs**:",
      "Maintain a `visited` set.",
      "For each node, if unvisited, call `dfsUndirected(node, parent = null)`.",
      "In `dfsUndirected(node, parent)`: Add the node to `visited`. For each neighbor, if unvisited, recurse with `dfsUndirected(neighbor, node)`. If visited and neighbor is not the `parent`, return `true` (cycle detected)."
    ],
    pseudocode: `// DIRECTED GRAPH CYCLE DETECTION
function detectCycleDirected(Graph):
    visited = new Set()
    recStack = new Set()
    for each node in Graph.vertices:
        if node not in visited:
            if dfsDirected(node, visited, recStack, Graph):
                return true
    return false

function dfsDirected(u, visited, recStack, Graph):
    visited.add(u)
    recStack.add(u)
    
    for each v in Graph.neighbors(u):
        if v not in visited:
            if dfsDirected(v, visited, recStack, Graph):
                return true
        else if v in recStack:
            return true // Back-edge found!
            
    recStack.delete(u)
    return false

// UNDIRECTED GRAPH CYCLE DETECTION
function detectCycleUndirected(Graph):
    visited = new Set()
    for each node in Graph.vertices:
        if node not in visited:
            if dfsUndirected(node, null, visited, Graph):
                return true
    return false

function dfsUndirected(u, parent, visited, Graph):
    visited.add(u)
    
    for each v in Graph.neighbors(u):
        if v not in visited:
            if dfsUndirected(v, u, visited, Graph):
                return true
        else if v != parent:
            return true // Found cross-edge back to ancestor!
    return false`
  },
  {
    id: "graph-dsu",
    name: "Disjoint Set Union (DSU)",
    category: "graphs",
    complexity: "O(α(V))",
    summary: "Keep track of groups: check whether two items share a group or join their groups.",
    timeComplexity: { best: "O(α(V))", average: "O(α(V))", worst: "O(α(V)) where α is the Inverse Ackermann function" },
    spaceComplexity: "O(V) parent and rank arrays",
    explanation: "Disjoint Set Union (DSU), also called **Union-Find**, keeps items in separate groups. It answers two questions: “Which group is this item in?” (**Find**) and “Join these two groups” (**Union**).\n\nEach group is represented by one root item. To keep lookups fast, DSU uses two shortcuts: **path compression** makes items point closer to the root after a lookup, and **union by size/rank** attaches the smaller group under the larger one.\n\nIt is useful when connections are added over time, such as checking whether a new edge would join nodes that are already connected.",
    steps: [
      "Start with every item in its own group.",
      "To find an item's group, follow its parent links until you reach the group's representative.",
      "Shorten the route by connecting items closer to the representative.",
      "To join two groups, first find their representatives.",
      "If the representatives are already the same, the items are already in one group.",
      "Otherwise, connect the smaller group under the larger group."
    ],
    pseudocode: `class DSU:
    parent = array of size V
    rank = array of size V
    
    function makeSet(n):
        for i from 0 to n - 1:
            parent[i] = i
            rank[i] = 0
            
    function find(i):
        if parent[i] == i:
            return i
        // Path Compression
        parent[i] = find(parent[i])
        return parent[i]
        
    function union(i, j):
        root_i = find(i)
        root_j = find(j)
        
        if root_i != root_j:
            // Union by Rank
            if rank[root_i] < rank[root_j]:
                parent[root_i] = root_j
            else if rank[root_i] > rank[root_j]:
                parent[root_j] = root_i
            else:
                parent[root_j] = root_i
                rank[root_i] = rank[root_i] + 1
            return true // Merged successfully
        return false // Already in the same set`
  },
  {
    id: "graph-kruskal",
    name: "Kruskal's MST Algorithm",
    category: "graphs",
    complexity: "O(E log E)",
    summary: "Connect all nodes as cheaply as possible, adding the lightest safe edge first.",
    timeComplexity: { best: "O(E log E)", average: "O(E log E)", worst: "O(E log E) or O(E log V)" },
    spaceComplexity: "O(V + E) for DSU and sorting data",
    explanation: "Kruskal's algorithm finds a **minimum spanning tree**: the cheapest set of edges that connects every node without making a cycle. It applies to an undirected graph with edge costs.\n\nFirst, sort all edges from cheapest to most expensive. Then consider them in that order. Keep an edge if it connects two groups that are not connected yet; skip it if it would create a loop. DSU helps check this quickly. A connected graph's spanning tree has exactly one fewer edge than nodes. If the graph is disconnected, the same process gives a minimum spanning forest instead.",
    steps: [
      "Initialize an empty list `MST`.",
      "Create a DSU structure for all vertices in the graph.",
      "Sort all graph edges in non-decreasing order of their weights.",
      "Iterate through sorted edges. For each edge `(u, v, weight)`:",
      "Find the root sets of `u` and `v` using DSU: `Find(u)` and `Find(v)`.",
      "If the roots are different, add the edge to `MST` and merge the sets using DSU: `Union(u, v)`.",
      "If roots match, skip the edge as adding it would form a cycle.",
      "Stop when `MST` contains $V - 1$ edges or all edges are evaluated."
    ],
    pseudocode: `function KruskalMST(Graph):
    let MST = []
    let dsu = new DSU()
    dsu.makeSet(Graph.vertices.length)
    
    // Sort edges by weight ascending
    sorted_edges = sort(Graph.edges by edge.weight)
    
    for each edge (u, v, weight) in sorted_edges:
        if dsu.find(u) != dsu.find(v):
            dsu.union(u, v)
            MST.push(edge)
            
            if MST.length == Graph.vertices.length - 1:
                break
                
    return MST`
  },
  {
    id: "graph-prim",
    name: "Prim's MST Algorithm",
    category: "graphs",
    complexity: "O(E log V)",
    summary: "Grow a cheapest connecting tree from one node, choosing the lowest-cost link next.",
    timeComplexity: { best: "O(E log V)", average: "O(E log V)", worst: "O(E log V) using a binary heap" },
    spaceComplexity: "O(V) key and parent tables",
    explanation: "Prim's algorithm builds a **minimum spanning tree** by growing one connected group. Start at any node. Each time, choose the cheapest edge that reaches a node outside the group, then add that node. Stop when every node is included.\n\nThe result connects all nodes with the lowest possible total edge cost and no cycles. This version assumes the graph is undirected and connected. A priority queue helps quickly choose the cheapest next edge.",
    steps: [
      "Initialize arrays `key` of size V (filled with infinity) and `parent` (filled with null).",
      "Set `key[start] = 0`.",
      "Create a min-priority queue `PQ` containing pairs of `(node, key[node])`.",
      "While `PQ` is not empty:",
      "Extract the node `u` with the minimum key value.",
      "Mark `u` as included in the MST.",
      "For each neighbor `v` of `u` with edge weight `w`:",
      "If `v` is not yet in the MST and `w < key[v]`:",
      "Update `key[v] = w`, `parent[v] = u`, and decrease `v`'s priority in the queue."
    ],
    pseudocode: `function PrimMST(Graph, start):
    let key = array of size V, filled with Infinity
    let parent = array of size V, filled with null
    let inMST = array of size V, filled with false
    let PQ = new MinPriorityQueue() // stores pairs of (node, key_value)
    
    key[start] = 0
    PQ.insert(start, 0)
    
    while PQ is not empty:
        u = PQ.extractMin()
        inMST[u] = true
        
        for each (v, weight) in Graph.adj(u):
            if inMST[v] == false and weight < key[v]:
                key[v] = weight
                parent[v] = u
                if PQ.contains(v):
                    PQ.decreaseKey(v, weight)
                else:
                    PQ.insert(v, weight)
                    
    return parent // Describes the MST connections`
  },
  {
    id: "graph-dijkstra",
    name: "Dijkstra's Shortest Path",
    category: "graphs",
    complexity: "O((V + E) log V)",
    summary: "Find the cheapest route from one starting node when edge costs are not negative.",
    timeComplexity: { best: "O((V + E) log V)", average: "O((V + E) log V)", worst: "O((V + E) log V) with binary heap" },
    spaceComplexity: "O(V) distance and predecessor arrays",
    explanation: "Dijkstra's algorithm finds the cheapest route from one starting node to every other reachable node. Each connection can have a cost, such as distance or time, but the costs must be **zero or positive**. Negative costs can make Dijkstra give the wrong answer.\n\nThe algorithm keeps the best route found so far to each node. It repeatedly picks the reachable node with the smallest known cost, then checks whether going through it gives a cheaper route to its neighbors. If so, it updates those routes.",
    steps: [
      "Initialize an array `dist` of size V filled with infinity, and `dist[source] = 0`.",
      "Initialize an array `parent` of size V filled with null.",
      "Create a min-priority queue `PQ` and insert `(source, 0)`.",
      "While `PQ` is not empty:",
      "Extract the node `u` with the minimum distance `d`.",
      "If `d > dist[u]`, skip (obsolete entry).",
      "For each neighbor `v` of `u` connected by an edge of weight `w`:",
      "If `dist[u] + w < dist[v]` (edge relaxation):",
      "Update `dist[v] = dist[u] + w`, set `parent[v] = u`, and insert `(v, dist[v])` into `PQ`."
    ],
    pseudocode: `function Dijkstra(Graph, source):
    let dist = array of size V, filled with Infinity
    let parent = array of size V, filled with null
    let PQ = new MinPriorityQueue() // stores (node, distance)
    
    dist[source] = 0
    PQ.insert(source, 0)
    
    while PQ is not empty:
        (u, d) = PQ.extractMin()
        
        if d > dist[u]:
            continue // Skip outdated queue records
            
        for each (v, weight) in Graph.adj(u):
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                parent[v] = u
                PQ.insert(v, dist[v])
                
    return dist, parent`
  },
  {
    id: "graph-bellman",
    name: "Bellman-Ford Shortest Path",
    category: "graphs",
    complexity: "O(V * E)",
    summary: "Find cheapest routes with negative edge costs and detect reachable negative-cost loops.",
    timeComplexity: { best: "O(E)", average: "O(V * E)", worst: "O(V * E)" },
    spaceComplexity: "O(V) distance array",
    explanation: "Bellman-Ford finds the cheapest routes from one starting node. Unlike Dijkstra's algorithm, it can handle edges with negative costs.\n\nIt makes repeated passes over every edge, improving a route whenever it finds a cheaper way to reach the next node. After at most `number of nodes − 1` passes, the best routes are known if there is no reachable negative-cost loop. One extra pass checks for such a loop: if a route can still get cheaper, no finite cheapest route exists for the affected nodes.",
    steps: [
      "Initialize an array `dist` of size V filled with infinity, and `dist[source] = 0`.",
      "Perform $V-1$ iterations. In each iteration, relax all edges in the graph:",
      "For each edge `(u, v, weight)`: If `dist[u] + weight < dist[v]`, update `dist[v] = dist[u] + weight`.",
      "If an iteration occurs where no distances change, terminate early (optimization).",
      "After $V-1$ rounds, check all edges one last time. For each edge `(u, v, weight)`:",
      "If `dist[u] + weight < dist[v]`, throw an error or return: 'Graph contains a negative weight cycle!'."
    ],
    pseudocode: `function BellmanFord(Graph, source):
    let dist = array of size V, filled with Infinity
    dist[source] = 0
    
    // Relax all edges V - 1 times
    for round from 1 to V - 1:
        any_change = false
        for each edge (u, v, weight) in Graph.edges:
            if dist[u] != Infinity and dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                any_change = true
        if not any_change:
            break // Optimization: stop early if no updates
            
    // Check for negative-weight cycles
    for each edge (u, v, weight) in Graph.edges:
        if dist[u] != Infinity and dist[u] + weight < dist[v]:
            return "Error: Negative weight cycle detected!"
            
    return dist`
  },
  {
    id: "graph-kosaraju",
    name: "Kosaraju's SCC Algorithm",
    category: "graphs",
    complexity: "O(V + E)",
    summary: "Group nodes when each node in a group can follow arrows to reach every other one.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V + E) for transposed graph and stack",
    explanation: "Kosaraju's algorithm finds **strongly connected components** in a directed graph. A component is a group where every node can follow arrows to reach every other node in that group.\n\nIt makes two depth-first searches. The first records nodes after all their reachable neighbors have been explored. Then the algorithm reverses every arrow and explores nodes in the recorded order, starting with the ones that finished last. Each new search collects one component. Reversing the arrows helps keep each group separate.",
    steps: [
      "Initialize an empty stack `S` and a `visited` set.",
      "For each node, if unvisited, run `DFS1(node)` which recursively visits neighbors and pushes `node` to `S` only after processing all neighbors.",
      "Compute the transpose graph $G^T$ by reversing all directed edges.",
      "Clear the `visited` set.",
      "While `S` is not empty:",
      "Pop a node `curr` from `S`.",
      "If `curr` is not visited, it marks the start of a new SCC. Run `DFS2(curr)` on the transpose graph $G^T$. All nodes reached during this DFS belong to the same SCC."
    ],
    pseudocode: `function KosarajuSCC(Graph):
    let S = new Stack()
    let visited = new Set()
    
    // Pass 1: Order vertices by finishing times
    for each node in Graph.vertices:
        if node not in visited:
            dfs1(node, visited, S, Graph)
            
    // Pass 2: Reverse graph
    let transposedGraph = transpose(Graph)
    visited.clear()
    let SCCs = []
    
    // Pass 3: Process stack nodes on transposed graph
    while S is not empty:
        u = S.pop()
        if u not in visited:
            let currentSCC = []
            dfs2(u, visited, currentSCC, transposedGraph)
            SCCs.push(currentSCC)
            
    return SCCs

function dfs1(u, visited, S, Graph):
    visited.add(u)
    for each v in Graph.neighbors(u):
        if v not in visited:
            dfs1(v, visited, S, Graph)
    S.push(u) // Push to stack after visiting all descendants

function dfs2(u, visited, sccList, transposedGraph):
    visited.add(u)
    sccList.push(u)
    for each v in transposedGraph.neighbors(u):
        if v not in visited:
            dfs2(v, visited, sccList, transposedGraph)`
  },
  {
    id: "graph-tarjan",
    name: "Tarjan's Bridges & Articulation Points",
    category: "graphs",
    complexity: "O(V + E)",
    summary: "Find links and nodes whose removal would split an undirected network apart.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V) for discovery and low arrays",
    explanation: "This search finds weak spots in an undirected network. A **bridge** is a connection whose removal splits one connected area into two. An **articulation point** is a node whose removal splits the area.\n\nDuring one depth-first search, each node records when it was first reached and the earliest visited node its branch can get back to using another connection. If a child branch cannot get back to its parent or any earlier node, their connecting edge is a bridge. A parent is an articulation point when a child branch cannot get around it. The root has a special rule: it is an articulation point only if it has more than one DFS child.",
    steps: [
      "Initialize `dfn` (discovery time) and `low` arrays with 0, and a global `timer = 0`.",
      "Initialize empty lists/sets for `bridges` and `articulationPoints`.",
      "For each unvisited node, call `dfsTarjan(u, parentNode = null)`.",
      "In `dfsTarjan(u, parent)`: Increment `timer`, set `dfn[u] = low[u] = timer`. Count DFS `children` of `u`.",
      "For each neighbor `v` of `u` (ignoring parent edge):",
      "If `v` is visited: Update `low[u] = min(low[u], dfn[v])` (back-edge found).",
      "If `v` is unvisited: Recursively call `dfsTarjan(v, u)`, then update `low[u] = min(low[u], low[v])` after backtrack.",
      "**Bridge Condition**: If `low[v] > dfn[u]`, the edge `(u, v)` is a bridge.",
      "**Articulation Condition**: If `u` is not DFS root and `low[v] >= dfn[u]`, node `u` is an articulation point.",
      "**Root Condition**: If `u` is DFS root and has `children > 1`, node `u` is an articulation point."
    ],
    pseudocode: `let timer = 0
let dfn = array of size V, filled with 0
let low = array of size V, filled with 0
let visited = new Set()
let bridges = []
let articulationPoints = new Set()

function findBridgesAndArticulations(Graph):
    timer = 0
    visited.clear()
    bridges = []
    articulationPoints.clear()
    
    for each node in Graph.vertices:
        if node not in visited:
            dfsTarjan(node, null, Graph)
    return bridges, articulationPoints

function dfsTarjan(u, parent, Graph):
    visited.add(u)
    timer = timer + 1
    dfn[u] = low[u] = timer
    let children = 0
    
    for each v in Graph.neighbors(u):
        if v == parent:
            continue
            
        if v in visited:
            // Back-edge
            low[u] = min(low[u], dfn[v])
        else:
            // Forward-edge (Tree-edge)
            children = children + 1
            dfsTarjan(v, u, Graph)
            
            // On backtrack, update low
            low[u] = min(low[u], low[v])
            
            // 1. Check for Bridge
            if low[v] > dfn[u]:
                bridges.push((u, v))
                
            // 2. Check for Articulation Point (Non-root)
            if parent is not null and low[v] >= dfn[u]:
                articulationPoints.add(u)
                
    // 3. Check for Articulation Point (Root)
    if parent is null and children > 1:
        articulationPoints.add(u)`
  },

  // ==========================================
  // SORTING ALGORITHMS
  // ==========================================
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    category: "sorting",
    complexity: "O(N²)",
    summary: "Repeatedly steps through the array, swapping adjacent elements if they are in the wrong order.",
    timeComplexity: { best: "O(N)", average: "O(N²)", worst: "O(N²)" },
    spaceComplexity: "O(1)",
    explanation: "Bubble Sort iterates through the array multiple times. In each pass, adjacent elements are compared and swapped if out of order. The largest unsorted element 'bubbles up' to its correct position at the end of the array. With N elements, up to N-1 passes are needed. An early exit optimization stops early if no swaps occur in a pass.\n\nWhile simple to understand, Bubble Sort is impractical for large datasets due to its O(N²) average time complexity.",
    steps: [
      "Start with the unsorted array of size N.",
      "For each pass i from 0 to N-2:",
      "  For each adjacent pair (j, j+1) from 0 to N-2-i:",
      "    Compare arr[j] and arr[j+1].",
      "    If arr[j] > arr[j+1], swap them (bubble up).",
      "After pass i, the element at index N-1-i is in its final sorted position.",
      "Repeat until the entire array is sorted."
    ],
    pseudocode: `function bubbleSort(arr):
    n = arr.length
    for i = 0 to n-2:
        for j = 0 to n-2-i:
            if arr[j] > arr[j+1]:
                swap(arr[j], arr[j+1])
    return arr`
  },
  {
    id: "selection-sort",
    name: "Selection Sort",
    category: "sorting",
    complexity: "O(N²)",
    summary: "Repeatedly selects the smallest element from the unsorted portion and swaps it to the front.",
    timeComplexity: { best: "O(N²)", average: "O(N²)", worst: "O(N²)" },
    spaceComplexity: "O(1)",
    explanation: "Selection Sort divides the array into a sorted and unsorted region. It scans the unsorted region to find the minimum element, then swaps it with the element at the boundary (the first unsorted position). The boundary then shifts right by one. This process repeats until the entire array is sorted.\n\nSelection Sort is notable for minimizing swaps — at most N-1 swaps — making it useful when writes are expensive.",
    steps: [
      "Set boundary i = 0 (start of unsorted region).",
      "Find the index of the minimum element in arr[i..N-1].",
      "Swap arr[i] with the found minimum.",
      "Increment i (expand sorted region).",
      "Repeat until i reaches N-1."
    ],
    pseudocode: `function selectionSort(arr):
    n = arr.length
    for i = 0 to n-2:
        minIdx = i
        for j = i+1 to n-1:
            if arr[j] < arr[minIdx]:
                minIdx = j
        swap(arr[i], arr[minIdx])
    return arr`
  },
  {
    id: "insertion-sort",
    name: "Insertion Sort",
    category: "sorting",
    complexity: "O(N²)",
    summary: "Builds the sorted array one element at a time by inserting each element into its correct position.",
    timeComplexity: { best: "O(N)", average: "O(N²)", worst: "O(N²)" },
    spaceComplexity: "O(1)",
    explanation: "Insertion Sort builds the final sorted array one element at a time. It picks each element from the input and inserts it into its proper position among the already-sorted elements, shifting larger elements to the right as needed.\n\nInsertion Sort is efficient for small datasets and is adaptive (runs in O(N) on nearly-sorted arrays). It is often used as the base case in hybrid sorting algorithms like Timsort.",
    steps: [
      "Consider the first element as trivially sorted.",
      "Pick the next element (key) from the unsorted region.",
      "Compare the key with elements in the sorted region (right to left).",
      "Shift all larger elements one position to the right.",
      "Insert the key into the vacant position.",
      "Repeat until all elements have been inserted."
    ],
    pseudocode: `function insertionSort(arr):
    n = arr.length
    for i = 1 to n-1:
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j--
        arr[j + 1] = key
    return arr`
  },
  {
    id: "merge-sort",
    name: "Merge Sort",
    category: "sorting",
    complexity: "O(N log N)",
    summary: "A divide-and-conquer algorithm that recursively splits the array, sorts each half, and merges them back together.",
    timeComplexity: { best: "O(N log N)", average: "O(N log N)", worst: "O(N log N)" },
    spaceComplexity: "O(N)",
    explanation: "Merge Sort is a stable, divide-and-conquer sorting algorithm. It recursively divides the input array into two halves until each sub-array has a single element (trivially sorted). Then it repeatedly merges adjacent pairs, combining two sorted sub-arrays into one sorted array.\n\nThe merge step uses two pointers and a temporary array. Merge Sort is the foundation for more advanced algorithms like Timsort. Its O(N) space requirement is the main drawback.",
    steps: [
      "If the array has 0 or 1 elements, it is already sorted (base case).",
      "Split the array into two halves at the midpoint.",
      "Recursively sort the left half.",
      "Recursively sort the right half.",
      "Merge the two sorted halves back together using a two-pointer technique.",
      "Copy the merged result back into the original array."
    ],
    pseudocode: `function mergeSort(arr, l, r):
    if l >= r: return
    m = (l + r) / 2
    mergeSort(arr, l, m)
    mergeSort(arr, m+1, r)
    merge(arr, l, m, r)

function merge(arr, l, m, r):
    L = arr[l..m], R = arr[m+1..r]
    i = j = 0, k = l
    while i < L.length and j < R.length:
        if L[i] <= R[j]:
            arr[k++] = L[i++]
        else:
            arr[k++] = R[j++]
    while i < L.length: arr[k++] = L[i++]
    while j < R.length: arr[k++] = R[j++]`
  },
  {
    id: "quick-sort",
    name: "Quick Sort",
    category: "sorting",
    complexity: "O(N log N) avg",
    summary: "Picks a pivot, partitions the array around it, then recursively sorts the partitions.",
    timeComplexity: { best: "O(N log N)", average: "O(N log N)", worst: "O(N²)" },
    spaceComplexity: "O(log N) (call stack)",
    explanation: "Quick Sort is a divide-and-conquer algorithm that selects a 'pivot' element and partitions the array so that elements smaller than the pivot go to the left and larger elements go to the right. The pivot is then in its final sorted position. The process recurses on the left and right partitions.\n\nPerformance depends heavily on pivot selection. Using a random or median-of-three pivot reduces the probability of worst-case behavior. Quick Sort is generally faster than Merge Sort in practice due to better cache locality and in-place partitioning.",
    steps: [
      "Choose a pivot element (typically the last element).",
      "Initialize a partition boundary pointer i.",
      "Scan from low to high-1: if arr[j] < pivot, swap arr[++i] with arr[j].",
      "Place the pivot at its correct position (swap arr[i+1] with arr[high]).",
      "Recursively sort the left partition (low to pivotIdx-1).",
      "Recursively sort the right partition (pivotIdx+1 to high)."
    ],
    pseudocode: `function quickSort(arr, low, high):
    if low >= high: return
    pi = partition(arr, low, high)
    quickSort(arr, low, pi-1)
    quickSort(arr, pi+1, high)

function partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j = low to high-1:
        if arr[j] < pivot:
            i++
            swap(arr[i], arr[j])
    swap(arr[i+1], arr[high])
    return i + 1`
  },
  {
    id: "radix-sort",
    name: "Radix Sort",
    category: "sorting",
    complexity: "O(D × (N + K))",
    summary: "Sorts numbers digit-by-digit from the least significant digit to the most significant digit.",
    timeComplexity: { best: "O(D × (N + K))", average: "O(D × (N + K))", worst: "O(D × (N + K))" },
    spaceComplexity: "O(N + K)",
    explanation: "Radix Sort is a non-comparison-based sorting algorithm that processes digits individually. Starting from the least significant digit (LSD), it applies a stable counting sort on each digit position. After D passes (where D is the maximum number of digits), the array is fully sorted.\n\nRadix Sort is efficient when the number of digits is small relative to N. For example, sorting 1 million 32-bit integers requires only 4 passes (one per byte). The choice of base (radix) affects performance — powers of 2 (256) are common for binary computers.",
    steps: [
      "Find the maximum value to determine the number of digits (D).",
      "For each digit position (exp = 1, 10, 100, ... up to the max digit):",
      "  Apply a stable counting sort based on the current digit (arr[i] / exp) % 10.",
      "  Build a count array for digits 0-9.",
      "  Compute prefix sums.",
      "  Place elements in the output array in stable order.",
      "  Copy output back to the original array.",
      "After D passes, the array is fully sorted."
    ],
    pseudocode: `function radixSort(arr):
    maxVal = max(arr)
    exp = 1
    while maxVal / exp > 0:
        countingSortByDigit(arr, exp)
        exp *= 10

function countingSortByDigit(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    for v in arr: count[(v // exp) % 10]++
    for i in 1 to 9: count[i] += count[i-1]
    for v in reversed(arr):
        d = (v // exp) % 10
        output[count[d] - 1] = v
        count[d]--
    for i in 0 to n-1: arr[i] = output[i]`
  },
];
