import { Vector } from "./adt";

function vec(arr) {
  if (arr instanceof Vector) return new Vector(arr);
  if (Array.isArray(arr)) return new Vector(arr);
  return arr;
}

function makeStep(vec, metadata = {}) {
  const base = {
    array: new Vector(vec),
    comparing: metadata.comparing || [],
    swapping: metadata.swapping || [],
    sorted: metadata.sorted ? new Set(metadata.sorted) : new Set(),
    pivot: metadata.pivot ?? null,
    activeRange: metadata.activeRange || null,
    merging: metadata.merging || [],
    ptr: metadata.ptr || {},
    description: metadata.description || "",
    codeLine: metadata.codeLine || 0,
    comparisons: metadata.comparisons || 0,
    swaps: metadata.swaps || 0,
  };
  for (const key of Object.keys(metadata)) {
    if (!(key in base)) {
      base[key] = metadata[key];
    }
  }
  return base;
}

export function buildBubbleSort(arr) {
  const steps = [];
  const a = vec(arr);
  const n = a.size();
  const sorted = new Set();
  let comps = 0, swaps = 0;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      comps++;
      steps.push(makeStep(a, {
        comparing: [j, j + 1],
        ptr: { i, j },
        sorted: [...sorted],
        description: `Compare A[${j}] = ${a.get(j)} and A[${j + 1}] = ${a.get(j + 1)}`,
        codeLine: 4,
        comparisons: comps,
        swaps,
      }));
      if (a.get(j) > a.get(j + 1)) {
        a.swap(j, j + 1);
        swaps++;
        steps.push(makeStep(a, {
          swapping: [j, j + 1],
          ptr: { i, j },
          sorted: [...sorted],
          description: `Swap — ${a.get(j + 1)} > ${a.get(j)}, so they exchange positions`,
          codeLine: 5,
          comparisons: comps,
          swaps,
        }));
      }
    }
    sorted.add(n - 1 - i);
    steps.push(makeStep(a, {
      sorted: [...sorted],
      ptr: { i },
      description: `Pass ${i + 1} complete — ${a.get(n - 1 - i)} bubbled to index ${n - 1 - i}`,
      codeLine: 8,
      comparisons: comps,
      swaps,
    }));
  }
  sorted.add(0);
  steps.push(makeStep(a, {
    sorted: [...sorted],
    description: `Bubble Sort complete — array is sorted in ${comps} comparisons and ${swaps} swaps`,
    codeLine: 10,
    comparisons: comps,
    swaps,
  }));
  return steps;
}

export function buildSelectionSort(arr) {
  const steps = [];
  const a = vec(arr);
  const n = a.size();
  const sorted = new Set();
  let comps = 0, swaps = 0;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push(makeStep(a, {
      comparing: [i],
      ptr: { i, min: minIdx },
      sorted: [...sorted],
      description: `Set minIdx = ${i} (value ${a.get(i)}), scanning for a smaller element`,
      codeLine: 3,
      comparisons: comps,
      swaps,
    }));

    for (let j = i + 1; j < n; j++) {
      comps++;
      steps.push(makeStep(a, {
        comparing: [j, minIdx],
        ptr: { i, j, min: minIdx },
        sorted: [...sorted],
        description: `Check if A[${j}] = ${a.get(j)} < current minimum ${a.get(minIdx)} at index ${minIdx}`,
        codeLine: 5,
        comparisons: comps,
        swaps,
      }));
      if (a.get(j) < a.get(minIdx)) {
        minIdx = j;
        steps.push(makeStep(a, {
          comparing: [minIdx],
          ptr: { i, j, min: minIdx },
          sorted: [...sorted],
          description: `New minimum found — ${a.get(minIdx)} at index ${minIdx}`,
          codeLine: 6,
          comparisons: comps,
          swaps,
        }));
      }
    }

    if (minIdx !== i) {
      a.swap(i, minIdx);
      swaps++;
      steps.push(makeStep(a, {
        swapping: [i, minIdx],
        ptr: { i, min: minIdx },
        sorted: [...sorted],
        description: `Swap A[${i}] = ${a.get(i)} with A[${minIdx}] = ${a.get(minIdx)} — smallest goes to front`,
        codeLine: 8,
        comparisons: comps,
        swaps,
      }));
    }
    sorted.add(i);
    steps.push(makeStep(a, {
      sorted: [...sorted],
      ptr: { i },
      description: `Element ${a.get(i)} is now in its correct sorted position at index ${i}`,
      codeLine: 9,
      comparisons: comps,
      swaps,
    }));
  }
  sorted.add(n - 1);
  steps.push(makeStep(a, {
    sorted: [...sorted],
    description: `Selection Sort complete — ${n} elements sorted with ${comps} comparisons and ${swaps} swaps`,
    codeLine: 10,
    comparisons: comps,
    swaps,
  }));
  return steps;
}

