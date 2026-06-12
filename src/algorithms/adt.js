export class Vector {
  constructor(initial) {
    if (initial instanceof Vector) {
      this._data = [...initial._data];
    } else if (Array.isArray(initial)) {
      this._data = [...initial];
    } else if (typeof initial === "number") {
      this._data = new Array(initial);
    } else {
      this._data = [];
    }
  }

  get(i) { return this._data[i]; }
  set(i, v) { this._data[i] = v; }
  size() { return this._data.length; }
  swap(i, j) {
    const tmp = this._data[i];
    this._data[i] = this._data[j];
    this._data[j] = tmp;
  }
  slice(start, end) { return new Vector(this._data.slice(start, end)); }
  fill(v, start = 0, end = this._data.length) {
    this._data.fill(v, start, end);
  }
  push(v) { this._data.push(v); }
  toArray() { return [...this._data]; }
  max() { return Math.max(...this._data); }
  min() { return Math.min(...this._data); }

  map(fn) { return this._data.map(fn); }
  forEach(fn) { this._data.forEach(fn); }
  reduce(fn, acc) { return this._data.reduce(fn, acc); }
  filter(fn) { return this._data.filter(fn); }
  find(fn) { return this._data.find(fn); }
  join(sep) { return this._data.join(sep); }

  [Symbol.iterator]() { return this._data[Symbol.iterator](); }

  static from(len, fn) {
    return new Vector(Array.from({ length: len }, fn));
  }
}

export class ArrayList {
  constructor(initial) {
    this._data = initial instanceof ArrayList
      ? [...initial._data]
      : Array.isArray(initial)
        ? [...initial]
        : [];
    this._size = this._data.length;
  }

  add(val) { this._data.push(val); this._size++; }
  get(i) { return this._data[i]; }
  set(i, v) { this._data[i] = v; }
  size() { return this._size; }
  remove(i) {
    const v = this._data[i];
    this._data.splice(i, 1);
    this._size--;
    return v;
  }
  swap(i, j) {
    const tmp = this._data[i];
    this._data[i] = this._data[j];
    this._data[j] = tmp;
  }
  toArray() { return [...this._data]; }
  max() { return Math.max(...this._data); }
  min() { return Math.min(...this._data); }

  [Symbol.iterator]() { return this._data[Symbol.iterator](); }

  static from(len, fn) {
    const al = new ArrayList();
    for (let i = 0; i < len; i++) {
      al.add(fn ? fn(i) : undefined);
    }
    return al;
  }
}
