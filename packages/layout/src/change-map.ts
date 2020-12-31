/**
 * A Map style structure with callbacks when
 * items have been added for the first time and then removed
 * in between changes.
 */
type AddHandler<K, V> = (key: K) => V;
type RemoveHandler<K, V> = (key: K, value: V) => void;

export class ChangeMap<K, V> {
  private previous: Map<K, V> = new Map();
  private current: Map<K, V> = new Map();

  set(key: K, add: AddHandler<K, V>): V {
    let value = this.previous.get(key);
    if (!value) {
      value = add(key);
    }
    this.previous.delete(key);
    this.current.set(key, value);
    return value;
  }

  next(removed: RemoveHandler<K, V>) {
    for (let [key, handler] of this.previous.entries()) {
      removed(key, handler);
    }
    this.previous.clear();
    const swap = this.previous;
    this.previous = this.current;
    this.current = swap;
  }
}
