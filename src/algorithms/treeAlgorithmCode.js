/* ── Code listings for every tree algorithm in C++ / Java / Python ── */

/* For each algorithm, the line numbers are the 1-indexed lines of the
   corresponding code listing. `codeLine` emitted by treeAlgorithms.js must
   match these line numbers. */

const listings = {
  traversals: {
    cpp: {
      preorder: [
        "void preorder(Node* root) {",       // 1
        "  if (!root) return;",              // 2
        "  visit(root);",                    // 3
        "  preorder(root->left);",           // 4
        "  preorder(root->right);",          // 5
        "}",                                 // 6
      ],
      inorder: [
        "void inorder(Node* root) {",        // 1
        "  if (!root) return;",              // 2
        "  inorder(root->left);",            // 3
        "  visit(root);",                    // 4
        "  inorder(root->right);",           // 5
        "}",                                 // 6
      ],
      postorder: [
        "void postorder(Node* root) {",      // 1
        "  if (!root) return;",              // 2
        "  postorder(root->left);",          // 3
        "  postorder(root->right);",         // 4
        "  visit(root);",                    // 5
        "}",                                 // 6
      ],
    },
    java: {
      preorder: [
        "void preorder(Node root) {",        // 1
        "  if (root == null) return;",       // 2
        "  visit(root);",                    // 3
        "  preorder(root.left);",            // 4
        "  preorder(root.right);",           // 5
        "}",                                 // 6
      ],
      inorder: [
        "void inorder(Node root) {",         // 1
        "  if (root == null) return;",       // 2
        "  inorder(root.left);",             // 3
        "  visit(root);",                    // 4
        "  inorder(root.right);",            // 5
        "}",                                 // 6
      ],
      postorder: [
        "void postorder(Node root) {",       // 1
        "  if (root == null) return;",       // 2
        "  postorder(root.left);",           // 3
        "  postorder(root.right);",          // 4
        "  visit(root);",                    // 5
        "}",                                 // 6
      ],
    },
    python: {
      preorder: [
        "def preorder(root):",               // 1
        "    if not root:",                  // 2
        "        return",                    // 3
        "    visit(root)",                   // 4
        "    preorder(root.left)",           // 5
        "    preorder(root.right)",          // 6
      ],
      inorder: [
        "def inorder(root):",                // 1
        "    if not root:",                  // 2
        "        return",                    // 3
        "    inorder(root.left)",            // 4
        "    visit(root)",                   // 5
        "    inorder(root.right)",           // 6
      ],
      postorder: [
        "def postorder(root):",              // 1
        "    if not root:",                  // 2
        "        return",                    // 3
        "    postorder(root.left)",          // 4
        "    postorder(root.right)",         // 5
        "    visit(root)",                   // 6
      ],
    },
  },

  bfs: {
    cpp: [
      "void bfs(Node* root) {",              // 1
      "  if (!root) return;",                // 2
      "  queue<Node*> q;",                   // 3
      "  q.push(root);",                     // 4
      "  while (!q.empty()) {",              // 5
      "    Node* node = q.front();",         // 6
      "    q.pop();",                        // 7
      "    visit(node);",                    // 8
      "    if (node->left)  q.push(node->left);",  // 9
      "    if (node->right) q.push(node->right);", // 10
      "  }",                                 // 11
      "}",                                   // 12
    ],
    java: [
      "void bfs(Node root) {",               // 1
      "  if (root == null) return;",         // 2
      "  Queue<Node> q = new LinkedList<>();",  // 3
      "  q.add(root);",                      // 4
      "  while (!q.isEmpty()) {",            // 5
      "    Node node = q.poll();",           // 6
      "    visit(node);",                    // 7
      "    if (node.left != null)",          // 8
      "      q.add(node.left);",             // 9
      "    if (node.right != null)",         // 10
      "      q.add(node.right);",            // 11
      "  }",                                 // 12
      "}",                                   // 13
    ],
    python: [
      "def bfs(root):",                      // 1
      "    if not root:",                    // 2
      "        return",                      // 3
      "    from collections import deque",   // 4
      "    q = deque([root])",               // 5
      "    while q:",                        // 6
      "        node = q.popleft()",          // 7
      "        visit(node)",                 // 8
      "        if node.left:",               // 9
      "            q.append(node.left)",     // 10
      "        if node.right:",              // 11
      "            q.append(node.right)",    // 12
    ],
  },

  height: {
    cpp: [
      "int height(Node* node) {",            // 1
      "  if (!node) return 0;",              // 2
      "  int left  = height(node->left);",   // 3
      "  int right = height(node->right);",  // 4
      "  int h = max(left, right) + 1;",     // 5
      "  return h;",                         // 6
      "}",                                   // 7
    ],
    java: [
      "int height(Node node) {",             // 1
      "  if (node == null) return 0;",       // 2
      "  int left  = height(node.left);",    // 3
      "  int right = height(node.right);",   // 4
      "  int h = Math.max(left, right) + 1;",// 5
      "  return h;",                         // 6
      "}",                                   // 7
    ],
    python: [
      "def height(node):",                   // 1
      "    if not node:",                    // 2
      "        return 0",                    // 3
      "    left  = height(node.left)",       // 4
      "    right = height(node.right)",      // 5
      "    return max(left, right) + 1",     // 6
    ],
  },

  lca: {
    cpp: [
      "Node* lca(Node* root, int p, int q) {",     // 1
      "  vector<Node*> pathP, pathQ;",             // 2
      "  findPath(root, p, pathP);",                // 3
      "  findPath(root, q, pathQ);",                // 4
      "  for (int i = 0; i < min(pathP.size(),",   // 5
      "                    pathQ.size()); i++) {",  // 6
      "    if (pathP[i] != pathQ[i])",              // 7
      "      return pathP[i - 1];",                 // 8
      "  }",                                        // 9
      "  return pathP.back();",                     // 10
      "}",                                          // 11
    ],
    java: [
      "Node lca(Node root, int p, int q) {",       // 1
      "  List<Node> pathP = new ArrayList<>();",   // 2
      "  List<Node> pathQ = new ArrayList<>();",   // 3
      "  findPath(root, p, pathP);",                // 4
      "  findPath(root, q, pathQ);",                // 5
      "  for (int i = 0; i < Math.min(",            // 6
      "           pathP.size(), pathQ.size()); i++) {", // 7
      "    if (pathP.get(i) != pathQ.get(i))",      // 8
      "      return pathP.get(i - 1);",             // 9
      "  }",                                        // 10
      "  return pathP.get(pathP.size() - 1);",      // 11
      "}",                                          // 12
    ],
    python: [
      "def lca(root, p, q):",                       // 1
      "    pathP, pathQ = [], []",                  // 2
      "    find_path(root, p, pathP)",              // 3
      "    find_path(root, q, pathQ)",              // 4
      "    for i in range(min(len(pathP),",        // 5
      "                         len(pathQ))):",    // 6
      "        if pathP[i] != pathQ[i]:",           // 7
      "            return pathP[i - 1]",            // 8
      "    return pathP[-1]",                       // 9
    ],
  },

  pathsum: {
    cpp: [
      "void pathSum(Node* node, int sum) {",         // 1
      "  if (!node) return;",                        // 2
      "  if (!node->left && !node->right) {",         // 3
      "    if (sum == target) match();",             // 4
      "    return;",                                 // 5
      "  }",                                         // 6
      "  pathSum(node->left,  sum + node->val);",    // 7
      "  pathSum(node->right, sum + node->val);",    // 8
      "}",                                           // 9
    ],
    java: [
      "void pathSum(Node node, int sum) {",          // 1
      "  if (node == null) return;",                 // 2
      "  if (node.left == null && node.right == null) {", // 3
      "    if (sum == target) match();",             // 4
      "    return;",                                 // 5
      "  }",                                         // 6
      "  pathSum(node.left,  sum + node.val);",      // 7
      "  pathSum(node.right, sum + node.val);",      // 8
      "}",                                           // 9
    ],
    python: [
      "def path_sum(node, total):",                  // 1
      "    if not node:",                            // 2
      "        return",                              // 3
      "    if not node.left and not node.right:",    // 4
      "        if total == target:",                 // 5
      "            matches.append(path.copy())",     // 6
      "        return",                              // 7
      "    path_sum(node.left,  total + node.val)",  // 8
      "    path_sum(node.right, total + node.val)",  // 9
    ],
  },

  lifting: {
    cpp: [
      "Node* lift(Node* u, int k) {",                // 1
      "  for (int i = 0; i < LOG; i++) {",           // 2
      "    if (k & (1 << i))",                       // 3
      "      u = up[u][i];",                         // 4
      "  }",                                         // 5
      "  return u;",                                 // 6
      "}",                                           // 7
    ],
    java: [
      "Node lift(Node u, int k) {",                  // 1
      "  for (int i = 0; i < LOG; i++) {",           // 2
      "    if ((k & (1 << i)) != 0)",                // 3
      "      u = up[u][i];",                         // 4
      "  }",                                         // 5
      "  return u;",                                 // 6
      "}",                                           // 7
    ],
    python: [
      "def lift(u, k):",                             // 1
      "    for i in range(LOG):",                    // 2
      "        if k & (1 << i):",                    // 3
      "            u = up[u][i]",                    // 4
      "    return u",                                // 5
    ],
  },
};

