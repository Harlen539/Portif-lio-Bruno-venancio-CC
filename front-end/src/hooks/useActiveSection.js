import { useEffect, useState } from "react";

export function useActiveSection() {
  const [activeSection, setActiveSection] = useState("inicio");
  useEffect(() => {
    const sections = [...document.querySelectorAll("main section[id]")];
    const about = document.getElementById("sobre");
    const stage = document.querySelector(".intro-transition");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (document.body.classList.contains('menu-open')) return;
      const line = innerHeight * 0.32;
      if (stage?.classList.contains('pixel-transition-enabled') &&
          scrollY < Number(about.dataset.scrollTop) && stage.getBoundingClientRect().bottom > line) {
        setActiveSection(Number(about.dataset.swapProgress) < 0.5 ? 'inicio' : 'sobre');
        return;
      }
      const visible = sections.filter(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= line && rect.bottom > line;
      });
      // Later sections are above earlier sticky sections in the visual stack.
      const current = visible.at(-1);
      if (current) setActiveSection(current.id);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const mutation = new MutationObserver(schedule);
    if (about) mutation.observe(about, { attributes: true, attributeFilter: ['data-swap-progress'] });
    mutation.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const resize = new ResizeObserver(schedule);
    sections.forEach(section => resize.observe(section));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('hashchange', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      mutation.disconnect();
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, []);
  return activeSection;
}
