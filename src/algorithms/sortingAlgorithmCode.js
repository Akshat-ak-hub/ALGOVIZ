const listings = {
  bubble: {
    cpp: [
      "void bubbleSort(int arr[], int n) {",     // 1
      "  for (int i = 0; i < n - 1; i++) {",     // 2
      "    for (int j = 0; j < n - 1 - i; j++) {",// 3
      "      if (arr[j] > arr[j + 1]) {",        // 4
      "        swap(arr[j], arr[j + 1]);",        // 5
      "      }",                                  // 6
      "    }",                                    // 7
      "    // arr[n-1-i] is now sorted",          // 8
      "  }",                                      // 9
      "}",                                        // 10
    ],
    java: [
      "void bubbleSort(int[] arr) {",             // 1
      "  int n = arr.length;",                    // 2
      "  for (int i = 0; i < n - 1; i++) {",     // 3
      "    for (int j = 0; j < n - 1 - i; j++) {",// 4
      "      if (arr[j] > arr[j + 1]) {",        // 5
      "        int t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t;",// 6
      "      }",                                  // 7
      "    }",                                    // 8
      "  }",                                      // 9
      "}",                                        // 10
    ],
    python: [
      "def bubble_sort(arr):",                    // 1
      "    n = len(arr)",                         // 2
      "    for i in range(n - 1):",               // 3
      "        for j in range(n - 1 - i):",       // 4
      "            if arr[j] > arr[j + 1]:",      // 5
      "                arr[j], arr[j+1] = arr[j+1], arr[j]",// 6
      "    return arr",                           // 7
    ],
  },
  selection: {
    cpp: [
      "void selectionSort(int arr[], int n) {",   // 1
      "  for (int i = 0; i < n - 1; i++) {",     // 2
      "    int minIdx = i;",                      // 3
      "    for (int j = i + 1; j < n; j++) {",    // 4
      "      if (arr[j] < arr[minIdx])",          // 5
      "        minIdx = j;",                      // 6
      "    }",                                    // 7
      "    swap(arr[i], arr[minIdx]);",           // 8
      "  }",                                      // 9
      "}",                                        // 10
    ],
    java: [
      "void selectionSort(int[] arr) {",          // 1
      "  int n = arr.length;",                    // 2
      "  for (int i = 0; i < n - 1; i++) {",     // 3
      "    int minIdx = i;",                      // 4
      "    for (int j = i + 1; j < n; j++) {",    // 5
      "      if (arr[j] < arr[minIdx])",          // 6
      "        minIdx = j;",                      // 7
      "    }",                                    // 8
      "    int t = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = t;",// 9
      "  }",                                      // 10
      "}",                                        // 11
    ],
    python: [
      "def selection_sort(arr):",                 // 1
      "    n = len(arr)",                         // 2
      "    for i in range(n - 1):",               // 3
      "        min_idx = i",                      // 4
      "        for j in range(i + 1, n):",        // 5
      "            if arr[j] < arr[min_idx]:",    // 6
      "                min_idx = j",              // 7
      "        arr[i], arr[min_idx] = arr[min_idx], arr[i]",// 8
      "    return arr",                           // 9
    ],
  },
  insertion: {
    cpp: [
      "void insertionSort(int arr[], int n) {",   // 1
      "  // arr[0] is trivially sorted",          // 2
      "  for (int i = 1; i < n; i++) {",         // 3
      "    int key = arr[i];",                    // 4
      "    int j = i - 1;",                       // 5
      "    while (j >= 0 && arr[j] > key) {",    // 6
      "      arr[j + 1] = arr[j];",              // 7
      "      j--;",                               // 8
      "    }",                                    // 9
      "    arr[j + 1] = key;",                    // 10
      "  }",                                      // 11
      "}",                                        // 12
    ],
    java: [
      "void insertionSort(int[] arr) {",          // 1
      "  int n = arr.length;",                    // 2
      "  for (int i = 1; i < n; i++) {",         // 3
      "    int key = arr[i];",                    // 4
      "    int j = i - 1;",                       // 5
      "    while (j >= 0 && arr[j] > key) {",    // 6
      "      arr[j + 1] = arr[j];",              // 7
      "      j--;",                               // 8
      "    }",                                    // 9
      "    arr[j + 1] = key;",                    // 10
      "  }",                                      // 11
      "}",                                        // 12
    ],
    python: [
      "def insertion_sort(arr):",                 // 1
      "    for i in range(1, len(arr)):",         // 2
      "        key = arr[i]",                     // 3
      "        j = i - 1",                        // 4
      "        while j >= 0 and arr[j] > key:",  // 5
      "            arr[j + 1] = arr[j]",          // 6
      "            j -= 1",                      // 7
      "        arr[j + 1] = key",                // 8
      "    return arr",                           // 9
    ],
  },
  merge: {
    cpp: [
      "void mergeSort(int arr[], int l, int r) {",// 1
      "  if (l >= r) return;",                   // 2
      "  int m = (l + r) / 2;",                  // 3
      "  mergeSort(arr, l, m);",                // 4
      "  mergeSort(arr, m + 1, r);",            // 5
      "  merge(arr, l, m, r);",                 // 6
      "}",                                        // 7
      "void merge(int arr[], int l, int m, int r) {",// 8
      "  int n1 = m - l + 1, n2 = r - m;",      // 9
      "  int L[n1], R[n2];",                    // 10
      "  for (int i = 0; i < n1; i++) L[i] = arr[l + i];",// 11
      "  for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];",// 12
      "  int i = 0, j = 0, k = l;",             // 13
      "  while (i < n1 && j < n2) {",           // 14
      "    if (L[i] <= R[j]) arr[k++] = L[i++];",// 15
      "    else arr[k++] = R[j++];",            // 16
      "  }",                                    // 17
      "  while (i < n1) arr[k++] = L[i++];",   // 18
      "  while (j < n2) arr[k++] = R[j++];",   // 19
      "}",                                      // 20
    ],
    java: [
      "void mergeSort(int[] arr, int l, int r) {",// 1
      "  if (l >= r) return;",                   // 2
      "  int m = (l + r) / 2;",                  // 3
      "  mergeSort(arr, l, m);",                // 4
      "  mergeSort(arr, m + 1, r);",            // 5
      "  merge(arr, l, m, r);",                 // 6
      "}",                                        // 7
      "void merge(int[] arr, int l, int m, int r) {",// 8
      "  int n1 = m - l + 1, n2 = r - m;",      // 9
      "  int[] L = new int[n1], R = new int[n2];",// 10
      "  for (int i = 0; i < n1; i++) L[i] = arr[l + i];",// 11
      "  for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];",// 12
      "  int i = 0, j = 0, k = l;",             // 13
      "  while (i < n1 && j < n2) {",           // 14
      "    if (L[i] <= R[j]) arr[k++] = L[i++];",// 15
      "    else arr[k++] = R[j++];",            // 16
      "  }",                                    // 17
      "  while (i < n1) arr[k++] = L[i++];",   // 18
      "  while (j < n2) arr[k++] = R[j++];",   // 19
      "}",                                      // 20
    ],
    python: [
      "def merge_sort(arr):",                     // 1
      "    if len(arr) <= 1: return arr",        // 2
      "    mid = len(arr) // 2",                 // 3
      "    left = merge_sort(arr[:mid])",        // 4
      "    right = merge_sort(arr[mid:])",       // 5
      "    return merge(left, right)",           // 6
      "def merge(left, right):",                 // 7
      "    i = j = 0; res = []",                // 8
      "    while i < len(left) and j < len(right):",// 9
      "        if left[i] <= right[j]:",         // 10
      "            res.append(left[i]); i += 1", // 11
      "        else:",                           // 12
      "            res.append(right[j]); j += 1",// 13
      "    res.extend(left[i:] or right[j:])",  // 14
      "    return res",                          // 15
    ],
  },
  quick: {
    cpp: [
      "void quickSort(int arr[], int low, int high) {",// 1
      "  if (low >= high) return;",             // 2
      "  int pi = partition(arr, low, high);",  // 3
      "  quickSort(arr, low, pi - 1);",        // 4
      "  quickSort(arr, pi + 1, high);",       // 5
      "}",                                      // 6
      "int partition(int arr[], int low, int high) {",// 7
      "  int pivot = arr[high];",               // 8
      "  int i = low - 1;",                     // 9
      "  for (int j = low; j < high; j++) {",   // 10
      "    if (arr[j] < pivot) {",              // 11
      "      i++; swap(arr[i], arr[j]);",       // 12
      "    }",                                  // 13
      "  }",                                    // 14
      "  swap(arr[i + 1], arr[high]);",        // 15
      "  return i + 1;",                       // 16
      "}",                                      // 17
    ],
    java: [
      "void quickSort(int[] arr, int low, int high) {",// 1
      "  if (low >= high) return;",             // 2
      "  int pi = partition(arr, low, high);",  // 3
      "  quickSort(arr, low, pi - 1);",        // 4
      "  quickSort(arr, pi + 1, high);",       // 5
      "}",                                      // 6
      "int partition(int[] arr, int low, int high) {",// 7
      "  int pivot = arr[high];",               // 8
      "  int i = low - 1;",                     // 9
      "  for (int j = low; j < high; j++) {",   // 10
      "    if (arr[j] < pivot) {",              // 11
      "      i++; int t = arr[i]; arr[i] = arr[j]; arr[j] = t;",// 12
      "    }",                                  // 13
      "  }",                                    // 14
      "  int t = arr[i+1]; arr[i+1] = arr[high]; arr[high] = t;",// 15
      "  return i + 1;",                       // 16
      "}",                                      // 17
    ],
    python: [
      "def quick_sort(arr, low, high):",         // 1
      "    if low >= high: return",             // 2
      "    pi = partition(arr, low, high)",     // 3
      "    quick_sort(arr, low, pi - 1)",       // 4
      "    quick_sort(arr, pi + 1, high)",      // 5
      "def partition(arr, low, high):",          // 6
      "    pivot = arr[high]",                   // 7
      "    i = low - 1",                         // 8
      "    for j in range(low, high):",          // 9
      "        if arr[j] < pivot:",              // 10
      "            i += 1",                      // 11
      "            arr[i], arr[j] = arr[j], arr[i]",// 12
      "    arr[i+1], arr[high] = arr[high], arr[i+1]",// 13
      "    return i + 1",                       // 14
    ],
  },
  radix: {
    cpp: [
      "void radixSort(int arr[], int n) {",      // 1
      "  int maxVal = *max_element(arr, arr + n);",// 2
      "  for (int exp = 1; maxVal / exp > 0; exp *= 10)",// 3
      "    countingSortByDigit(arr, n, exp);",   // 4
      "}",                                       // 5
      "void countingSortByDigit(int arr[], int n, int exp) {",// 6
      "  int output[n], count[10] = {};",       // 7
      "  for (int i = 0; i < n; i++)",          // 8
      "    count[(arr[i] / exp) % 10]++;",      // 9
      "  for (int i = 1; i < 10; i++)",         // 10
      "    count[i] += count[i - 1];",          // 11
      "  for (int i = n - 1; i >= 0; i--) {",  // 12
      "    output[count[(arr[i] / exp) % 10] - 1] = arr[i];",// 13
      "    count[(arr[i] / exp) % 10]--;",      // 14
      "  }",                                    // 15
      "  for (int i = 0; i < n; i++)",          // 16
      "    arr[i] = output[i];",               // 17
      "}",                                      // 18
    ],
    java: [
      "void radixSort(int[] arr) {",             // 1
      "  int maxVal = Arrays.stream(arr).max().getAsInt();",// 2
      "  for (int exp = 1; maxVal / exp > 0; exp *= 10)",// 3
      "    countingSortByDigit(arr, exp);",      // 4
      "}",                                       // 5
      "void countingSortByDigit(int[] arr, int exp) {",// 6
      "  int n = arr.length;",                   // 7
      "  int[] output = new int[n];",           // 8
      "  int[] count = new int[10];",           // 9
      "  for (int v : arr) count[(v / exp) % 10]++;",// 10
      "  for (int i = 1; i < 10; i++)",         // 11
      "    count[i] += count[i - 1];",          // 12
      "  for (int i = n - 1; i >= 0; i--) {",  // 13
      "    output[count[(arr[i] / exp) % 10] - 1] = arr[i];",// 14
      "    count[(arr[i] / exp) % 10]--;",      // 15
      "  }",                                    // 16
      "  System.arraycopy(output, 0, arr, 0, n);",// 17
      "}",                                      // 18
    ],
    python: [
      "def radix_sort(arr):",                     // 1
      "    max_val = max(arr)",                  // 2
      "    exp = 1",                             // 3
      "    while max_val // exp > 0:",           // 4
      "        counting_sort_by_digit(arr, exp)",// 5
      "        exp *= 10",                       // 6
      "def counting_sort_by_digit(arr, exp):",   // 7
      "    n = len(arr)",                        // 8
      "    output = [0] * n",                    // 9
      "    count = [0] * 10",                   // 10
      "    for v in arr: count[(v // exp) % 10] += 1",// 11
      "    for i in range(1, 10): count[i] += count[i - 1]",// 12
      "    for v in reversed(arr):",            // 13
      "        d = (v // exp) % 10",            // 14
      "        output[count[d] - 1] = v",        // 15
      "        count[d] -= 1",                  // 16
      "    for i in range(n): arr[i] = output[i]",// 17
    ],
  },
};

export function getSortingCode(algorithm, language) {
  const alg = listings[algorithm];
  if (!alg) return null;
  return alg[language] || alg.cpp;
}
