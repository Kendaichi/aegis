import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

type Entry<T> = {
  data: T;
  fetchedAt: number;
  inFlight?: Promise<T>;
};

const store = new Map<string, Entry<unknown>>();
const listeners = new Map<string, Set<() => void>>();

export const DEFAULT_TTL_MS = 30_000;

function notifyKey(key: string): void {
  listeners.get(key)?.forEach((cb) => {
    cb();
  });
}

export function getCached<T>(key: string): T | undefined {
  const e = store.get(key) as Entry<T> | undefined;
  return e?.data;
}

export function setCached<T>(key: string, data: T): void {
  const prev = store.get(key) as Entry<T> | undefined;
  store.set(key, {
    data,
    fetchedAt: Date.now(),
    inFlight: prev?.inFlight,
  });
  notifyKey(key);
}

/**
 * Remove cached entries: exact `match` or any key starting with `match:`.
 */
export function invalidate(match: string): void {
  for (const k of [...store.keys()]) {
    if (k === match || k.startsWith(`${match}:`)) {
      store.delete(k);
      notifyKey(k);
    }
  }
}

export async function fetchWithCache<T>(
  key: string,
  loader: () => Promise<T>,
  opts?: { ttlMs?: number; force?: boolean }
): Promise<T> {
  const ttlMs = opts?.ttlMs ?? DEFAULT_TTL_MS;
  const force = opts?.force ?? false;

  const entry = store.get(key) as Entry<T> | undefined;

  if (!force && entry?.data !== undefined && Date.now() - entry.fetchedAt < ttlMs) {
    return entry.data;
  }

  if (entry?.inFlight) {
    return entry.inFlight;
  }

  const promise = loader()
    .then((data) => {
      store.set(key, { data, fetchedAt: Date.now() });
      notifyKey(key);
      return data;
    })
    .catch((err) => {
      const cur = store.get(key) as Entry<T> | undefined;
      store.set(key, {
        data: cur?.data as T,
        fetchedAt: cur?.fetchedAt ?? 0,
      });
      throw err;
    })
    .finally(() => {
      const cur = store.get(key) as Entry<T> | undefined;
      if (cur?.inFlight === promise) {
        store.set(key, { data: cur.data, fetchedAt: cur.fetchedAt });
      }
    });

  store.set(key, {
    data: entry?.data as T,
    fetchedAt: entry?.fetchedAt ?? 0,
    inFlight: promise,
  } as Entry<T>);

  return promise;
}

export function subscribe(key: string, cb: () => void): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(cb);
  return () => {
    listeners.get(key)?.delete(cb);
  };
}

export interface UseCachedQueryResult<T> {
  data: T | undefined;
  error: Error | null;
  loading: boolean;
  refresh: (force?: boolean) => Promise<void>;
}

export function useCachedQuery<T>(
  key: string,
  loader: () => Promise<T>,
  options?: { ttlMs?: number; enabled?: boolean }
): UseCachedQueryResult<T> {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const enabled = options?.enabled !== false;
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    if (!enabled) {
      setData(undefined);
      setError(null);
      setLoading(false);
      return;
    }
    const cached = getCached<T>(key);
    setData(cached);
    setError(null);
    setLoading(cached === undefined);
  }, [key, enabled]);

  const refresh = useCallback(
    async (force = true) => {
      if (!enabled) return;
      setLoading(true);
      try {
        const result = await fetchWithCache(key, () => loaderRef.current(), { ttlMs, force });
        setData(result);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setLoading(false);
      }
    },
    [key, ttlMs, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    const hadData = getCached<T>(key) !== undefined;
    if (!hadData) setLoading(true);

    let cancelled = false;

    void fetchWithCache(key, () => loaderRef.current(), { ttlMs, force: false })
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const unsub = subscribe(key, () => {
      const next = getCached<T>(key);
      if (next === undefined) {
        setLoading(true);
        void fetchWithCache(key, () => loaderRef.current(), { ttlMs, force: true })
          .then((result) => {
            setData(result);
            setError(null);
          })
          .catch((e) => {
            setError(e instanceof Error ? e : new Error(String(e)));
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setData(next);
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [key, ttlMs, enabled]);

  return useMemo(
    () => ({ data, error, loading, refresh }),
    [data, error, loading, refresh]
  );
}
