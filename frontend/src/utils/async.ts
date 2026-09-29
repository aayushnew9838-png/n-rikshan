/** Tiny concurrency-limited batch runner used by the map's derived layers. */
export async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<{ ok: R; item: T }[]> {
  const results: { ok: R; item: T }[] = [];
  let index = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (index < items.length) {
      const i = index;
      index += 1;
      try {
        const ok = await fn(items[i]);
        results.push({ ok, item: items[i] });
      } catch {
        /* skip failures */
      }
    }
  });
  await Promise.all(workers);
  return results;
}

export function memo<K, V>(key: string, compute: () => V, store: Map<K, V>): V | undefined {
  return store.get(key as unknown as K);
}
