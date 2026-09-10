import { useLayoutEffect, useRef, useState } from "react";
import "./preloader.css";

const logoSource = "/assets/bruno-logo-transparent.png";

export default function Preloader({ onComplete, language }) {
  const [progress, setProgress] = useState(0);
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const detailsRef = useRef(null);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const logo = logoRef.current;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const animations = [];
    let active = true;
    let frame = 0;
    let hold = 0;
    let flying = false;
    let assetsReady = false;
    const started = performance.now();

    document.documentElement.classList.add("is-preloading");
    overlay.focus({ preventScroll: true });
    // Keep the underlying scroll transitions still without changing page geometry.
    const blockScroll = (event) => {
      if (event.ctrlKey || event.touches?.length > 1) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const blockKeys = (event) => {
      if (["Tab", " ", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
      }
    };
    window.addEventListener("wheel", blockScroll, { passive: false, capture: true });
    window.addEventListener("touchmove", blockScroll, { passive: false, capture: true });
    overlay.addEventListener("keydown", blockKeys);

    const image = logo.querySelector(".preloader-logo-fill");
    Promise.allSettled([image.decode(), document.fonts.ready]).then(() => {
      if (active) assetsReady = true;
    });

    const finish = () => {
      if (!active) return;
      onComplete();
    };
    const animate = (node, keyframes, options) => {
      const animation = node.animate(keyframes, { fill: "forwards", ...options });
      animations.push(animation);
      return animation.finished.catch(() => {});
    };
    const flyToHeader = () => {
      if (!active) return;
      const target = document.querySelector(".header-brand");
      if (!target) { finish(); return; }
      flying = true;
      overlay.dataset.phase = "flying";
      const from = logo.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const duration = preference.matches ? 120 : 720;
      const landing = `translate(${to.x - from.x}px, ${to.y - from.y}px) scale(${to.width / from.width})`;
      Promise.all([
        animate(logo, preference.matches
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [{ transform: "none" }, { transform: landing }],
        { duration, easing: "cubic-bezier(.76,0,.24,1)" }),
        animate(overlay.querySelector(".preloader-backdrop"), [{ opacity: 1 }, { opacity: 0 }],
          { duration, easing: "ease-in-out" }),
        animate(detailsRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: preference.matches ? 80 : 180 }),
      ]).then(finish);
    };
    const count = (now) => {
      if (!active) return;
      const elapsed = now - started;
      const duration = preference.matches ? 200 : 1050;
      const complete = elapsed >= duration && (assetsReady || elapsed >= 2500);
      const value = complete ? 100 : Math.min(99, Math.floor(elapsed / duration * 100));
      setProgress(value);
      if (complete) hold = window.setTimeout(flyToHeader, 140);
      else frame = requestAnimationFrame(count);
    };
    frame = requestAnimationFrame(count);
    const resized = () => { if (flying) finish(); };
    window.addEventListener("resize", resized);

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      clearTimeout(hold);
      animations.forEach(animation => animation.cancel());
      document.documentElement.classList.remove("is-preloading");
      window.removeEventListener("wheel", blockScroll, true);
      window.removeEventListener("touchmove", blockScroll, true);
      window.removeEventListener("resize", resized);
      overlay.removeEventListener("keydown", blockKeys);
    };
  }, [onComplete]);

  return (
    <div className="preloader" ref={overlayRef} tabIndex={-1} data-phase="counting"
      aria-label={language === "en" ? "Loading portfolio" : "Carregando portfólio"}>
      <div className="preloader-backdrop" />
      <div className="preloader-center">
        <div className="preloader-logo" ref={logoRef} style={{ "--load": `${progress}%` }} aria-hidden="true">
          <img className="preloader-logo-base" src={logoSource} width="1774" height="887" alt="" />
          <img className="preloader-logo-fill" src={logoSource} width="1774" height="887" alt="" fetchPriority="high" />
        </div>
        <div className="preloader-details" ref={detailsRef}>
          <div className="preloader-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100}
            aria-valuenow={progress} aria-label={language === "en" ? "Loading" : "Carregando"}>
            <span style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
          <span className="preloader-percentage" aria-hidden="true">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
