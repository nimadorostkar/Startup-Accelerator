"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* Deep links like /dashboard/startup#field-problem should land the founder
   *in* the question: centred, focused and briefly highlighted. The browser's
   own fragment handling can't do this reliably here — `:target` doesn't
   update on client-side navigation, and on a full load the field may stream
   in after the browser has already tried to scroll. */
export default function FocusFromHash() {
  const pathname = usePathname();

  useEffect(() => {
    let observer: MutationObserver | undefined;
    let giveUp: number | undefined;

    function land() {
      observer?.disconnect();
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id.startsWith("field-")) return;
      const el = rendered(id);
      if (el) return flash(el);

      // The page may still be streaming in behind the loading skeleton.
      observer = new MutationObserver(() => {
        const found = rendered(id);
        if (found) {
          observer?.disconnect();
          flash(found);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      giveUp = window.setTimeout(() => observer?.disconnect(), 5000);
    }

    /* Streamed content first arrives in a hidden holding node — only count
       the field once it's actually on screen. */
    function rendered(id: string) {
      const el = document.getElementById(id);
      return el && el.getClientRects().length > 0 ? el : null;
    }

    function flash(el: HTMLElement) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      // A radio group is a <fieldset>; focus its first option instead.
      const focusable = el.matches("input, textarea, select") ? el : el.querySelector<HTMLElement>("input, textarea, select");
      focusable?.focus({ preventScroll: true });

      el.removeAttribute("data-flash");
      void el.offsetWidth; // restart the animation if it's already running
      el.setAttribute("data-flash", "");
    }

    land();
    window.addEventListener("hashchange", land);
    return () => {
      window.removeEventListener("hashchange", land);
      observer?.disconnect();
      window.clearTimeout(giveUp);
    };
  }, [pathname]);

  return null;
}
