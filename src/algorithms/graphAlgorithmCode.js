/* ── Code listings for every graph algorithm in C++ / Java / Python ── */

const listings = {
  dfs: {
    cpp: [
      "void dfs(Graph& g, Node* start) {",  // 1
      "  vector<Node*> stack;",              // 2
      "  set<int> visited;",                 // 3
      "  stack.push_back(start);",           // 4
      "",                                    // 5
      "  while (!stack.empty()) {",          // 6
      "    Node* curr = stack.back();",      // 7
      "    stack.pop_back();",               // 8
      "    if (visited.count(curr->id)) continue;", // 9
      "    visited.insert(curr->id);",       // 10
      "",                                    // 11
      "    for (auto& nb : g.adj(curr)) {",  // 12
      "      if (!visited.count(nb->id))",   // 13
      "        stack.push_back(nb);",        // 14
      "    }",                               // 15
      "  }",                                 // 16
      "}",                                   // 17
    ],
    java: [
      "void dfs(Graph g, Node start) {",     // 1
      "  Deque<Node> stack = new ArrayDeque<>();", // 2
      "  Set<Integer> visited = new HashSet<>();",  // 3
      "  stack.push(start);",                // 4
      "",                                    // 5
      "  while (!stack.isEmpty()) {",        // 6
      "    Node curr = stack.pop();",        // 7
      "    if (visited.contains(curr.id)) continue;", // 8
      "    visited.add(curr.id);",           // 9
      "",                                    // 10
      "    for (Node nb : g.neighbors(curr)) {", // 11
      "      if (!visited.contains(nb.id))", // 12
      "        stack.push(nb);",             // 13
      "    }",                               // 14
      "  }",                                 // 15
      "}",                                   // 16
    ],
    python: [
      "def dfs(graph, start):",              // 1
      "    stack = [start]",                 // 2
      "    visited = set()",                 // 3
      "",                                    // 4
      "    while stack:",                    // 5
      "        curr = stack.pop()",          // 6
      "        if curr in visited:",         // 7
      "            continue",                // 8
      "        visited.add(curr)",           // 9
      "",                                    // 10
      "        for nb in graph[curr]:",      // 11
      "            if nb not in visited:",   // 12
      "                stack.append(nb)",     // 13
    ],
  },

  bfs: {
    cpp: [
      "void bfs(Graph& g, Node* start) {",  // 1
      "  queue<Node*> q;",                   // 2
      "  set<int> visited;",                 // 3
      "  q.push(start);",                    // 4
      "  visited.insert(start->id);",        // 5
      "",                                    // 6
      "  while (!q.empty()) {",              // 7
      "    Node* curr = q.front();",         // 8
      "    q.pop();",                        // 9
      "",                                    // 10
      "    for (auto& nb : g.adj(curr)) {",  // 11
      "      if (!visited.count(nb->id)) {", // 12
      "        visited.insert(nb->id);",     // 13
      "        q.push(nb);",                 // 14
      "      }",                             // 15
      "    }",                               // 16
      "  }",                                 // 17
      "}",                                   // 18
    ],
    java: [
      "void bfs(Graph g, Node start) {",     // 1
      "  Queue<Node> q = new LinkedList<>();",  // 2
      "  Set<Integer> visited = new HashSet<>();",  // 3
      "  q.add(start);",                     // 4
      "  visited.add(start.id);",            // 5
      "",                                    // 6
      "  while (!q.isEmpty()) {",            // 7
      "    Node curr = q.poll();",           // 8
      "",                                    // 9
      "    for (Node nb : g.neighbors(curr)) {", // 10
      "      if (!visited.contains(nb.id)) {", // 11
      "        visited.add(nb.id);",         // 12
      "        q.add(nb);",                  // 13
      "      }",                             // 14
      "    }",                               // 15
      "  }",                                 // 16
      "}",                                   // 17
    ],
    python: [
      "def bfs(graph, start):",              // 1
      "    from collections import deque",   // 2
      "    q = deque([start])",              // 3
      "    visited = {start}",               // 4
      "",                                    // 5
      "    while q:",                        // 6
      "        curr = q.popleft()",          // 7
      "",                                    // 8
      "        for nb in graph[curr]:",      // 9
      "            if nb not in visited:",   // 10
      "                visited.add(nb)",     // 11
      "                q.append(nb)",        // 12
    ],
  },

  topo: {
    cpp: [
      "vector<int> topoSort(Graph& g) {",    // 1
      "  map<int,int> inDeg;",               // 2
      "  for (auto& e : g.edges)",           // 3
      "    inDeg[e.to]++;",                  // 4
      "",                                    // 5
      "  queue<int> q;",                     // 6
      "  for (auto& n : g.nodes)",           // 7
      "    if (inDeg[n.id] == 0) q.push(n.id);", // 8
      "",                                    // 9
      "  while (!q.empty()) {",              // 10
      "    int u = q.front(); q.pop();",     // 11
      "    for (auto& nb : g.adj(u))",       // 12
      "      if (--inDeg[nb] == 0)",         // 13
      "        q.push(nb);",                 // 14
      "  }",                                 // 15
      "}",                                   // 16
    ],
    java: [
      "List<Integer> topoSort(Graph g) {",   // 1
      "  Map<Integer,Integer> inDeg = new HashMap<>();",  // 2
      "  for (Edge e : g.edges) inDeg.merge(e.to, 1, Integer::sum);", // 3
      "",                                    // 4
      "  Queue<Integer> q = new LinkedList<>();", // 5
      "  for (Node n : g.nodes)",            // 6
      "    if (inDeg.get(n.id) == 0) q.add(n.id);", // 7
      "",                                    // 8
      "  while (!q.isEmpty()) {",            // 9
      "    int u = q.poll();",               // 10
      "    for (int nb : g.adj(u))",         // 11
      "      if (inDeg.merge(nb, -1, Integer::sum) == 0)", // 12
      "        q.add(nb);",                  // 13
      "  }",                                 // 14
      "}",                                   // 15
    ],
    python: [
      "def topo_sort(graph):",               // 1
      "    in_deg = {n: 0 for n in graph}",  // 2
      "    for u in graph:",                 // 3
      "        for v in graph[u]:",          // 4
      "            in_deg[v] += 1",          // 5
      "",                                    // 6
      "    q = deque(n for n in graph",      // 7
      "             if in_deg[n] == 0)",     // 8
      "",                                    // 9
      "    while q:",                        // 10
      "        u = q.popleft()",             // 11
      "        for v in graph[u]:",          // 12
      "            in_deg[v] -= 1",          // 13
      "            if in_deg[v] == 0:",      // 14
      "                q.append(v)",         // 15
    ],
  },

  cycle: {
    cpp: [
      "bool hasCycle(Graph& g) {",           // 1
      "  set<int> visited, recStack;",       // 2
      "",                                    // 3
      "  function<bool(int)> dfs = [&](int u) {", // 4
      "    visited.insert(u);",              // 5
      "    recStack.insert(u);",             // 6
      "",                                    // 7
      "    for (int v : g.adj(u)) {",        // 8
      "      if (recStack.count(v))",        // 9
      "        return true;  // cycle",      // 10
      "      if (!visited.count(v))",        // 11
      "        if (dfs(v)) return true;",    // 12
      "    }",                               // 13
      "    recStack.erase(u);",              // 14
      "    return false;",                   // 15
      "  };",                                // 16
      "",                                    // 17
      "  for (auto& n : g.nodes)",           // 18
      "    if (!visited.count(n.id))",       // 19
      "      if (dfs(n.id)) return true;",   // 20
      "  return false;",                     // 21
      "}",                                   // 22
    ],
    java: [
      "boolean hasCycle(Graph g) {",         // 1
      "  Set<Integer> visited = new HashSet<>();", // 2
      "  Set<Integer> recStack = new HashSet<>();", // 3
      "",                                    // 4
      "  for (Node n : g.nodes)",            // 5
      "    if (!visited.contains(n.id))",    // 6
      "      if (dfs(n.id, visited, recStack, g))", // 7
      "        return true;",                // 8
      "  return false;",                     // 9
      "}",                                   // 10
    ],
    python: [
      "def has_cycle(graph):",               // 1
      "    visited, stack = set(), set()",   // 2
      "",                                    // 3
      "    def dfs(u):",                     // 4
      "        visited.add(u)",              // 5
      "        stack.add(u)",                // 6
      "        for v in graph[u]:",          // 7
      "            if v in stack: return True", // 8
      "            if v not in visited:",    // 9
      "                if dfs(v): return True", // 10
      "        stack.remove(u)",             // 11
      "        return False",                // 12
    ],
  },

  dsu: {
    cpp: [
      "int find(vector<int>& p, int x) {",   // 1
      "  if (p[x] == x) return x;",          // 2
      "  return p[x] = find(p, p[x]);",      // 3
      "}",                                   // 4
      "",                                    // 5
      "bool unite(vector<int>& p,",          // 6
      "           vector<int>& r,",          // 7
      "           int a, int b) {",          // 8
      "  a = find(p,a); b = find(p,b);",     // 9
      "  if (a == b) return false;",         // 10
      "  if (r[a] < r[b]) swap(a,b);",       // 11
      "  p[b] = a;",                         // 12
      "  if (r[a] == r[b]) r[a]++;",         // 13
      "  return true;",                      // 14
      "}",                                   // 15
    ],
    java: [
      "int find(int[] p, int x) {",          // 1
      "  if (p[x] == x) return x;",          // 2
      "  return p[x] = find(p, p[x]);",      // 3
      "}",                                   // 4
      "",                                    // 5
      "boolean unite(int[] p, int[] r,",     // 6
      "              int a, int b) {",       // 7
      "  a = find(p,a); b = find(p,b);",     // 8
      "  if (a == b) return false;",         // 9
      "  if (r[a] < r[b]) { int t=a;a=b;b=t; }", // 10
      "  p[b] = a;",                         // 11
      "  if (r[a] == r[b]) r[a]++;",         // 12
      "  return true;",                      // 13
      "}",                                   // 14
    ],
    python: [
      "def find(p, x):",                     // 1
      "    if p[x] == x: return x",          // 2
      "    p[x] = find(p, p[x])",            // 3
      "    return p[x]",                     // 4
      "",                                    // 5
      "def unite(p, r, a, b):",              // 6
      "    a, b = find(p, a), find(p, b)",   // 7
      "    if a == b: return False",         // 8
      "    if r[a] < r[b]: a, b = b, a",     // 9
      "    p[b] = a",                        // 10
      "    if r[a] == r[b]: r[a] += 1",      // 11
      "    return True",                     // 12
    ],
  },

  "mst-kruskal": {
    cpp: [
      "vector<Edge> kruskal(int n,",         // 1
      "                   vector<Edge>& e) {",// 2
      "  sort(e.begin(), e.end(),",          // 3
      "       [](a,b){ return a.w<b.w; });", // 4
      "  DSU dsu(n);",                       // 5
      "  vector<Edge> mst;",                 // 6
      "",                                    // 7
      "  for (auto& edge : e) {",            // 8
      "    if (dsu.find(edge.u) == dsu.find(edge.v))", // 9
      "      continue;  // cycle",           // 10
      "    dsu.unite(edge.u, edge.v);",      // 11
      "    mst.push_back(edge);",            // 12
      "  }",                                 // 13
      "  return mst;",                       // 14
      "}",                                   // 15
    ],
    java: [
      "List<Edge> kruskal(int n, List<Edge> e) {", // 1
      "  e.sort(Comparator.comparingInt(x -> x.w));", // 2
      "  DSU dsu = new DSU(n);",             // 3
      "  List<Edge> mst = new ArrayList<>();",  // 4
      "",                                    // 5
      "  for (Edge edge : e) {",             // 6
      "    if (dsu.find(edge.u) == dsu.find(edge.v))", // 7
      "      continue;",                     // 8
      "    dsu.unite(edge.u, edge.v);",      // 9
      "    mst.add(edge);",                  // 10
      "  }",                                 // 11
      "  return mst;",                       // 12
      "}",                                   // 13
    ],
    python: [
      "def kruskal(n, edges):",              // 1
      "    edges.sort(key=lambda e: e.w)",   // 2
      "    dsu = DSU(n)",                    // 3
      "    mst = []",                        // 4
      "",                                    // 5
      "    for e in edges:",                 // 6
      "        if dsu.find(e.u) == dsu.find(e.v):", // 7
      "            continue",                // 8
      "        dsu.unite(e.u, e.v)",         // 9
      "        mst.append(e)",               // 10
      "    return mst",                     // 11
    ],
  },

  "mst-prim": {
    cpp: [
      "vector<Edge> prim(Graph& g, int s) {",// 1
      "  set<int> inMST;",                   // 2
      "  priority_queue<pair<int,Edge>> pq;",// 3
      "  pq.push({0, {s, s, 0}});",          // 4
      "  vector<Edge> mst;",                 // 5
      "",                                    // 6
      "  while (!pq.empty() &&",             // 7
      "         (int)inMST.size() < g.V) {", // 8
      "    auto [w, e] = pq.top(); pq.pop();", // 9
      "    if (inMST.count(e.v)) continue;", // 10
      "    inMST.insert(e.v);",              // 11
      "    mst.push_back(e);",               // 12
      "    for (auto& nb : g.adj(e.v))",     // 13
      "      pq.push({nb.w, {e.v, nb.v, nb.w}});", // 14
      "  }",                                 // 15
      "  return mst;",                       // 16
      "}",                                   // 17
    ],
    java: [
      "List<Edge> prim(Graph g, int s) {",   // 1
      "  Set<Integer> inMST = new HashSet<>();", // 2
      "  PriorityQueue<Edge> pq =",          // 3
      "    new PriorityQueue<>(cmp.w);",     // 4
      "  pq.add(new Edge(s, s, 0));",        // 5
      "  List<Edge> mst = new ArrayList<>();",  // 6
      "",                                    // 7
      "  while (!pq.isEmpty() &&",           // 8
      "         inMST.size() < g.V) {",      // 9
      "    Edge e = pq.poll();",             // 10
      "    if (inMST.contains(e.v)) continue;", // 11
      "    inMST.add(e.v);",                 // 12
      "    mst.add(e);",                     // 13
      "    for (Edge nb : g.adj(e.v))",      // 14
      "      pq.add(nb);",                   // 15
      "  }",                                 // 16
      "  return mst;",                       // 17
      "}",                                   // 18
    ],
    python: [
      "def prim(graph, start):",             // 1
      "    in_mst = set()",                  // 2
      "    pq = [(0, start, start)]",        // 3
      "    mst = []",                        // 4
      "",                                    // 5
      "    while pq and len(in_mst) < len(graph):", // 6
      "        w, u, v = heapq.heappop(pq)", // 7
      "        if v in in_mst: continue",    // 8
      "        in_mst.add(v)",               // 9
      "        mst.append((u, v, w))",       // 10
      "        for nb, w2 in graph[v]:",     // 11
      "            heapq.heappush(pq, (w2, v, nb))", // 12
      "    return mst",                      // 13
    ],
  },

  bellman: {
    cpp: [
      "vector<int> bellmanFord(",            // 1
      "    int n, vector<Edge>& e, int s) {",// 2
      "  vector<int> dist(n, INF);",         // 3
      "  dist[s] = 0;",                      // 4
      "",                                    // 5
      "  for (int i = 1; i < n; i++)",       // 6
      "    for (auto& ed : e)",              // 7
      "      if (dist[ed.u] + ed.w",         // 8
      "          < dist[ed.v]) {",           // 9
      "        dist[ed.v] = dist[ed.u] + ed.w;", // 10
      "      }",                             // 11
      "  return dist;",                      // 12
      "}",                                   // 13
    ],
    java: [
      "int[] bellmanFord(int n,",            // 1
      "                  Edge[] e, int s) {",// 2
      "  int[] dist = new int[n];",          // 3
      "  Arrays.fill(dist, INF);",           // 4
      "  dist[s] = 0;",                      // 5
      "",                                    // 6
      "  for (int i = 1; i < n; i++)",       // 7
      "    for (Edge ed : e)",               // 8
      "      if (dist[ed.u] + ed.w",         // 9
      "          < dist[ed.v]) {",           // 10
      "        dist[ed.v] = dist[ed.u] + ed.w;", // 11
      "      }",                             // 12
      "  return dist;",                      // 13
      "}",                                   // 14
    ],
    python: [
      "def bellman_ford(n, edges, s):",      // 1
      "    INF = float('inf')",              // 2
      "    dist = [INF] * n",                // 3
      "    dist[s] = 0",                     // 4
      "",                                    // 5
      "    for _ in range(n - 1):",          // 6
      "        for u, v, w in edges:",       // 7
      "            if dist[u] + w < dist[v]:",// 8
      "                dist[v] = dist[u] + w",// 9
      "    return dist",                     // 10
    ],
  },

  scc: {
    cpp: [
      "// Kosaraju's Algorithm",              // 1
      "void dfs1(int u) {",                  // 2
      "  visited[u] = true;",                // 3
      "  for (int v : adj[u])",              // 4
      "    if (!visited[v]) dfs1(v);",       // 5
      "  finishStack.push(u);",              // 6
      "}",                                   // 7
      "",                                    // 8
      "void dfs2(int u) {",                  // 9
      "  visited[u] = true;",                // 10
      "  comp[u] = compId;",                 // 11
      "  for (int v : radj[u])",             // 12
      "    if (!visited[v]) dfs2(v);",       // 13
      "}",                                   // 14
      "",                                    // 15
      "// Pass 1: fill finish order",        // 16
      "// Pass 2: DFS on transpose",         // 17
    ],
    java: [
      "// Kosaraju's Algorithm",              // 1
      "void dfs1(int u) {",                  // 2
      "  visited[u] = true;",                // 3
      "  for (int v : adj[u])",              // 4
      "    if (!visited[v]) dfs1(v);",       // 5
      "  finishStack.push(u);",              // 6
      "}",                                   // 7
      "",                                    // 8
      "void dfs2(int u) {",                  // 9
      "  visited[u] = true;",                // 10
      "  comp[u] = compId;",                 // 11
      "  for (int v : radj[u])",             // 12
      "    if (!visited[v]) dfs2(v);",       // 13
      "}",                                   // 14
    ],
    python: [
      "# Kosaraju's Algorithm",              // 1
      "def dfs1(u):",                        // 2
      "    visited[u] = True",               // 3
      "    for v in adj[u]:",                // 4
      "        if not visited[v]:",          // 5
      "            dfs1(v)",                 // 6
      "    finish.append(u)",                // 7
      "",                                    // 8
      "def dfs2(u):",                        // 9
      "    visited[u] = True",               // 10
      "    comp[u] = cid",                   // 11
      "    for v in radj[u]:",               // 12
      "        if not visited[v]:",          // 13
      "            dfs2(v)",                 // 14
    ],
  },

  bridges: {
    cpp: [
      "// Tarjan's Bridges & Articulations",  // 1
      "int timer = 0;",                      // 2
      "void dfs(int u, int parentEdge) {",   // 3
      "  dfn[u] = low[u] = ++timer;",        // 4
      "  for (auto [v, eid] : adj[u]) {",    // 5
      "    if (eid == parentEdge) continue;",// 6
      "    if (dfn[v]) {  // back-edge",      // 7
      "      low[u] = min(low[u], dfn[v]);", // 8
      "    } else {",                        // 9
      "      dfs(v, eid);",                  // 10
      "      low[u] = min(low[u], low[v]);", // 11
      "      if (low[v] > dfn[u])",          // 12
      "        bridges.insert(eid);",        // 13
      "    }",                               // 14
      "  }",                                 // 15
      "}",                                   // 16
    ],
    java: [
      "// Tarjan's Bridges & Articulations",  // 1
      "int timer = 0;",                      // 2
      "void dfs(int u, int parentEdge) {",   // 3
      "  dfn[u] = low[u] = ++timer;",        // 4
      "  for (var entry : adj[u]) {",        // 5
      "    if (entry.eid == parentEdge) continue;", // 6
      "    if (dfn[entry.v] != 0) {",        // 7
      "      low[u] = Math.min(low[u], dfn[entry.v]);", // 8
      "    } else {",                        // 9
      "      dfs(entry.v, entry.eid);",      // 10
      "      low[u] = Math.min(low[u], low[entry.v]);", // 11
      "      if (low[entry.v] > dfn[u])",    // 12
      "        bridges.add(entry.eid);",     // 13
      "    }",                               // 14
      "  }",                                 // 15
      "}",                                   // 16
    ],
    python: [
      "# Tarjan's Bridges & Articulations",  // 1
      "timer = 0",                           // 2
      "def dfs(u, parent_eid):",             // 3
      "    global timer",                    // 4
      "    timer += 1",                      // 5
      "    dfn[u] = low[u] = timer",         // 6
      "    for v, eid in adj[u]:",           // 7
      "        if eid == parent_eid: continue", // 8
      "        if dfn[v]:  # back-edge",     // 9
      "            low[u] = min(low[u], dfn[v])", // 10
      "        else:",                       // 11
      "            dfs(v, eid)",             // 12
      "            low[u] = min(low[u], low[v])", // 13
      "            if low[v] > dfn[u]:",     // 14
      "                bridges.add(eid)",    // 15
    ],
  },

  dijkstra: {
    cpp: [
      "vector<int> dijkstra(",               // 1
      "    Graph& g, int s) {",              // 2
      "  vector<int> dist(g.V, INF);",       // 3
      "  dist[s] = 0;",                      // 4
      "  priority_queue<pii, vector<pii>,",  // 5
      "                 greater<pii>> pq;",  // 6
      "  pq.push({0, s});",                  // 7
      "",                                    // 8
      "  while (!pq.empty()) {",             // 9
      "    auto [d, u] = pq.top(); pq.pop();",// 10
      "    if (d > dist[u]) continue;",      // 11
      "    for (auto& [v, w] : g.adj(u))",   // 12
      "      if (dist[u]+w < dist[v]) {",    // 13
      "        dist[v] = dist[u]+w;",        // 14
      "        pq.push({dist[v], v});",      // 15
      "      }",                             // 16
      "  }",                                 // 17
      "  return dist;",                      // 18
      "}",                                   // 19
    ],
    java: [
      "int[] dijkstra(Graph g, int s) {",    // 1
      "  int[] dist = new int[g.V];",        // 2
      "  Arrays.fill(dist, INF);",           // 3
      "  dist[s] = 0;",                      // 4
      "  PriorityQueue<int[]> pq =",         // 5
      "    new PriorityQueue<>(cmp.a);",     // 6
      "  pq.add(new int[]{0, s});",          // 7
      "",                                    // 8
      "  while (!pq.isEmpty()) {",           // 9
      "    int[] top = pq.poll();",          // 10
      "    int d = top[0], u = top[1];",     // 11
      "    if (d > dist[u]) continue;",      // 12
      "    for (int[] nb : g.adj(u))",       // 13
      "      if (dist[u]+nb[1] < dist[nb[0]]) {", // 14
      "        dist[nb[0]] = dist[u]+nb[1];",// 15
      "        pq.add(new int[]{dist[nb[0]], nb[0]});", // 16
      "      }",                             // 17
      "  }",                                 // 18
      "  return dist;",                      // 19
      "}",                                   // 20
    ],
    python: [
      "def dijkstra(graph, s):",             // 1
      "    INF = float('inf')",              // 2
      "    dist = {n: INF for n in graph}",  // 3
      "    dist[s] = 0",                     // 4
      "    pq = [(0, s)]",                   // 5
      "",                                    // 6
      "    while pq:",                       // 7
      "        d, u = heapq.heappop(pq)",    // 8
      "        if d > dist[u]: continue",    // 9
      "        for v, w in graph[u]:",       // 10
      "            if dist[u] + w < dist[v]:",// 11
      "                dist[v] = dist[u]+w", // 12
      "                heapq.heappush(pq, (dist[v], v))", // 13
      "    return dist",                     // 14
    ],
  },
};

/* ── Lookup helper ── */
export function getGraphCode(algorithm, language) {
  const alg = listings[algorithm];
  if (!alg) return null;
  return alg[language] || alg.cpp;
}
