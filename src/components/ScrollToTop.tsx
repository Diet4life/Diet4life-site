import { useEffect } from "react";
import { useLocation } from "wouter";
import { useLenis } from "./SmoothScroll";

export function ScrollToTop() {
  const [location] = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location, lenis]);

  return null;
}
