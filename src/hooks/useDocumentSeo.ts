import { useEffect } from "react";

interface SeoMeta {
  name?: string;
  property?: string;
  content: string;
}

interface SeoConfig {
  title: string;
  description: string;
  canonical: string;
  meta?: SeoMeta[];
  jsonLd?: object[];
}

function upsertMeta({ name, property, content }: SeoMeta) {
  const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  const isNew = !el;
  if (!el) {
    el = document.createElement("meta");
    if (name) el.setAttribute("name", name);
    if (property) el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return { el, isNew };
}

/** Lightweight per-page SEO: title, meta tags, canonical link and JSON-LD, without pulling in a head-management library. */
export function useDocumentSeo({ title, description, canonical, meta = [], jsonLd = [] }: SeoConfig) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const createdMetaEls: HTMLMetaElement[] = [];
    const allMeta: SeoMeta[] = [
      { name: "description", content: description },
      ...meta,
    ];
    allMeta.forEach((m) => {
      const { el, isNew } = upsertMeta(m);
      if (isNew) createdMetaEls.push(el);
    });

    let canonicalEl = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const canonicalWasCreated = !canonicalEl;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", canonical);

    const jsonLdScripts = jsonLd.map((data, i) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", `article-${i}`);
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
      return script;
    });

    return () => {
      document.title = previousTitle;
      createdMetaEls.forEach((el) => el.remove());
      if (canonicalWasCreated) canonicalEl?.remove();
      jsonLdScripts.forEach((el) => el.remove());
    };
  }, [title, description, canonical, meta, jsonLd]);
}
