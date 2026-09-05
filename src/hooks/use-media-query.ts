import { useEffect, useState } from "react";

// No SSR in this app (pure client SPA) -- the `false` initial value just
// means the very first render assumes mobile until the effect below runs,
// which is imperceptible (one microtask later, before paint in practice).
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
