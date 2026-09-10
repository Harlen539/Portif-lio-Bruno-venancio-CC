import { useEffect, useId, useRef } from "react";
import "./pixel-swap.css";

const clamp = (value) => Math.max(0, Math.min(1, value));
const smooth = (value) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const random = (index) => {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

// Replace the outgoing content cell by cell. Scrolling only triggers the
// timed dissolve; it does not determine the animation's progress.
export default function PixelSwap({ pixelSize = 112, duration = 1500 }) {
  const id = `pixel-swap-${useId().replace(/:/g, '')}`;
  const svgRef = useRef(null);
  const clipRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    const section = svg.parentElement;
    const stage = section.parentElement;
    const hero = stage.querySelector('.hero');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ns = 'http://www.w3.org/2000/svg';
    let cells = [];
    let frame = 0;
    let end = 0;
    let trigger = 24;
    let progress = 0;
    let last = -1;
    let animation = null;
    let previousScroll = window.scrollY;
    let pausedAt = null;
    let dimensions = '';
    const menuOpen = () => document.body.classList.contains('menu-open');
    const originalHeroInert = hero.inert;
    const originalSectionInert = section.inert;

    const reset = () => {
      animation = null;
      last = -1;
      pausedAt = null;
      section.style.removeProperty('clip-path');
      section.style.removeProperty('translate');
      section.style.removeProperty('pointer-events');
      delete section.dataset.scrollTop;
      delete section.dataset.swapProgress;
      delete section.dataset.swapState;
      delete hero.dataset.scrollTop;
      hero.inert = originalHeroInert;
      section.inert = originalSectionInert;
      stage.classList.remove('pixel-transition-enabled');
    };
    const paint = (now) => {
      frame = 0;
      if (preference.matches) { reset(); return; }
      if (menuOpen()) {
        if (pausedAt === null) pausedAt = now;
        return;
      }
      if (pausedAt !== null) {
        if (animation) animation.start += now - pausedAt;
        pausedAt = null;
      }
      const stageTop = stage.getBoundingClientRect().top + scrollY;
      let traveled = scrollY - stageTop;
      if (animation) {
        const elapsed = clamp((now - animation.start) / duration);
        progress = animation.from + (animation.to - animation.from) * elapsed;
        if (elapsed === 1) {
          const destination = animation.to;
          animation = null;
          // Commit to the normal document position without a visible jump:
          // the incoming section has occupied this same viewport throughout.
          if (traveled > 0 && traveled < end) {
            const landing = destination === 1 ? end : 0;
            scrollTo({ top: stageTop + landing, behavior: 'instant' });
            previousScroll = stageTop + landing;
            traveled = landing;
          }
        }
      }
      section.dataset.scrollTop = String(stageTop + end);
      hero.dataset.scrollTop = String(stageTop);
      section.dataset.swapProgress = progress.toFixed(4);
      section.dataset.swapState = animation ? 'animating' : progress === 1 ? 'ready' : 'idle';
      section.style.translate = `0 ${-Math.max(0, end - Math.max(0, traveled))}px`;
      section.style.pointerEvents = progress < 1 ? 'none' : '';
      hero.inert = progress === 1 || animation !== null;
      section.inert = progress < 1;
      if (progress !== last) {
        last = progress;
        section.style.clipPath = progress === 1 ? 'none' : `url(#${id})`;
        for (const cell of cells) {
          const amount = smooth((progress - cell.delay * 0.62) / 0.38);
          const size = Math.round(amount * cell.size / 2) * 2;
          const inset = (cell.size - size) / 2;
          cell.clip.setAttribute('x', cell.x + inset);
          cell.clip.setAttribute('y', cell.y + inset);
          cell.clip.setAttribute('width', size);
          cell.clip.setAttribute('height', size);
        }
      }
      if (animation) frame = requestAnimationFrame(paint);
    };
    const requestPaint = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onScroll = () => {
      if (preference.matches || menuOpen()) return;
      const traveled = -stage.getBoundingClientRect().top;
      const direction = scrollY - previousScroll;
      previousScroll = scrollY;
      if (traveled <= 1) {
        progress = 0;
        animation = null;
      } else if (traveled >= end - 1) {
        progress = 1;
        animation = null;
      } else if (!animation && progress === 0 && direction > 0 && traveled >= trigger) {
        animation = { start: performance.now(), from: 0, to: 1 };
      } else if (!animation && progress === 1 && direction < 0 && traveled < end - 24) {
        animation = { start: performance.now(), from: 1, to: 0 };
      }
      requestPaint();
    };
    // Keep wheel/trackpad momentum from skipping the timed swap. This only
    // holds the viewport while it is playing; normal scrolling resumes as
    // soon as the animation lands on the next section.
    const onWheel = (event) => {
      if (preference.matches || menuOpen() || event.ctrlKey || event.target.closest('.navigation-shell, dialog')) return;
      if (animation) {
        event.preventDefault();
        return;
      }
      const traveled = -stage.getBoundingClientRect().top;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (progress === 0 && delta > 0 && traveled >= 0 && traveled < end && traveled + delta >= trigger) {
        event.preventDefault();
        const stageTop = stage.getBoundingClientRect().top + scrollY;
        animation = { start: performance.now(), from: 0, to: 1 };
        scrollTo({ top: stageTop + trigger, behavior: 'instant' });
        requestPaint();
      } else if (progress === 1 && delta < 0 && traveled > 0 && traveled <= end + 1) {
        event.preventDefault();
        const stageTop = stage.getBoundingClientRect().top + scrollY;
        animation = { start: performance.now(), from: 1, to: 0 };
        scrollTo({ top: stageTop + end - 24, behavior: 'instant' });
        requestPaint();
      }
    };
    const holdTouch = (event) => {
      if (animation && !preference.matches && !event.target.closest('.navigation-shell') && event.touches.length === 1) {
        event.preventDefault();
      }
    };
    const resize = () => {
      if (preference.matches) { reset(); return; }
      if (menuOpen()) return;
      stage.classList.add('pixel-transition-enabled');
      const width = section.clientWidth;
      const height = section.clientHeight;
      end = hero.offsetHeight;
      trigger = Math.max(0, end - innerHeight) + 24;
      stage.style.setProperty('--hero-height', `${end}px`);
      if (!animation) {
        const traveled = -stage.getBoundingClientRect().top;
        progress = traveled >= end - 1 ? 1 : traveled <= 1 ? 0 : progress;
      }
      const nextDimensions = `${width}:${height}:${end}`;
      if (nextDimensions === dimensions) { requestPaint(); return; }
      dimensions = nextDimensions;
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      clipRef.current.replaceChildren();
      const size = width <= 640 ? 72 : pixelSize;
      const columns = Math.ceil(width / size);
      const rows = Math.ceil(height / size);
      cells = Array.from({ length: columns * rows }, (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const clip = document.createElementNS(ns, 'rect');
        clipRef.current.append(clip);
        return {
          x: column * size, y: row * size, clip, size,
          delay: 0.2 * column / columns + 0.15 * row / rows + 0.65 * random(index),
        };
      });
      last = -1;
      requestPaint();
    };
    const showAbout = () => {
      animation = null;
      progress = 1;
      scrollTo({ top: stage.getBoundingClientRect().top + scrollY + end, behavior: 'instant' });
      requestPaint();
    };
    const navigate = () => {
      if (location.hash === '#sobre' && !preference.matches) showAbout();
      else if (location.hash === '#inicio' && !preference.matches) {
        animation = null;
        progress = 0;
        scrollTo({ top: stage.getBoundingClientRect().top + scrollY, behavior: 'instant' });
        requestPaint();
      }
    };
    const routed = (event) => {
      animation = null;
      pausedAt = null;
      progress = event.detail === 'inicio' ? 0 : 1;
      requestPaint();
    };
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href^="#"]');
      if (!link || preference.matches) return;
      const destination = link.getAttribute('href').slice(1);
      if (!document.getElementById(destination)?.matches('section')) return;
      animation = null;
      progress = destination === 'inicio' ? 0 : 1;
      if (destination === 'sobre' || destination === 'inicio') {
        event.preventDefault();
        history.pushState(null, '', `#${destination}`);
        navigate();
      }
      requestPaint();
    };
    const onFocus = () => {
      if (section.contains(document.activeElement) && !preference.matches) showAbout();
    };
    const observer = new ResizeObserver(resize);
    const menuObserver = new MutationObserver(() => {
      if (menuOpen()) {
        if (pausedAt === null) pausedAt = performance.now();
      } else {
        resize();
      }
    });
    menuObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(section);
    observer.observe(hero);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchmove', holdTouch, { passive: false });
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('hashchange', navigate);
    window.addEventListener('portfolio:navigate', routed);
    document.addEventListener('click', onClick);
    document.addEventListener('focusin', onFocus);
    preference.addEventListener('change', resize);
    resize();
    navigate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      menuObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', holdTouch);
      window.removeEventListener('resize', resize);
      window.removeEventListener('hashchange', navigate);
      window.removeEventListener('portfolio:navigate', routed);
      document.removeEventListener('click', onClick);
      document.removeEventListener('focusin', onFocus);
      preference.removeEventListener('change', resize);
      reset();
      stage.style.removeProperty('--hero-height');
    };
  }, [id, pixelSize, duration]);

  return (
    <svg ref={svgRef} className="incoming-pixel-swap" aria-hidden="true" preserveAspectRatio="none">
      <defs><clipPath id={id} clipPathUnits="userSpaceOnUse" ref={clipRef} /></defs>
    </svg>
  );
}
