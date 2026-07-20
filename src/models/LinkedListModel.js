export const ListNodeState = {
  DEFAULT: "DEFAULT",
  CURRENT: "CURRENT",
  VISITED: "VISITED",
  TARGET: "TARGET",
  DELETED: "DELETED",
  NEW: "NEW",
};

export class ListNode {
  constructor(id, value) {
    this.id = id;
    this.value = value;
    this.label = value.toString();
    this.next = null;
    this.prev = null;
    this.x = 0;
    this.y = 0;
    this.state = ListNodeState.DEFAULT;
  }
}

function snapshotData(nodesArray) {
  return nodesArray.map((n) => ({
    id: n.id,
    value: n.value,
    label: n.label,
    x: n.x,
    y: n.y,
    nextId: n.next ? n.next.id : null,
    prevId: n.prev ? n.prev.id : null,
  }));
}

export class LinkedListModel {
  constructor() {
    this.head = null;
    this.tail = null;
    this.nodeCounter = 0;
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.nodeCounter = 0;
  }

  getAllNodes() {
    const result = [];
    let curr = this.head;
    const visited = new Set();
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      result.push(curr);
      curr = curr.next;
    }
    return result;
  }

  generateRandom(count) {
    this.clear();
    for (let i = 0; i < count; i++) {
      const val = Math.floor(Math.random() * 90) + 10;
      this.insertAtTail(val, false);
    }
    this.layout();
  }

  stepObj(extra) {
    return {
      nodesSnapshot: snapshotData(this.getAllNodes()),
      ...extra,
    };
  }

  // Custom snapshot that includes a detached node (for insert animations)
  stepObjWith(extraNodes, extra) {
    const allNodes = [...this.getAllNodes(), ...extraNodes];
    return {
      nodesSnapshot: snapshotData(allNodes),
      ...extra,
    };
  }

  insertAtHead(value, doLayout = true) {
    const node = new ListNode(this.nodeCounter++, value);
    const steps = [];

    if (!this.head) {
      this.head = node;
      this.tail = node;
      if (doLayout) this.layout();
      steps.push(this.stepObj({
        description: `List was empty. Inserted ${value} as the head (and tail).`,
        codeLine: 3,
        pointerLabels: { [node.id]: "head/tail" },
        action: "insert",
      }));
      return steps;
    }

    // Step 1: Node* newNode = new Node(value)
    steps.push(this.stepObjWith([node], {
      description: `Created new node with value ${value}`,
      codeLine: 1,
      pointerLabels: { [node.id]: "newNode", [this.head.id]: "head" },
      action: "pointer",
    }));

    // Step 2: newNode->next = head
    node.next = this.head;
    steps.push(this.stepObjWith([node], {
      description: `newNode->next = head — newNode (${value}) now points to head (${this.head.value})`,
      codeLine: 5,
      pointerLabels: { [node.id]: "newNode", [this.head.id]: "head" },
      action: "relink",
    }));

    // Step 3: head->prev = newNode
    this.head.prev = node;
    steps.push(this.stepObjWith([node], {
      description: `head->prev = newNode — head (${this.head.value}) now points back to newNode`,
      codeLine: 6,
      pointerLabels: { [node.id]: "newNode", [this.head.id]: "head" },
      action: "relink",
    }));

    // Step 4: head = newNode
    this.head = node;
    if (doLayout) this.layout();
    steps.push(this.stepObj({
      description: `head = newNode — head updated to ${value}. List: ${this.toArray().join(" → ")}`,
      codeLine: 7,
      pointerLabels: { [node.id]: "head" },
      action: "done",
    }));

    return steps;
  }

  insertAtTail(value, doLayout = true) {
    const node = new ListNode(this.nodeCounter++, value);
    const steps = [];

    if (!this.head) {
      this.head = node;
      this.tail = node;
      if (doLayout) this.layout();
      steps.push(this.stepObj({
        description: `List was empty. Inserted ${value} as the tail.`,
        codeLine: 3,
        pointerLabels: { [node.id]: "head/tail" },
        action: "insert",
      }));
      return steps;
    }

    // Step 1: Node* newNode = new Node(value)
    steps.push(this.stepObjWith([node], {
      description: `Created new node with value ${value}`,
      codeLine: 1,
      pointerLabels: { [node.id]: "newNode", [this.tail.id]: "tail" },
      action: "pointer",
    }));

    // Step 2: tail->next = newNode
    this.tail.next = node;
    steps.push(this.stepObjWith([node], {
      description: `tail->next = newNode — tail (${this.tail.value}) now points to newNode (${value})`,
      codeLine: 5,
      pointerLabels: { [node.id]: "newNode", [this.tail.id]: "tail" },
      action: "relink",
    }));

    // Step 3: newNode->prev = tail
    node.prev = this.tail;
    steps.push(this.stepObjWith([node], {
      description: `newNode->prev = tail — newNode (${value}) now points back to tail (${this.tail.value})`,
      codeLine: 6,
      pointerLabels: { [node.id]: "newNode", [this.tail.id]: "tail" },
      action: "relink",
    }));

    // Step 4: tail = newNode
    this.tail = node;
    if (doLayout) this.layout();
    steps.push(this.stepObj({
      description: `tail = newNode — tail updated to ${value}. List: ${this.toArray().join(" → ")}`,
      codeLine: 7,
      pointerLabels: { [node.id]: "tail" },
      action: "done",
    }));

    return steps;
  }

  insertAtPosition(value, pos, doLayout = true) {
    if (pos <= 0) return this.insertAtHead(value, doLayout);
    const len = this.getLength();
    if (pos >= len) return this.insertAtTail(value, doLayout);

    const steps = [];
    const newNode = new ListNode(this.nodeCounter++, value);

    // Step 1: Node* newNode = new Node(value)
    steps.push(this.stepObjWith([newNode], {
      description: `Created new node with value ${value}`,
      codeLine: 2,
      pointerLabels: {},
      action: "pointer",
    }));

    // Step 2: Node* curr = head
    let curr = this.head;
    let idx = 0;
    steps.push(this.stepObjWith([newNode], {
      description: `curr = head — start traversal from head (${curr.value}) to find position ${pos}`,
      codeLine: 3,
      pointerLabels: { [curr.id]: "curr", [newNode.id]: "newNode" },
      action: "traverse",
    }));

    // Traversal steps: for (int i = 0; i < pos - 1 && curr; i++) curr = curr->next
    while (idx < pos - 1 && curr) {
      curr = curr.next;
      idx++;

      if (curr) {
        steps.push(this.stepObjWith([newNode], {
          description: `curr = curr->next — moved to node ${curr.value} (position ${idx})`,
          codeLine: 5,
          pointerLabels: { [curr.id]: "curr", [newNode.id]: "newNode" },
          action: "traverse",
        }));
      }
    }

    const prevNode = curr;
    curr = curr ? curr.next : null;

    // Show the insertion point with prev, curr, and newNode labels
    steps.push(this.stepObjWith([newNode], {
      description: `Insert ${value} at position ${pos} between ${prevNode ? prevNode.value : "head"} and ${curr ? curr.value : "tail"}`,
      codeLine: 5,
      pointerLabels: {
        ...(prevNode ? { [prevNode.id]: "prev" } : {}),
        ...(curr ? { [curr.id]: "curr" } : {}),
        [newNode.id]: "newNode",
      },
      action: "pointer",
    }));

    // Step: newNode->next = curr
    newNode.next = curr;
    steps.push(this.stepObjWith([newNode], {
      description: `newNode->next = curr — newNode (${value}) now points to ${curr ? curr.value : "null"}`,
      codeLine: 6,
      pointerLabels: {
        ...(prevNode ? { [prevNode.id]: "prev" } : {}),
        ...(curr ? { [curr.id]: "curr" } : {}),
        [newNode.id]: "newNode",
      },
      action: "relink",
    }));

    // Step: newNode->prev = prev
    newNode.prev = prevNode;
    steps.push(this.stepObjWith([newNode], {
      description: `newNode->prev = prev — newNode (${value}) now points back to ${prevNode ? prevNode.value : "null"}`,
      codeLine: 7,
      pointerLabels: {
        ...(prevNode ? { [prevNode.id]: "prev" } : {}),
        ...(curr ? { [curr.id]: "curr" } : {}),
        [newNode.id]: "newNode",
      },
      action: "relink",
    }));

    // Step: prev->next = newNode
    if (prevNode) prevNode.next = newNode;
    if (curr) curr.prev = newNode;
    if (doLayout) this.layout();
    steps.push(this.stepObj({
      description: `prev->next = newNode — inserted ${value} at position ${pos}. List: ${this.toArray().join(" → ")}`,
      codeLine: 9,
      pointerLabels: { [newNode.id]: "newNode" },
      action: "done",
    }));

    return steps;
  }

  deleteHead(doLayout = true) {
    const steps = [];
    if (!this.head) return steps;

    const oldHead = this.head;
    const newHead = this.head.next;

    // Step 1: temp = head
    steps.push(this.stepObj({
      description: `temp = head — temp now points to node ${oldHead.value}`,
      codeLine: 3,
      pointerLabels: { [oldHead.id]: "temp" },
      action: "pointer",
    }));

    // Step 2: head = head->next
    if (newHead) {
      newHead.prev = null;
      this.head = newHead;
    } else {
      this.head = null;
      this.tail = null;
    }

    steps.push(this.stepObjWith([oldHead], {
      description: `head = head->next — head moves to ${newHead ? newHead.value : "null"}, temp still holds ${oldHead.value}`,
      codeLine: 4,
      pointerLabels: { [oldHead.id]: "temp", ...(newHead ? { [newHead.id]: "head" } : {}) },
      action: "relink",
    }));

    // Step 3: delete temp
    steps.push(this.stepObjWith([oldHead], {
      description: `delete temp — free node ${oldHead.value} (isolated from list)`,
      codeLine: 7,
      pointerLabels: { [oldHead.id]: "temp" },
      action: "delete",
      deleteId: oldHead.id,
    }));

    if (doLayout) this.layout();

    // Step 4: done
    steps.push(this.stepObj({
      description: newHead
        ? `Deleted ${oldHead.value}. New head is ${newHead.value}. List: ${this.toArray().join(" → ")}`
        : `Deleted ${oldHead.value}. List is now empty.`,
      codeLine: 7,
      pointerLabels: newHead ? { [newHead.id]: "head" } : {},
      action: "done",
    }));

    return steps;
  }

  deleteTail(doLayout = true) {
    const steps = [];
    if (!this.head) return steps;

    if (this.head === this.tail) {
      return this.deleteHead(doLayout);
    }

    const oldTail = this.tail;
    const newTail = this.tail.prev;

    // Step 1: temp = tail
    steps.push(this.stepObj({
      description: `temp = tail — temp now points to node ${oldTail.value}`,
      codeLine: 3,
      pointerLabels: { [oldTail.id]: "temp" },
      action: "pointer",
    }));

    // Step 2: tail = tail->prev
    if (newTail) {
      newTail.next = null;
      this.tail = newTail;
    } else {
      this.head = null;
      this.tail = null;
    }

    steps.push(this.stepObjWith([oldTail], {
      description: `tail = tail->prev — tail moves to ${newTail ? newTail.value : "null"}, temp still holds ${oldTail.value}`,
      codeLine: 4,
      pointerLabels: { [oldTail.id]: "temp", ...(newTail ? { [newTail.id]: "tail" } : {}) },
      action: "relink",
    }));

    // Step 3: delete temp
    steps.push(this.stepObjWith([oldTail], {
      description: `delete temp — free node ${oldTail.value} (isolated from list)`,
      codeLine: 7,
      pointerLabels: { [oldTail.id]: "temp" },
      action: "delete",
      deleteId: oldTail.id,
    }));

    if (doLayout) this.layout();

    // Step 4: done
    steps.push(this.stepObj({
      description: newTail
        ? `Deleted ${oldTail.value}. New tail is ${newTail.value}. List: ${this.toArray().join(" → ")}`
        : `Deleted ${oldTail.value}. List is now empty.`,
      codeLine: 7,
      pointerLabels: newTail ? { [newTail.id]: "tail" } : {},
      action: "done",
    }));

    return steps;
  }

  deleteByValue(value, doLayout = true) {
    const steps = [];
    let curr = this.head;
    let idx = 0;

    while (curr) {
      const isTarget = curr.value === value;

      steps.push(this.stepObj({
        description: isTarget
          ? `Found target value ${value} at position ${idx}.`
          : `Node ${curr.value} at position ${idx} is not the target (${value}). Moving to next.`,
        codeLine: 3,
        pointerLabels: { [curr.id]: isTarget ? "target" : "curr" },
        action: isTarget ? "found" : "traverse",
      }));

      if (isTarget) {
        const prev = curr.prev;
        const next = curr.next;

        if (prev) {
          // Step: temp = curr (temp points to target)
          steps.push(this.stepObj({
            description: `temp = curr — temp now points to node ${curr.value}`,
            codeLine: 3,
            pointerLabels: {
              [prev.id]: "prev",
              [curr.id]: "temp",
              ...(next ? { [next.id]: "next" } : {}),
            },
            action: "pointer",
          }));

          // Step: prev->next = curr->next
          prev.next = next;
          if (next) next.prev = prev;
          if (curr === this.tail) this.tail = prev;

          steps.push(this.stepObjWith([curr], {
            description: `prev->next = curr->next — ${prev.value} now points to ${next ? next.value : "null"}, bypassing ${curr.value}`,
            codeLine: 7,
            pointerLabels: {
              [prev.id]: "prev",
              [curr.id]: "temp",
              ...(next ? { [next.id]: "next" } : {}),
            },
            action: "relink",
          }));

          // Step: delete temp
          steps.push(this.stepObjWith([curr], {
            description: `delete temp — free node ${curr.value} (isolated from list)`,
            codeLine: 10,
            pointerLabels: { [curr.id]: "temp" },
            action: "delete",
            deleteId: curr.id,
          }));

          if (doLayout) this.layout();

          // Step: done
          steps.push(this.stepObj({
            description: `Deleted node ${value}. List: ${this.toArray().join(" → ")}`,
            codeLine: 10,
            pointerLabels: prev ? { [prev.id]: "head" } : {},
            action: "done",
          }));
        } else {
          return this.deleteHead(doLayout);
        }

        return steps;
      }

      curr = curr.next;
      idx++;
    }

    steps.push(this.stepObj({
      description: `Value ${value} not found in the list.`,
      codeLine: 4,
      pointerLabels: {},
      action: "done",
    }));

    return steps;
  }

  reverse(doLayout = true) {
    const steps = [];
    if (!this.head || !this.head.next) {
      steps.push(this.stepObj({
        description: "List is empty or has one node. Nothing to reverse.",
        codeLine: 2,
        pointerLabels: {},
        action: "done",
      }));
      return steps;
    }

    const allRefs = [];
    let n = this.head;
    while (n) {
      allRefs.push(n);
      n = n.next;
    }

    const snapFromRefs = () => allRefs.map((n) => ({
      id: n.id,
      value: n.value,
      label: n.label,
      x: n.x,
      y: n.y,
      nextId: n.next ? n.next.id : null,
      prevId: n.prev ? n.prev.id : null,
    }));

    let prev = null;
    let curr = this.head;
    this.tail = this.head;

    // Step: Node* curr = head
    steps.push({
      nodesSnapshot: snapFromRefs(),
      description: `curr = head — curr points to head (${curr.value})`,
      codeLine: 1,
      pointerLabels: { [curr.id]: "curr" },
      action: "pointer",
    });

    // Step: Node* prev = nullptr
    steps.push({
      nodesSnapshot: snapFromRefs(),
      description: `prev = nullptr — prev initialized to null`,
      codeLine: 2,
      pointerLabels: { [curr.id]: "curr" },
      action: "pointer",
    });

    // Step: tail = head
    steps.push({
      nodesSnapshot: snapFromRefs(),
      description: `tail = head — tail starts at head (${this.tail.value})`,
      codeLine: 3,
      pointerLabels: { [curr.id]: "curr", [this.tail.id]: "tail" },
      action: "pointer",
    });

    while (curr) {
      const next = curr.next;

      // Step: Node* next = curr->next
      steps.push({
        nodesSnapshot: snapFromRefs(),
        description: `next = curr->next — save next pointer (${next ? next.value : "null"})`,
        codeLine: 5,
        pointerLabels: {
          [curr.id]: "curr",
          ...(prev ? { [prev.id]: "prev" } : {}),
          ...(next ? { [next.id]: "next" } : {}),
        },
        action: "traverse",
      });

      // Step: curr->next = prev
      curr.next = prev;
      steps.push({
        nodesSnapshot: snapFromRefs(),
        description: `curr->next = prev — ${curr.value} now points to ${prev ? prev.value : "null"}`,
        codeLine: 6,
        pointerLabels: {
          [curr.id]: "curr",
          ...(prev ? { [prev.id]: "prev" } : {}),
          ...(next ? { [next.id]: "next" } : {}),
        },
        action: "relink",
      });

      // Step: curr->prev = next
      curr.prev = next;
      steps.push({
        nodesSnapshot: snapFromRefs(),
        description: `curr->prev = next — ${curr.value}'s prev now points to ${next ? next.value : "null"}`,
        codeLine: 7,
        pointerLabels: {
          [curr.id]: "curr",
          ...(prev ? { [prev.id]: "prev" } : {}),
          ...(next ? { [next.id]: "next" } : {}),
        },
        action: "relink",
      });

      // Step: prev = curr; curr = next (advance)
      prev = curr;
      curr = next;
      steps.push({
        nodesSnapshot: snapFromRefs(),
        description: `prev = curr; curr = next — prev → ${prev.value}, curr → ${curr ? curr.value : "null"}`,
        codeLine: 8,
        pointerLabels: {
          ...(prev ? { [prev.id]: "prev" } : {}),
          ...(curr ? { [curr.id]: "curr" } : {}),
        },
        action: "traverse",
      });
    }

    // Step: head = prev
    this.head = prev;
    if (this.head) this.head.prev = null;
    if (doLayout) this.layout();
    steps.push({
      nodesSnapshot: snapFromRefs(),
      description: `head = prev — new head is ${this.head.value}. List: ${this.toArray().join(" → ")}`,
      codeLine: 11,
      pointerLabels: { [this.head.id]: "head" },
      action: "done",
    });

    return steps;
  }

  detectCycle(doLayout = true) {
    const steps = [];
    if (!this.head || !this.head.next) {
      steps.push(this.stepObj({
        description: "List too short for cycle detection demo.",
        codeLine: 2,
        pointerLabels: {},
        action: "done",
      }));
      return steps;
    }

    // Create a temporary cycle: connect tail.next to a random middle node
    const nodes = this.getAllNodes();
    const cycleTarget = nodes[Math.floor(nodes.length / 2)];
    this.tail.next = cycleTarget;

    steps.push(this.stepObj({
      description: `Created cycle: tail (${this.tail.value}) → node (${cycleTarget.value}). Running Floyd's detection...`,
      codeLine: 2,
      pointerLabels: { [this.tail.id]: "tail", [cycleTarget.id]: "target" },
      action: "traverse",
    }));

    let slow = this.head;
    let fast = this.head;

    steps.push(this.stepObj({
      description: `Slow and fast both start at head (${slow.value}).`,
      codeLine: 2,
      pointerLabels: { [slow.id]: "slow/fast" },
      action: "traverse",
    }));

    let maxIter = nodes.length * 3;
    while (fast && fast.next && maxIter-- > 0) {
      slow = slow.next;
      fast = fast.next.next;

      if (slow === fast) {
        steps.push(this.stepObj({
          description: `Cycle detected! Slow and fast met at node ${slow.value}.`,
          codeLine: 6,
          pointerLabels: { [slow.id]: "slow/fast" },
          action: "found",
        }));
        // Remove the cycle
        this.tail.next = null;
        return steps;
      }

      const labels = {};
      if (slow) labels[slow.id] = "slow";
      if (fast) labels[fast.id] = "fast";

      steps.push(this.stepObj({
        description: `Slow → ${slow ? slow.value : "null"}, Fast → ${fast ? fast.value : "null"}.`,
        codeLine: 4,
        pointerLabels: labels,
        action: "traverse",
      }));
    }

    // Remove the cycle (safety)
    this.tail.next = null;

    steps.push(this.stepObj({
      description: "No cycle detected.",
      codeLine: 8,
      pointerLabels: {},
      action: "done",
    }));

    return steps;
  }

  getMiddle(doLayout = true) {
    const steps = [];
    if (!this.head) return steps;

    let slow = this.head;
    let fast = this.head;

    steps.push(this.stepObj({
      description: `Start middle finding. Slow and fast at head (${slow.value}).`,
      codeLine: 2,
      pointerLabels: { [slow.id]: "slow/fast" },
      action: "traverse",
    }));

    while (fast && fast.next) {
      slow = slow.next;
      fast = fast.next.next;

      // FIX: check if fast is null before accessing fast.id
      const labels = {};
      if (slow) labels[slow.id] = "slow";
      if (fast) labels[fast.id] = "fast";

      steps.push(this.stepObj({
        description: `Slow → ${slow ? slow.value : "null"}, Fast → ${fast ? fast.value : "null"}`,
        codeLine: 4,
        pointerLabels: labels,
        action: "traverse",
      }));
    }

    steps.push(this.stepObj({
      description: `Middle element is ${slow.value}.`,
      codeLine: 7,
      pointerLabels: { [slow.id]: "middle" },
      action: "found",
    }));

    return steps;
  }

  search(value, doLayout = true) {
    const steps = [];
    let curr = this.head;
    let idx = 0;

    while (curr) {
      if (curr.value === value) {
        steps.push(this.stepObj({
          description: `Found ${value} at position ${idx}.`,
          codeLine: 4,
          pointerLabels: { [curr.id]: "found" },
          action: "found",
        }));
        return steps;
      }

      steps.push(this.stepObj({
        description: `Checking node ${curr.value} at position ${idx}. Not the target.`,
        codeLine: 4,
        pointerLabels: { [curr.id]: "curr" },
        action: "traverse",
      }));

      curr = curr.next;
      idx++;
    }

    steps.push(this.stepObj({
      description: `Value ${value} not found in the list.`,
      codeLine: 7,
      pointerLabels: {},
      action: "done",
    }));

    return steps;
  }

  toArray() {
    const result = [];
    let curr = this.head;
    const visited = new Set();
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      result.push(curr.value);
      curr = curr.next;
    }
    return result;
  }

  getLength() {
    let count = 0;
    let curr = this.head;
    const visited = new Set();
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      count++;
      curr = curr.next;
    }
    return count;
  }

  toNodesData() {
    return snapshotData(this.getAllNodes());
  }

  createCycle() {
    this.clear();
    for (let i = 0; i < 6; i++) {
      const val = Math.floor(Math.random() * 90) + 10;
      this.insertAtTail(val, false);
    }

    if (!this.head) return;

    const len = this.getLength();
    const cyclePos = Math.max(1, Math.floor(len / 2) - 1);
    let target = this.head;
    for (let i = 0; i < cyclePos; i++) {
      if (target) target = target.next;
    }

    if (this.tail && target) {
      this.tail.next = target;
    }

    this.layout();
  }

  hasCycle() {
    if (!this.head) return false;
    let slow = this.head;
    let fast = this.head;
    while (fast && fast.next) {
      slow = slow.next;
      fast = fast.next.next;
      if (slow === fast) return true;
    }
    return false;
  }

  resetStates() {
    let curr = this.head;
    const visited = new Set();
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      curr.state = ListNodeState.DEFAULT;
      curr = curr.next;
    }
  }

  layout(canvasWidth = 700) {
    const nodes = this.getAllNodes();
    const totalWidth = nodes.length * 120 - 20;
    const startX = Math.max(40, (canvasWidth - totalWidth) / 2);
    const y = 140;

    nodes.forEach((node, i) => {
      node.x = startX + i * 120;
      node.y = y;
    });
  }
}