export function buildInsertionSort(arr) {
  const steps = [];
  const a = vec(arr);
  const n = a.size();
  const sorted = new Set([0]);
  let comps = 0, swaps = 0;

  steps.push(makeStep(a, {
    sorted: [...sorted],
    ptr: { i: 0 },
    description: `First element ${a.get(0)} at index 0 is trivially sorted by itself`,
    codeLine: 2,
    comparisons: comps,
    swaps,
  }));

  for (let i = 1; i < n; i++) {
    const key = a.get(i);
    steps.push(makeStep(a, {
      comparing: [i],
      ptr: { i, key: i },
      sorted: [...sorted],
      description: `Pick key = ${key} at index ${i} — insert it into the sorted portion [0..${i - 1}]`,
      codeLine: 4,
      comparisons: comps,
      swaps,
    }));

    let j = i - 1;
    comps++;
    while (j >= 0 && a.get(j) > key) {
      comps++;
      a.set(j + 1, a.get(j));
      swaps++;
      steps.push(makeStep(a, {
        swapping: [j, j + 1],
        ptr: { i, key: i, j },
        sorted: [...sorted],
        description: `Shift ${a.get(j)} right from index ${j} to ${j + 1} (it is larger than key ${key})`,
        codeLine: 7,
        comparisons: comps,
        swaps,
      }));
      j--;
    }

    a.set(j + 1, key);
    sorted.add(i);
    steps.push(makeStep(a, {
      sorted: [...sorted],
      ptr: { i, key: j + 1 },
      description: `Inserted ${key} at index ${j + 1} — sorted portion is now [0..${i}]`,
      codeLine: 10,
      comparisons: comps,
      swaps,
    }));
  }
  steps.push(makeStep(a, {
    sorted: [...sorted],
    description: `Insertion Sort complete — array sorted with ${comps} comparisons`,
    codeLine: 12,
    comparisons: comps,
    swaps,
  }));
  return steps;
}

export function buildMergeSort(arr) {
  const steps = [];
  const a = vec(arr);
  const n = a.size();
  let comps = 0, swaps = 0;

  function mergeSort(left, right) {
    if (left >= right) {
      steps.push(makeStep(a, {
        sorted: [left],
        ptr: { l: left, r: right },
        description: `Base case — single element ${a.get(left)} at index ${left}, trivially sorted`,
        codeLine: 2,
        comparisons: comps,
        swaps,
      }));
      return;
    }
    const mid = Math.floor((left + right) / 2);
    steps.push(makeStep(a, {
      activeRange: [left, right],
      ptr: { l: left, m: mid, r: right },
      description: `Split range [${left}..${right}] at mid = ${mid}`,
      codeLine: 3,
      comparisons: comps,
      swaps,
    }));
    mergeSort(left, mid);
    mergeSort(mid + 1, right);
    merge(left, mid, right);
  }

  function merge(left, mid, right) {
    const leftArr = a.slice(left, mid + 1);
    const rightArr = a.slice(mid + 1, right + 1);

    steps.push(makeStep(a, {
      activeRange: [left, right],
      merging: [...Array(right - left + 1).keys()].map((_, i) => left + i),
      ptr: { l: left, m: mid, r: right },
      description: `Left = [${leftArr.toArray().join(", ")}], Right = [${rightArr.toArray().join(", ")}] — merging`,
      codeLine: 10,
      comparisons: comps,
      swaps,
    }));

    let i = 0, j = 0, k = left;

    while (i < leftArr.size() && j < rightArr.size()) {
      comps++;
      steps.push(makeStep(a, {
        comparing: [left + i, mid + 1 + j],
        activeRange: [left, right],
        ptr: { l: left, r: right, i: left + i, j: mid + 1 + j, k },
        description: `Compare L[${i}] = ${leftArr.get(i)} and R[${j}] = ${rightArr.get(j)} — pick the smaller`,
        codeLine: 15,
        comparisons: comps,
        swaps,
      }));
      if (leftArr.get(i) <= rightArr.get(j)) {
        a.set(k, leftArr.get(i));
        i++;
      } else {
        a.set(k, rightArr.get(j));
        j++;
      }
      steps.push(makeStep(a, {
        merging: [k],
        activeRange: [left, right],
        ptr: { l: left, r: right, k },
        description: `Place ${a.get(k)} at A[${k}]`,
        codeLine: 15,
        comparisons: comps,
        swaps,
      }));
      k++;
    }

    while (i < leftArr.size()) {
      a.set(k, leftArr.get(i));
      steps.push(makeStep(a, {
        merging: [k],
        activeRange: [left, right],
        ptr: { l: left, r: right, k },
        description: `Copy remaining from L — place ${leftArr.get(i)} at A[${k}]`,
        codeLine: 18,
        comparisons: comps,
        swaps,
      }));
      i++; k++;
    }
    while (j < rightArr.size()) {
      a.set(k, rightArr.get(j));
      steps.push(makeStep(a, {
        merging: [k],
        activeRange: [left, right],
        ptr: { l: left, r: right, k },
        description: `Copy remaining from R — place ${rightArr.get(j)} at A[${k}]`,
        codeLine: 19,
        comparisons: comps,
        swaps,
      }));
      j++; k++;
    }

    steps.push(makeStep(a, {
      activeRange: [left, right],
      ptr: { l: left, m: mid, r: right },
      description: `Merge of [${left}..${right}] complete — subarray is now sorted`,
      codeLine: 20,
      comparisons: comps,
      swaps,
    }));
  }

  mergeSort(0, n - 1);
  steps.push(makeStep(a, {
    sorted: [...Array(n).keys()],
    description: `Merge Sort complete — array sorted with ${comps} comparisons`,
    codeLine: 20,
    comparisons: comps,
    swaps,
  }));
  return steps;
}

