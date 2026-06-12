export const COLOR_BLIND_SAFE = {
  node: {
    UNVISITED: { fill: "#0077BB", border: "#0055AA" },
    CURRENT: { fill: "#EE7733", border: "#CC5500" },
    VISITED: { fill: "#33BBEE", border: "#1199CC" },
    IN_PATH: { fill: "#CC3311", border: "#AA1100" },
    SPECIAL: { fill: "#AA3377", border: "#881155" },
  },
  edge: {
    NORMAL: "#757575",
    RELAXED: "#EE7733",
    IN_PATH: "#CC3311",
    BRIDGE: "#BB5566",
  },
  components: [
    "#0077BB",
    "#EE7733",
    "#33BBEE",
    "#CC3311",
    "#AA3377",
    "#009988",
    "#BB5566",
  ],
};

export const DEFAULT_COLORS = {
  node: {
    UNVISITED: { fill: "#10b981", border: "#047857" },
    CURRENT: { fill: "#f59e0b", border: "#b45309" },
    VISITED: { fill: "#06b6d4", border: "#0891b2" },
    IN_PATH: { fill: "#ef4444", border: "#b91c1c" },
    SPECIAL: { fill: "#8b5cf6", border: "#6d28d9" },
  },
  edge: {
    NORMAL: "#757575",
    RELAXED: "#f59e0b",
    IN_PATH: "#ef4444",
    BRIDGE: "#f43f5e",
  },
  components: [
    "#ec4899",
    "#8b5cf6",
    "#f59e0b",
    "#3b82f6",
    "#10b981",
    "#06b6d4",
    "#ef4444",
  ],
};