/* ── Insert / Search / Delete in BST (used for sidebar buttons) ── */
listings.search = {
  cpp: [
    "Node* search(Node* root, int val) {",  // 1
    "  if (!root) return nullptr;",         // 2
    "  Node* curr = root;",                 // 3
    "  while (curr) {",                     // 4
    "    if (curr->val == val) return curr;",// 5
    "    if (val < curr->val)",             // 6
    "      curr = curr->left;",             // 7
    "    else",                             // 8
    "      curr = curr->right;",            // 9
    "  }",                                  // 10
    "  return nullptr;",                    // 11
    "}",                                    // 12
  ],
  java: [
    "Node search(Node root, int val) {",    // 1
    "  if (root == null) return null;",     // 2
    "  Node curr = root;",                  // 3
    "  while (curr != null) {",             // 4
    "    if (curr.val == val) return curr;",// 5
    "    if (val < curr.val)",              // 6
    "      curr = curr.left;",              // 7
    "    else",                             // 8
    "      curr = curr.right;",             // 9
    "  }",                                  // 10
    "  return null;",                       // 11
    "}",                                    // 12
  ],
  python: [
    "def search(root, val):",               // 1
    "    if not root:",                     // 2
    "        return None",                  // 3
    "    curr = root",                      // 4
    "    while curr:",                      // 5
    "        if curr.val == val:",          // 6
    "            return curr",              // 7
    "        if val < curr.val:",           // 8
    "            curr = curr.left",         // 9
    "        else:",                        // 10
    "            curr = curr.right",        // 11
    "    return None",                      // 12
  ],
};

