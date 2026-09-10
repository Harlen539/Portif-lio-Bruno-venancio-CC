import { useEffect, useRef } from "react";
import "./logo-loop.css";

export default function LogoLoop({ children, speed = 100, ariaLabel = "Carrossel" }) {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const measure = () => {
      track.style.setProperty("--loop-duration", `${track.scrollWidth / 2 / speed}s`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    measure();
    return () => observer.disconnect();
  }, [speed]);

  return (
    <div className="logo-loop" role="region" aria-label={ariaLabel} tabIndex={0}>
      <div className="logo-loop-track" ref={trackRef}>
        <div className="logo-loop-group">{children}</div>
        <div className="logo-loop-group" data-loop-copy="true">{children}</div>
      </div>
    </div>
  );
}
