import { useEffect } from "react";

/**
 * Sets document.title and the <meta name="description"> tag while a page is
 * mounted, restoring the previous values on unmount. The site has no
 * server-side rendering, so this only affects the browser tab / client-side
 * navigation — it doesn't replace index.html's static tags for crawlers that
 * don't execute JS, but it's the site's first per-page head override.
 */
export function useDocumentHead(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute("content") ?? null;

    document.title = title;
    metaDescription?.setAttribute("content", description);

    return () => {
      document.title = previousTitle;
      if (previousDescription !== null) {
        metaDescription?.setAttribute("content", previousDescription);
      }
    };
  }, [title, description]);
}