export function buildQuickSort(arr) {
  const steps = [];
  const a = vec(arr);
  const n = a.size();
  let comps = 0, swaps = 0;

  function quickSort(low, high) {
    if (low >= high) {
      if (low === high) {
        steps.push(makeStep(a, {
          sorted: [low],
          ptr: { low, high },
          description: `Base case — single element ${a.get(low)} at index ${low}, already sorted`,
          codeLine: 2,
          comparisons: comps,
          swaps,
        }));
      }
      return;
    }

    steps.push(makeStep(a, {
      activeRange: [low, high],
      ptr: { low, high },
      description: `Partitioning subarray [${low}..${high}] — pick pivot and rearrange`,
      codeLine: 3,
      comparisons: comps,
      swaps,
    }));

    const pivotIdx = partition(low, high);

    steps.push(makeStep(a, {
      pivot: pivotIdx,
      sorted: [pivotIdx],
      activeRange: [low, high],
      ptr: { low, high, pivot: pivotIdx },
      description: `Pivot ${a.get(pivotIdx)} is now at its correct sorted position ${pivotIdx}`,
      codeLine: 4,
      comparisons: comps,
      swaps,
    }));

    quickSort(low, pivotIdx - 1);
    quickSort(pivotIdx + 1, high);
  }

  function partition(low, high) {
    const pivot = a.get(high);
    let i = low - 1;

    steps.push(makeStep(a, {
      pivot: high,
      activeRange: [low, high],
      ptr: { low, high, pivot: high },
      description: `Choose pivot = ${pivot} (last element at index ${high})`,
      codeLine: 8,
      comparisons: comps,
      swaps,
    }));

    steps.push(makeStep(a, {
      pivot: high,
      activeRange: [low, high],
      ptr: { low, high, pivot: high, i: low - 1 },
      description: `Initialize partition boundary i = ${i} — elements < pivot go left of i`,
      codeLine: 9,
      comparisons: comps,
      swaps,
    }));

    for (let j = low; j < high; j++) {
      comps++;
      steps.push(makeStep(a, {
        comparing: [j, high],
        pivot: high,
        activeRange: [low, high],
        ptr: { low, high, pivot: high, i, j },
        description: `Compare A[${j}] = ${a.get(j)} with pivot ${pivot}`,
        codeLine: 11,
        comparisons: comps,
        swaps,
      }));

      if (a.get(j) < pivot) {
        i++;
        a.swap(i, j);
        swaps++;
        steps.push(makeStep(a, {
          swapping: [i, j],
          pivot: high,
          activeRange: [low, high],
          ptr: { low, high, pivot: high, i, j },
          description: `A[${j}] = ${a.get(i)} < pivot — swap with A[${i}] = ${a.get(j)}, advance boundary to ${i}`,
          codeLine: 12,
          comparisons: comps,
          swaps,
        }));
      }
    }

    a.swap(i + 1, high);
    swaps++;
    steps.push(makeStep(a, {
      swapping: [i + 1, high],
      pivot: i + 1,
      activeRange: [low, high],
      ptr: { low, high, pivot: i + 1, i: i + 1 },
      description: `Place pivot ${pivot} at its final index ${i + 1}`,
      codeLine: 15,
      comparisons: comps,
      swaps,
    }));

    return i + 1;
  }

  quickSort(0, n - 1);
  steps.push(makeStep(a, {
    sorted: [...Array(n).keys()],
    description: `Quick Sort complete — array sorted with ${comps} comparisons and ${swaps} swaps`,
    codeLine: 17,
    comparisons: comps,
    swaps,
  }));
  return steps;
}

