"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function HorizontalMovieRail({ children, className = "" }) {
  const railRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
    setCanScrollLeft(rail.scrollLeft > 1);
    setCanScrollRight(maxScrollLeft - rail.scrollLeft > 1);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;

    updateScrollButtons();
    rail.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollButtons) : null;
    resizeObserver?.observe(rail);
    Array.from(rail.children).forEach((child: Element) => resizeObserver?.observe(child));
    const mutationObserver = new MutationObserver(updateScrollButtons);
    mutationObserver.observe(rail, { childList: true, subtree: true });

    return () => {
      rail.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
    };
  }, [updateScrollButtons]);

  const scrollByPage = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(rail.clientWidth * 0.7, 220), behavior: "smooth" });
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      scrollByPage(event.key === "ArrowRight" ? 1 : -1);
    }
  };

  return (
    <div className="group/rail relative min-w-0 max-w-full">
      <div
        ref={railRef}
        role="region"
        aria-label="Yatay kaydırılabilir içerik"
        tabIndex={0}
        className={className}
        style={{
          touchAction: "pan-x pan-y",
          overscrollBehaviorX: "contain",
          scrollBehavior: "auto",
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x proximity",
          scrollPadding: "0 1rem",
        }}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Sola kaydır"
          onClick={() => scrollByPage(-1)}
          className="absolute left-1 top-1/2 z-10 hidden min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/95 text-text shadow-lg shadow-bg/30 backdrop-blur-sm transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:flex"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Sağa kaydır"
          onClick={() => scrollByPage(1)}
          className="absolute right-1 top-1/2 z-10 hidden min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/95 text-text shadow-lg shadow-bg/30 backdrop-blur-sm transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:flex"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
