export class ChangeMap {
  constructor() {
    this.previous = new Map();
    this.current = new Map();
  }
  set(key, add) {
    let value = this.previous.get(key);
    if (!value) {
      value = add(key);
    }
    this.previous.delete(key);
    this.current.set(key, value);
    return value;
  }
  next(removed) {
    for (let [key, handler] of this.previous.entries()) {
      removed(key, handler);
    }
    this.previous.clear();
    const swap = this.previous;
    this.previous = this.current;
    this.current = swap;
  }
}
//# sourceMappingURL=change-map.js.map
