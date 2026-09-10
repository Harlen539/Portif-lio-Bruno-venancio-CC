import { useEffect } from "react";

const clamp = (value) => Math.max(0, Math.min(1, value));
const easeOut = (value) => 1 - Math.pow(1 - clamp(value), 3);

export function useScrollMotion() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = [
      ...document.querySelectorAll("main section.motion-section"),
    ];
    // The intro has its own pinned transition; lifting its content causes a jump.
    const panels = sections.filter((section) => !section.closest(".intro-transition")).map((section) => ({
      section,
      surface: section.querySelector(":scope > .section-surface"),
      top: 0,
      last: "",
    }));
    const layerSpecs = [
      [".hero-grid", 0.08, 40],
      [".hero-logo", 0.1, 45],
      [".study-window", -0.06, 28],
      [".status-window", 0.06, 28],
      [".star-one", 0.1, 25],
      [".star-two", -0.07, 25],
      [".workstation", 0.055, 25],
      [".project-image img", 0.035, 14],
      [".contact-frames", -0.05, 24],
      [".contact-star", 0.09, 28],
    ];
    const layers = layerSpecs.flatMap(([selector, speed, limit]) =>
      [...document.querySelectorAll(selector)].map((element) => ({
        element,
        speed,
        limit,
        top: 0,
        pinnedSection: element.closest('.intro-transition') ? element.closest('section') : null,
        localTop: 0,
        height: 0,
        last: "",
      })),
    );
    let frame = 0;
    let viewport = window.innerHeight;
    let mobile = window.innerWidth <= 640;
    let needsMeasure = true;
    let resizeObserver;
    let active = true;
    const pendingImages = [...document.querySelectorAll("img")].filter(
      (image) => !image.complete,
    );

    const measure = () => {
      viewport = window.innerHeight;
      mobile = window.innerWidth <= 640;
      panels.forEach((panel) =>
        panel.surface?.style.removeProperty("--panel-lift"),
      );
      layers.forEach((layer) =>
        layer.element.style.removeProperty("--depth-y"),
      );
      const scrollY = window.scrollY;
      panels.forEach((panel) => {
        const rect = panel.section.getBoundingClientRect();
        panel.top = rect.top + scrollY;
        panel.last = "";
      });
      layers.forEach((layer) => {
        const rect = layer.element.getBoundingClientRect();
        layer.top = rect.top + scrollY;
        if (layer.pinnedSection) {
          layer.localTop = rect.top - layer.pinnedSection.getBoundingClientRect().top;
        }
        layer.height = rect.height;
        layer.last = "";
      });
      needsMeasure = false;
    };
    const reset = () => {
      document.documentElement.classList.remove("scroll-motion");
      panels.forEach((panel) => {
        panel.surface?.style.removeProperty("--panel-lift");
        panel.last = "";
      });
      layers.forEach((layer) => {
        layer.element.style.removeProperty("--depth-y");
        layer.last = "";
      });
    };
    const paint = () => {
      frame = 0;
      if (document.body.classList.contains('menu-open')) return;
      if (preference.matches) {
        reset();
        return;
      }
      if (needsMeasure) measure();
      const scrollY = window.scrollY;
      const focus = document.activeElement;
      panels.forEach((panel) => {
        if (!panel.surface) return;
        const top = panel.top - scrollY;
        const raw = clamp((viewport * 0.98 - top) / (viewport * 0.58));
        const progress = panel.surface.contains(focus) ? 1 : easeOut(raw);
        const key = progress.toFixed(4);
        if (key === panel.last) return;
        panel.last = key;
        panel.surface.style.setProperty(
          "--panel-lift",
          `${((1 - progress) * (mobile ? 32 : 64)).toFixed(2)}px`,
        );
      });
      layers.forEach((layer) => {
        // Sticky sections do not move with document scroll. Use their local
        // coordinates so committing the pixel swap cannot jerk the artwork.
        const sectionTop = layer.pinnedSection?.dataset.scrollTop;
        const top = layer.pinnedSection
          ? layer.localTop + (sectionTop !== undefined && layer.pinnedSection.id !== 'inicio'
            ? Math.min(0, Number(sectionTop) - scrollY)
            : layer.pinnedSection.getBoundingClientRect().top)
          : layer.top - scrollY;
        if (top > viewport + 100 || top + layer.height < -100) return;
        const limit = mobile ? layer.limit * 0.42 : layer.limit;
        const offset = Math.max(
          -limit,
          Math.min(
            limit,
            (viewport * 0.5 - top - layer.height * 0.5) *
              layer.speed *
              (mobile ? 0.45 : 1),
          ),
        );
        const value = `${offset.toFixed(2)}px`;
        if (value === layer.last) return;
        layer.last = value;
        layer.element.style.setProperty("--depth-y", value);
      });
      document.documentElement.classList.add("scroll-motion");
    };
    const requestPaint = () => {
      if (active && !frame) frame = requestAnimationFrame(paint);
    };
    const refresh = () => {
      needsMeasure = true;
      requestPaint();
    };
    const preferenceChanged = () => {
      reset();
      refresh();
    };

    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", refresh, { passive: true });
    window.addEventListener("pageshow", refresh);
    window.addEventListener("hashchange", requestPaint);
    document.addEventListener("focusin", requestPaint);
    document.addEventListener("focusout", requestPaint);
    preference.addEventListener("change", preferenceChanged);
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(refresh);
      sections.forEach((section) => resizeObserver.observe(section));
    }
    document.fonts?.ready.then(() => {
      if (active) refresh();
    });
    pendingImages.forEach((image) =>
      image.addEventListener("load", refresh, { once: true }),
    );
    refresh();
    return () => {
      active = false;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("hashchange", requestPaint);
      document.removeEventListener("focusin", requestPaint);
      document.removeEventListener("focusout", requestPaint);
      preference.removeEventListener("change", preferenceChanged);
      pendingImages.forEach((image) =>
        image.removeEventListener("load", refresh),
      );
      resizeObserver?.disconnect();
      reset();
    };
  }, []);
}
