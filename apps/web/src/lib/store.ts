import { useCallback, useEffect, useMemo, useState } from 'react';

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
function safeWrite(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 忽略配额/隐私模式错误 */
  }
}

export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => safeRead(key, initial));
  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
        safeWrite(key, next);
        return next;
      });
    },
    [key],
  );
  return [value, set] as const;
}

export type ThemePref = 'system' | 'light' | 'dark';

const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

export function useTheme() {
  const [pref, setPref] = usePersistentState<ThemePref>('of:theme', 'system');
  const [sysDark, setSysDark] = useState(() => media?.matches ?? false);

  useEffect(() => {
    if (!media) return;
    const fn = () => setSysDark(media.matches);
    media.addEventListener('change', fn);
    return () => media.removeEventListener('change', fn);
  }, []);

  useEffect(() => {
    const dark = pref === 'dark' || (pref === 'system' && sysDark);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }, [pref, sysDark]);

  const cycle = useCallback(() => setPref((p) => (p === 'system' ? 'light' : p === 'light' ? 'dark' : 'system')), [setPref]);
  const effective: 'light' | 'dark' = pref === 'system' ? (sysDark ? 'dark' : 'light') : pref;
  return { pref, effective, cycle, setPref };
}

const LS_FAV = 'of:favs';
const LS_RECENT = 'of:recent';

export function useFavorites() {
  const [favs, setFavs] = usePersistentState<string[]>(LS_FAV, []);
  const has = useCallback((k: string) => favs.includes(k), [favs]);
  const toggle = useCallback(
    (k: string) =>
      setFavs((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k])),
    [setFavs],
  );
  return { favs, has, toggle };
}

export function useRecents() {
  const [recents, setRecents] = usePersistentState<string[]>(LS_RECENT, []);
  const push = useCallback(
    (k: string) =>
      setRecents((prev) => [k, ...prev.filter((x) => x !== k)].slice(0, 24)),
    [setRecents],
  );
  const remove = useCallback(
    (k: string) => setRecents((prev) => prev.filter((x) => x !== k)),
    [setRecents],
  );
  const clear = useCallback(() => setRecents([]), [setRecents]);
  return { recents, push, remove, clear };
}

export function useMemoFlatten<T>(fn: () => T, deps: unknown[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(fn, deps);
}
