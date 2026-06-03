export const ALGORITHMS = [
  // ==========================================
  // TREE ALGORITHMS
  // ==========================================
  {
    id: "tree-dfs",
    name: "DFS Traversals (Pre/In/Postorder)",
    category: "trees",
    complexity: "O(N)",
    summary: "Traverse a binary tree recursively in Preorder, Inorder, or Postorder sequence.",
    timeComplexity: { best: "O(N)", average: "O(N)", worst: "O(N)" },
    spaceComplexity: "O(H) where H is tree height (call stack)",
    explanation: "Depth-First Search (DFS) traversals explore as deep as possible along each branch before backtracking. For a binary tree, three recursive orderings are defined:\n\n*   **Preorder (Root-Left-Right)**: Node is visited first. Great for cloning a tree or writing prefix mathematical expressions.\n*   **Inorder (Left-Root-Right)**: Left child is visited, then root, then right child. Crucial for Binary Search Trees (BST) because it visits elements in sorted order.\n*   **Postorder (Left-Right-Root)**: Children are visited before parent. Used when you need bottom-up info (e.g. deleting a tree, evaluating postfix equations, or calculating tree height).",
    steps: [
      "Begin recursion from the root node.",
      "Base Case: If the current node is null, backtrack (return).",
      "For **Preorder**: Process the current node's value, then recurse left, then recurse right.",
      "For **Inorder**: Recurse left first, then process the current node's value, then recurse right.",
      "For **Postorder**: Recurse left, then recurse right, and finally process the current node's value."
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
    summary: "Visit nodes level-by-level, from left to right, using a queue.",
    timeComplexity: { best: "O(N)", average: "O(N)", worst: "O(N)" },
    spaceComplexity: "O(W) where W is maximum level width",
    explanation: "Breadth-First Search (BFS) or Level Order Traversal visits nodes layer-by-layer starting from the root (level 0), then its children (level 1), and so on. A Queue is used to maintain a FIFO (First-In, First-Out) list of nodes to explore. It guarantees that nodes closer to the root are processed before those farther away, which is useful for structural serialization or short-path searching.",
    steps: [
      "Initialize an empty Queue.",
      "Enqueue the root node if it is not null.",
      "While the queue is not empty, repeat steps 4 to 6:",
      "Dequeue the front node and record its value.",
      "If the dequeued node has a left child, enqueue it.",
      "If the dequeued node has a right child, enqueue it."
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
    summary: "Calculate the height (depth) and longest path (diameter) in a tree in a single pass.",
    timeComplexity: { best: "O(N)", average: "O(N)", worst: "O(N)" },
    spaceComplexity: "O(H) recursion stack depth",
    explanation: "The **height** of a tree node is the length of the longest path from that node to a leaf. The **diameter** (or width) of a tree is the length of the longest path between any two nodes in a tree. This path may or may not pass through the root.\n\nBy calculating height recursively bottom-up, we can compute the diameter at each node as: \`diameter = left_height + right_height\`. We maintain a global maximum diameter throughout the traversal.",
    steps: [
      "Create a global variable `maxDiameter = 0`.",
      "Define a recursive helper function `getHeight(node)` which returns the height of the subtree at `node`.",
      "If the node is null, return `0` (base case).",
      "Recursively calculate left subtree height: `leftH = getHeight(node.left)`.",
      "Recursively calculate right subtree height: `rightH = getHeight(node.right)`.",
      "Update `maxDiameter` with the maximum of its current value and the sum of left and right heights: `maxDiameter = max(maxDiameter, leftH + rightH)`.",
      "Return the height of the current node: `max(leftH, rightH) + 1`.",
      "After the recursion finishes, the tree height is `getHeight(root)` and the diameter is `maxDiameter`."
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
    summary: "Find the deepest node in a tree that has both target nodes as descendants.",
    timeComplexity: { best: "O(N)", average: "O(N)", worst: "O(N)" },
    spaceComplexity: "O(H) recursion stack depth",
    explanation: "The Lowest Common Ancestor (LCA) of two nodes $p$ and $q$ in a tree is defined as the lowest (deepest) node $T$ that has both $p$ and $q$ as descendants (where we allow a node to be a descendant of itself).\n\nIn a binary tree, we search recursively. If the current root is null, or matches either $p$ or $q$, we return the root. Otherwise, we look in left and right subtrees. If both subtrees return a non-null node, then the current node is the LCA.",
    steps: [
      "Start recursive search from the root.",
      "If `root` is null or matches node `p` or node `q`, return `root`.",
      "Recursively search the left subtree: `leftLCA = findLCA(root.left, p, q)`.",
      "Recursively search the right subtree: `rightLCA = findLCA(root.right, p, q)`.",
      "If both `leftLCA` and `rightLCA` are not null, it means `p` and `q` are split in different subtrees of the current node. Return `root`.",
      "Otherwise, return the non-null result (`leftLCA` if not null, else `rightLCA`)."
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
    summary: "Check if there is a root-to-leaf path whose sum of node values equals a target.",
    timeComplexity: { best: "O(N)", average: "O(N)", worst: "O(N)" },
    spaceComplexity: "O(H) recursion stack depth",
    explanation: "The Path Sum problem checks whether a binary tree has a root-to-leaf path such that adding up all the values along the path equals a target integer. \n\nWe solve this recursively. For each node, we subtract its value from the remaining target sum. If we reach a leaf node and the remaining sum equals the leaf's value, we have found a valid path.",
    steps: [
      "Start at the root node.",
      "If the tree is empty (root is null), return `false`.",
      "Subtract the current node's value from the target sum: `remaining = target - node.value`.",
      "Check if the current node is a leaf (both left and right children are null).",
      "If it is a leaf, return whether `remaining == 0` (or `target == node.value`).",
      "If not a leaf, recursively check left and right subtrees: `hasPathSum(node.left, remaining) || hasPathSum(node.right, remaining)`."
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
    summary: "Precompute binary jumps (ancestors of powers of 2) to answer LCA/ancestor queries in logarithmic time.",
    timeComplexity: { best: "O(log N) per query", average: "O(log N) per query", worst: "O(log N) per query (O(N log N) preprocessing)" },
    spaceComplexity: "O(N log N) storage matrix",
    explanation: "Binary Lifting is a powerful dynamic programming technique on trees. By precomputing a table \`up[u][i]\` which stores the $2^i$-th ancestor of node $u$, we can jump up the tree by powers of 2. \n\nThis makes finding the $k$-th ancestor or querying the Lowest Common Ancestor (LCA) extremely fast ($O(\log N)$) instead of doing linear traversals. It is commonly used in competitive programming and large tree structures.",
    steps: [
      "Perform a DFS traversal to calculate the direct parent (2^0 ancestor) and depth of every node.",
      "Initialize a table `up[N][LOG_N]` where `up[u][0] = parent[u]`.",
      "Populate the table using the recurrence relation: `up[u][i] = up[up[u][i-1]][i-1]` (the 2^i ancestor is the 2^(i-1) ancestor of the 2^(i-1) ancestor).",
      "To query the k-th ancestor of node `u`, iterate through bits of `k`. If the i-th bit is set, replace `u` with `up[u][i]`.",
      "To query LCA of `u` and `v`, first lift the deeper node to the same depth as the other.",
      "If they are now the same node, return it. Otherwise, lift both nodes together by decreasing powers of 2 until their parents match."
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
    summary: "Traverse a graph layer-by-layer from a starting vertex using a queue.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V) for queue and visited set",
    explanation: "Breadth-First Search (BFS) starts at a selected node and explores all of its neighboring nodes at the current depth level before moving on to nodes at the next depth level. It uses a **Queue** (First-In-First-Out) to manage the frontier. BFS is guaranteed to find the shortest path between two nodes in an unweighted graph.",
    steps: [
      "Create a queue `Q` and a set/boolean array `visited` initialized to false.",
      "Mark the start node as visited and enqueue it into `Q`.",
      "While `Q` is not empty, do the following:",
      "Dequeue a node `curr` from `Q` and process it.",
      "For each unvisited neighbor of `curr`, mark it as visited and enqueue it."
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
    summary: "Traverse a graph by exploring as far as possible along each branch before backtracking.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V) recursion stack depth",
    explanation: "Depth-First Search (DFS) explores as deep as possible along each branch before backtracking. It can be implemented recursively or iteratively using a Stack. DFS is a core building block for many complex graph algorithms, including topological sorting, cycle detection, and finding strongly connected components.",
    steps: [
      "Create a set/boolean array `visited` initialized to false.",
      "Define a recursive helper function `dfsHelper(node)`.",
      "In `dfsHelper(node)`: Mark the node as visited, process it, then iterate through its neighbors.",
      "For each neighbor, if it has not been visited, recursively call `dfsHelper(neighbor)`.",
      "To handle disconnected graphs, loop through all nodes in the graph and invoke `dfsHelper` if a node is not yet visited."
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
    summary: "Order vertices of a Directed Acyclic Graph (DAG) linearly based on in-degrees.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V) to store in-degrees and queue",
    explanation: "A Topological Sort of a Directed Acyclic Graph (DAG) is a linear ordering of its vertices such that for every directed edge $uv$ from vertex $u$ to vertex $v$, $u$ comes before $v$. \n\n**Kahn's Algorithm** works by calculating the in-degree (number of incoming edges) of all vertices. Nodes with an in-degree of 0 are enqueued. We dequeue a node, add it to the topological order, and decrement the in-degrees of its neighbors. Any neighbor whose in-degree becomes 0 is enqueued. If the final order contains fewer nodes than the graph, the graph contains a cycle.",
    steps: [
      "Initialize in-degree counts for all vertices to 0.",
      "Traverse all edges to compute the correct in-degree for each vertex.",
      "Initialize an empty Queue `Q` and an empty list `order`.",
      "Enqueue all vertices with in-degree equal to 0.",
      "While `Q` is not empty, dequeue a node `curr`:",
      "Add `curr` to the `order` list.",
      "For each outgoing edge from `curr` to neighbor `v`, decrement `in-degree[v]`.",
      "If `in-degree[v]` becomes 0, enqueue `v`.",
      "If the length of `order` is less than V, a cycle was detected (no topological order exists). Otherwise, return `order`."
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
    summary: "Determine if a graph contains any cycles using DFS recursion states.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V) for recursion call stack and states",
    explanation: "Cycle detection checks if there is any path that starts and ends at the same vertex. The implementation differs based on graph directionality:\n\n*   **Directed Graph**: We track nodes currently in the recursion call stack (active DFS path). If we find an edge pointing to a node already in the active recursion stack (a back-edge), a cycle exists.\n*   **Undirected Graph**: We traverse using DFS. If we encounter a visited node that is *not* the parent of the current node, a cycle exists.",
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
    summary: "Manage partitioned disjoint sets with near-constant time Find and Union operations.",
    timeComplexity: { best: "O(α(V))", average: "O(α(V))", worst: "O(α(V)) where α is the Inverse Ackermann function" },
    spaceComplexity: "O(V) parent and rank arrays",
    explanation: "Disjoint Set Union (DSU), also known as Union-Find, is a data structure that tracks elements split into several non-overlapping sets. It is highly optimized using two techniques:\n\n1.  **Path Compression**: Makes every node on the query path point directly to the root, speeding up subsequent lookups.\n2.  **Union by Rank/Size**: Attaches the smaller tree to the root of the larger tree, keeping the structure balanced.\n\nIt is used in cycle detection, Kruskal's algorithm, and dynamic connectivity problems.",
    steps: [
      "Initialize arrays `parent` and `rank` of size V.",
      "**MakeSet**: Set `parent[i] = i` and `rank[i] = 0` for all elements.",
      "**Find(i)**: Traverse parent pointers recursively to find the representative root of `i`. During backtracking, set `parent[i] = root` (Path Compression).",
      "**Union(i, j)**: Find the roots of both items: `root_i = Find(i)`, `root_j = Find(j)`.",
      "If the roots are different, check ranks: Attach the root with the lower rank under the root with the higher rank.",
      "If ranks are equal, attach one arbitrarily and increment its rank by 1."
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
    summary: "Greedily construct a Minimum Spanning Tree by sorting edges and using DSU.",
    timeComplexity: { best: "O(E log E)", average: "O(E log E)", worst: "O(E log E) or O(E log V)" },
    spaceComplexity: "O(V + E) for DSU and sorting data",
    explanation: "Kruskal's Algorithm is a greedy approach to find the Minimum Spanning Tree (MST) of a connected, weighted graph. It sorts all edges by weight, then iterates through them, adding each edge to the MST as long as it does not form a cycle with already selected edges. Cycle detection is performed in near-constant time using a Disjoint Set Union (DSU) data structure.",
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
    summary: "Build a Minimum Spanning Tree growing from a starting vertex, selecting minimum weight cut edges.",
    timeComplexity: { best: "O(E log V)", average: "O(E log V)", worst: "O(E log V) using a binary heap" },
    spaceComplexity: "O(V) key and parent tables",
    explanation: "Prim's Algorithm is a greedy algorithm that builds the Minimum Spanning Tree (MST) one node at a time. Starting from an arbitrary root node, it expands the MST set by repeatedly adding the cheapest edge that connects a vertex in the MST to a vertex outside the MST. It is implemented efficiently using a Priority Queue (Min-Heap) to extract the minimum cut edge.",
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
    summary: "Compute the shortest paths from a single source to all nodes in a graph with non-negative edge weights.",
    timeComplexity: { best: "O((V + E) log V)", average: "O((V + E) log V)", worst: "O((V + E) log V) with binary heap" },
    spaceComplexity: "O(V) distance and predecessor arrays",
    explanation: "Dijkstra's Algorithm solves the single-source shortest path problem on graphs with non-negative edge weights. It works by keeping track of the shortest known distance from the source to every other node. It greedily selects the unvisited node with the smallest tentative distance, marks it as finalized, and relaxes all of its outgoing edges.",
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
    summary: "Compute shortest paths from a single source, allowing negative edge weights and detecting negative cycles.",
    timeComplexity: { best: "O(E)", average: "O(V * E)", worst: "O(V * E)" },
    spaceComplexity: "O(V) distance array",
    explanation: "The Bellman-Ford Algorithm computes single-source shortest paths on weighted graphs. Unlike Dijkstra's algorithm, Bellman-Ford supports **negative edge weights**. It repeatedly relaxes all edges in the graph $V-1$ times. Since the longest simple path in a graph contains at most $V-1$ edges, all shortest distances are guaranteed to be finalized after $V-1$ rounds. A final ($V$-th) round of relaxations is performed to check for negative-weight cycles; if any distance decreases, a negative cycle exists.",
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
    summary: "Identify Strongly Connected Components in a directed graph using two DFS passes.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V + E) for transposed graph and stack",
    explanation: "Kosaraju's Algorithm finds the Strongly Connected Components (SCCs) of a directed graph. An SCC is a maximal subgraph where every vertex is reachable from any other vertex in the subgraph.\n\nIt performs two DFS passes:\n1.  **First DFS**: Computes the finishing order of vertices on the original graph and pushes them to a stack.\n2.  **Transpose Graph**: Reverses the directions of all edges.\n3.  **Second DFS**: Processes nodes in order of decreasing finishing times (popped from the stack) on the transposed graph. Each tree generated in this forest forms a separate SCC.",
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
    summary: "Identify critical edges (bridges) and nodes (articulation points) in a single DFS pass.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V) for discovery and low arrays",
    explanation: "Tarjan's Bridge and Articulation Point algorithms identify critical components in a graph:\n\n*   **Bridge**: An edge whose removal increases the number of connected components.\n*   **Articulation Point (Cut Vertex)**: A vertex whose removal increases the number of connected components.\n\nIt performs a single DFS pass, maintaining two values for each node: `dfn[u]` (discovery time when visited) and `low[u]` (lowest discovery time reachable from `u` using at most one back-edge). An edge `(u, v)` is a bridge if `low[v] > dfn[u]`, meaning there is no alternative path back to `u` or its ancestors from `v`'s subtree.",
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
  }
];
