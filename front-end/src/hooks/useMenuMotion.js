import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Keep choreography separate from hover transforms. Each new run samples the
// current pose before cancelling, so reversing halfway through cannot jump.
export function useMenuMotion(sceneRef, buttonRef, setActiveItem) {
  const [state, setState] = useState("closed");
  const phase = useRef("closed");
  const animations = useRef([]);
  const generation = useRef(0);
  const destination = useRef(null);
  const unlock = useRef(() => {});
  const lock = useRef(() => {});
  const visible = state !== "closed";

  const change = useCallback((next) => { phase.current = next; setState(next); }, []);
  const toggle = useCallback(() => {
    destination.current = null;
    setActiveItem(null);
    change(phase.current === "closed" || phase.current === "closing" ? "opening" : "closing");
  }, [change, setActiveItem]);
  const close = useCallback((id = null) => {
    if (phase.current === "closed" || phase.current === "closing") return;
    destination.current = id;
    setActiveItem(null);
    change("closing");
  }, [change, setActiveItem]);

  useLayoutEffect(() => {
    if (!visible) return;
    let scrollY = window.scrollY;
    const oldStyle = { position: document.body.style.position, top: document.body.style.top,
      width: document.body.style.width, paddingRight: document.body.style.paddingRight };
    const background = [...document.querySelectorAll("main, footer, .skip-link")];
    const previousInert = background.map(node => node.inert);
    background.forEach(node => { node.inert = true; });
    let locked = false;
    lock.current = () => {
      if (locked) return;
      scrollY = window.scrollY;
      const gap = window.innerWidth - document.documentElement.clientWidth;
      Object.assign(document.body.style, { position: "fixed", top: `-${scrollY}px`, width: "100%", paddingRight: `${gap}px` });
      document.body.classList.add("menu-open");
      locked = true;
    };
    lock.current();
    unlock.current = () => {
      if (!locked) return;
      locked = false;
      Object.assign(document.body.style, oldStyle);
      document.body.classList.remove("menu-open");
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
    buttonRef.current?.focus({ preventScroll: true });
    return () => {
      unlock.current();
      window.dispatchEvent(new CustomEvent('portfolio:navigate', { detail: destination.current }));
      lock.current = () => {};
      background.forEach((node, index) => { node.inert = previousInert[index]; });
    };
  }, [visible, buttonRef]);

  useLayoutEffect(() => {
    if (state !== "opening" && state !== "closing") return;
    if (state === "opening") lock.current();
    const scene = sceneRef.current;
    const run = ++generation.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const panel = scene.querySelector(".record-panel");
    const stage = scene.querySelector(".record-stage");
    const carriage = scene.querySelector(".record-carriage");
    const flights = [...scene.querySelectorAll(".record-flight")];
    const selectedFlight = flights.find(node =>
      node.querySelector("a")?.getAttribute("href") === `#${destination.current}`);
    const boxes = [...scene.querySelectorAll(".record-box")];
    const decorations = [...scene.querySelectorAll(".record-decoration, .record-caption, .record-footer, .record-halo")];
    const nodes = [panel, carriage, ...flights, ...boxes, ...decorations];
    const poses = nodes.map(node => {
      const style = getComputedStyle(node);
      return { transform: style.transform, opacity: style.opacity, clipPath: style.clipPath };
    });
    const interrupted = animations.current.length > 0;
    animations.current.forEach(animation => animation.cancel());
    animations.current = [];
    const pose = node => poses[nodes.indexOf(node)];
    const play = (node, frames, duration, delay = 0, easing = "cubic-bezier(.22,.7,.23,1)") => {
      const animation = node.animate(frames, { duration: reduced ? 1 : duration,
        delay: reduced ? 0 : delay, fill: "both", easing });
      animations.current.push(animation);
      return animation.finished.catch(() => {});
    };
    const covered = "polygon(0 0,100% 0,100% 100%,80% 100%,80% 100%,60% 100%,60% 100%,40% 100%,40% 100%,20% 100%,20% 100%,0 100%)";
    const uncovered = "polygon(0 0,100% 0,100% -24%,80% -24%,80% -12%,60% -12%,60% 0%,40% 0%,40% -16%,20% -16%,20% -8%,0 -8%)";
    const bounds = stage.getBoundingClientRect();
    const box = boxes[0];
    // offset coordinates are unaffected by in-flight animation transforms.
    const boxX = box.offsetLeft + box.offsetWidth / 2;
    const mouthY = box.offsetTop + box.offsetHeight * .35;
    carriage.style.transformOrigin = `${boxX}px ${box.offsetTop + box.offsetHeight * .5}px`;
    const transforms = flights.map((node, index) => {
      const cx = node.offsetLeft + node.offsetWidth / 2;
      const cy = node.offsetTop + node.offsetHeight / 2;
      const scale = Math.min(.65, box.offsetWidth * .72 / node.offsetWidth);
      const spread = selectedFlight === node ? 0 : index - 1.5;
      const x = boxX - cx + spread * 8;
      const stackedY = mouthY - node.offsetHeight * scale * .64 - cy;
      const buriedY = mouthY + box.offsetHeight * .28 - cy;
      return {
        stack: `translate(${x}px,${stackedY}px) scale(${scale}) rotate(${spread * 5}deg)`,
        inside: `translate(${x}px,${buriedY}px) scale(${scale * .78}) rotate(0deg)`,
      };
    });
    const route = () => {
      if (!destination.current) return;
      unlock.current();
      const target = document.getElementById(destination.current);
      history.pushState(null, "", `#${destination.current}`);
      if (target?.dataset.scrollTop) {
        window.scrollTo({ top: Number(target.dataset.scrollTop), behavior: "instant" });
      } else {
        target?.scrollIntoView({ behavior: "instant", block: "start" });
      }
    };
    const finish = () => {
      if (run !== generation.current) return;
      if (state === "opening") change("open");
      else {
        change("closed");
        buttonRef.current?.focus({ preventScroll: true });
      }
      animations.current.forEach(animation => animation.cancel());
      animations.current = [];
    };
    if (state === "opening") {
      const tasks = [play(panel, [{ clipPath: interrupted ? pose(panel).clipPath : uncovered }, { clipPath: covered }], 340)];
      // The reference lifts and tilts the entire box, holds it while ejecting
      // the tapes, then lowers and straightens it. A shared carrier keeps the
      // opening, front mask and emerging tapes aligned throughout that turn.
      const lift = Math.min(190, bounds.height * .25);
      const raised = `translateY(-${lift}px) rotate(-14deg)`;
      tasks.push(play(carriage, [
        interrupted ? { ...pose(carriage), easing: "cubic-bezier(.16,.8,.3,1)" }
          : { transform: "translateY(180px) rotate(-20deg) scale(.94)", opacity: 0, easing: "cubic-bezier(.16,.8,.3,1)" },
        { transform: raised, opacity: 1, offset: .25 },
        { transform: raised, opacity: 1, offset: .56, easing: "cubic-bezier(.4,0,.2,1)" },
        { transform: "translateY(7px) rotate(2deg)", opacity: 1, offset: .92 },
        { transform: "none", opacity: 1 },
      ], 1180, interrupted ? 0 : 340, "linear"));
      boxes.forEach(node => tasks.push(play(node, [interrupted ? pose(node) : { transform: "none", opacity: 1 },
        { transform: "none", opacity: 1 }], interrupted ? 300 : 1)));
      flights.forEach((node, index) => tasks.push(play(node, [
        interrupted ? pose(node) : { transform: transforms[index].inside, opacity: 0 },
        ...(!interrupted ? [{ transform: transforms[index].inside, opacity: 1, offset: .001 }] : []),
        { transform: transforms[index].stack, opacity: 1, offset: .38 },
        { transform: "translateY(-10px) scale(1.025)", opacity: 1, offset: .85 }, { transform: "none", opacity: 1 },
      ], 850, 780 + index * 65)));
      decorations.forEach((node, index) => tasks.push(play(node, [interrupted ? pose(node) : { opacity: 0, transform: "translateY(36px) scale(.85)" },
        { opacity: 1, transform: "none" }], 500, 1080 + index * 22)));
      Promise.all(tasks).then(finish);
    } else {
      const tasks = [play(carriage, [pose(carriage), { transform: "none", opacity: 1 }], 450)];
      flights.forEach((node, index) => {
        // On selection, the other tapes fade in place; only the chosen tape
        // travels into the box. Menu/Escape closing still collects all four.
        if (selectedFlight && node !== selectedFlight) {
          tasks.push(play(node, [pose(node), { transform: pose(node).transform, opacity: 0 }], 300, 160));
          return;
        }
        tasks.push(play(node, [{ ...pose(node), easing: "cubic-bezier(.22,.7,.23,1)" },
        { transform: transforms[index].stack, offset: .52 },
        { transform: transforms[index].stack, offset: .62, easing: "cubic-bezier(.55,0,.8,.5)" },
        { transform: transforms[index].inside, opacity: 1, offset: .999 },
        { transform: transforms[index].inside, opacity: 0 },
      ], 820, selectedFlight ? 0 : index * 35, "linear"));
      });
      decorations.forEach((node, index) => tasks.push(play(node, [pose(node), { opacity: 0, transform: "translateY(35px) scale(.85)" }],
        node.classList.contains("record-halo") ? 350 : 400,
        node.classList.contains("record-halo") ? 960 : 180 + index * 15)));
      boxes.forEach(node => tasks.push(play(node, [pose(node), { transform: `translateY(${Math.min(bounds.height, 300)}px) rotate(7deg)`, opacity: 0 }], 350, 960)));
      // The destination is placed under the still-opaque panel before revealing.
      Promise.all(tasks).then(() => {
        if (run !== generation.current) return;
        route();
        return play(panel, [{ clipPath: covered }, { clipPath: uncovered }], 340).then(finish);
      });
    }
  }, [state, sceneRef, buttonRef, change]);

  useEffect(() => () => {
    generation.current++;
    animations.current.forEach(animation => animation.cancel());
  }, []);
  return { state, visible, toggle, close };
}