export function buildRadixSort(arr) {
  const steps = [];
  const a = vec(arr);
  const n = a.size();
  if (n === 0) return steps;
  let comps = 0, swaps = 0;

  const maxVal = a.max();
  const maxDigits = maxVal.toString().length;

  steps.push(makeStep(a, {
    description: `Radix Sort — max value = ${maxVal}, ${maxDigits} digit(s). Sorts digit-by-digit from LSD to MSD`,
    codeLine: 2,
    comparisons: comps,
    swaps,
  }));

  for (let d = 0; d < maxDigits; d++) {
    const exp = Math.pow(10, d);
    const output = new Array(n).fill(0);
    const count = new Array(10).fill(0);

    const placeLabel = d === 0 ? "Ones" : d === 1 ? "Tens" : d === 2 ? "Hundreds" : `10^${d}`;

    const allDigits = Vector.from(n, (i) => Math.floor(a.get(i) / exp) % 10);
    const cl = ["0","1","2","3","4","5","6","7","8","9"];

    steps.push(makeStep(a, {
      currentPlace: exp,
      placeLabel,
      digitValues: allDigits.toArray(),
      countArray: count.map((v) => v),
      countLabels: cl,
      description: `--- ${placeLabel} place (×${exp}) --- Sorting by the ${placeLabel.toLowerCase()} digit`,
      codeLine: 3,
      comparisons: comps,
      swaps,
    }));

    for (let i = 0; i < n; i++) {
      const digit = Math.floor(a.get(i) / exp) % 10;
      count[digit]++;
      comps++;
      steps.push(makeStep(a, {
        comparing: [i],
        ptr: { i },
        currentPlace: exp,
        placeLabel,
        digitValues: allDigits.toArray(),
        countArray: count.map((v) => v),
        countLabels: cl,
        description: `${a.get(i)} → ${placeLabel.toLowerCase()} digit = ${digit}, count[${digit}] = ${count[digit]}`,
        codeLine: 9,
        comparisons: comps,
        swaps,
      }));
    }

    steps.push(makeStep(a, {
      currentPlace: exp,
      placeLabel,
      digitValues: allDigits.toArray(),
      countArray: count.map((v) => v),
      countLabels: cl,
      description: `Count [0..9]: [${count.join(", ")}] — frequencies of each ${placeLabel.toLowerCase()} digit`,
      codeLine: 10,
      comparisons: comps,
      swaps,
    }));

    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    steps.push(makeStep(a, {
      currentPlace: exp,
      placeLabel,
      digitValues: allDigits.toArray(),
      countArray: count.map((v) => v),
      countLabels: cl,
      description: `Prefix sum: [${count.join(", ")}] — cumulative positions for stable placement`,
      codeLine: 11,
      comparisons: comps,
      swaps,
    }));

    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(a.get(i) / exp) % 10;
      const idx = count[digit] - 1;
      output[idx] = a.get(i);
      count[digit]--;
      comps++;
      steps.push(makeStep(a, {
        comparing: [i],
        ptr: { i },
        currentPlace: exp,
        placeLabel,
        digitValues: allDigits.toArray(),
        outputArray: output.map((v) => v),
        countArray: count.map((v) => v),
        countLabels: cl,
        description: `Place ${a.get(i)} (${placeLabel.toLowerCase()} digit = ${digit}) at output[${idx}]`,
        codeLine: 13,
        comparisons: comps,
        swaps,
      }));
    }

    for (let i = 0; i < n; i++) {
      a.set(i, output[i]);
    }
    swaps++;
    steps.push(makeStep(a, {
      currentPlace: exp,
      placeLabel,
      description: `Array after ${placeLabel} place sort: [${a.toArray().join(", ")}]`,
      codeLine: 17,
      comparisons: comps,
      swaps,
    }));
  }

  steps.push(makeStep(a, {
    sorted: [...Array(n).keys()],
    description: `Radix Sort complete — ${maxDigits} digit passes. Array sorted in O(${maxDigits} × (N + 10)) time`,
    codeLine: 18,
    comparisons: comps,
    swaps,
  }));
  return steps;
}

const ALGORITHM_BUILDERS = {
  bubble: buildBubbleSort,
  selection: buildSelectionSort,
  insertion: buildInsertionSort,
  merge: buildMergeSort,
  quick: buildQuickSort,
  radix: buildRadixSort,
};

export function buildSortingSteps(algorithm, array) {
  const builder = ALGORITHM_BUILDERS[algorithm];
  if (!builder) return [];
  const vecArr = array instanceof Vector ? array : new Vector(array);
  return builder(vecArr);
}

export const ALGORITHM_NAMES = {
  bubble: "Bubble Sort",
  selection: "Selection Sort",
  insertion: "Insertion Sort",
  merge: "Merge Sort",
  quick: "Quick Sort",
  radix: "Radix Sort",
};
