import { useEffect } from "react";

interface DocumentHeadOptions {
  /** Absolute, self-referential canonical URL for this route. */
  canonical?: string;
  /** When true, overrides the sitewide default robots meta to noindex,follow. */
  noindex?: boolean;
}

/**
 * Sets document.title, the <meta name="description"> tag, the canonical
 * <link>, and (optionally) the <meta name="robots"> tag while a page is
 * mounted, restoring the previous values on unmount. The site has no
 * server-side rendering, so this only affects the browser tab / client-side
 * navigation — it doesn't replace index.html's static tags for crawlers that
 * don't execute JS, but it's the site's per-page head override mechanism.
 */
export function useDocumentHead(title: string, description: string, options: DocumentHeadOptions = {}) {
  const { canonical, noindex } = options;

  useEffect(() => {
    const previousTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute("content") ?? null;
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const previousCanonical = canonicalLink?.getAttribute("href") ?? null;
    const metaRobots = document.querySelector('meta[name="robots"]');
    const previousRobots = metaRobots?.getAttribute("content") ?? null;

    document.title = title;
    metaDescription?.setAttribute("content", description);
    if (canonical) {
      canonicalLink?.setAttribute("href", canonical);
    }
    if (noindex) {
      metaRobots?.setAttribute("content", "noindex, follow");
    }

    return () => {
      document.title = previousTitle;
      if (previousDescription !== null) {
        metaDescription?.setAttribute("content", previousDescription);
      }
      if (canonical && previousCanonical !== null) {
        canonicalLink?.setAttribute("href", previousCanonical);
      }
      if (noindex && previousRobots !== null) {
        metaRobots?.setAttribute("content", previousRobots);
      }
    };
  }, [title, description, canonical, noindex]);
}