listings.insert = {
  cpp: [
    "Node* insert(Node* root, int val) {",   // 1
    "  if (!root) return new Node(val);",    // 2
    "  if (val < root->val)",                // 3
    "    root->left = insert(root->left, val);",  // 4
    "  else",                                // 5
    "    root->right = insert(root->right, val);",// 6
    "  return root;",                        // 7
    "}",                                     // 8
  ],
  java: [
    "Node insert(Node root, int val) {",     // 1
    "  if (root == null) return new Node(val);", // 2
    "  if (val < root.val)",                 // 3
    "    root.left = insert(root.left, val);",  // 4
    "  else",                                // 5
    "    root.right = insert(root.right, val);",// 6
    "  return root;",                        // 7
    "}",                                     // 8
  ],
  python: [
    "def insert(root, val):",                // 1
    "    if not root:",                      // 2
    "        return Node(val)",              // 3
    "    if val < root.val:",                // 4
    "        root.left = insert(root.left, val)",  // 5
    "    else:",                             // 6
    "        root.right = insert(root.right, val)",// 7
    "    return root",                       // 8
  ],
};

/* ── Lookup helper ── */
export function getTreeCode(algorithm, language, traversalType) {
  const alg = listings[algorithm];
  if (!alg) return null;
  const langListing = alg[language] || alg.cpp;
  if (Array.isArray(langListing)) return langListing;
  // traversals is keyed by traversalType (preorder/inorder/postorder)
  if (traversalType && langListing[traversalType]) return langListing[traversalType];
  // Fallback: inorder
  return langListing.inorder || langListing.preorder || langListing.postorder;
}
