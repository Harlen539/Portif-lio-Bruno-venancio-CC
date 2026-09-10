import { useEffect, useRef, useState } from "react";
import MenuScene from "./MenuScene.jsx";
import { useMenuMotion } from "../hooks/useMenuMotion.js";

export default function Header({ language, setLanguage, t, activeSection }) {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const menuButtonRef = useRef(null);
  const sceneRef = useRef(null);
  const languageRef = useRef(null);
  const { state, visible, toggle, close } = useMenuMotion(sceneRef, menuButtonRef, setActiveItem);
  useEffect(() => {
    const outside = event => { if (!languageRef.current?.contains(event.target)) setLanguageOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  const navigate = (event, id) => {
    if (!visible || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); setLanguageOpen(false); close(id);
  };
  const handleKeyDown = event => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (languageOpen) { setLanguageOpen(false); languageRef.current?.querySelector("button")?.focus(); }
      else close();
      return;
    }
    if (!visible || event.key !== "Tab") return;
    const focusable = [...event.currentTarget.querySelectorAll("a[href], button:not(:disabled)")]
      .filter(element => element.getClientRects().length && !element.closest("[hidden]"));
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  return (
    <div className="navigation-shell" role={visible ? "dialog" : undefined} aria-modal={visible ? "true" : undefined}
      aria-label={visible ? t.menu : undefined} data-menu-state={state} onKeyDown={handleKeyDown}>
      <header className="site-header">
        <div className="header-start">
          <button ref={menuButtonRef} className="pixel-control menu-toggle" type="button" aria-expanded={visible}
            aria-controls="navigation" aria-label={visible ? t.closeMenu : t.openMenu}
            onClick={() => { setLanguageOpen(false); toggle(); }}>
            <svg className="menu-pixel-icon" viewBox="0 0 20 20" shapeRendering="crispEdges" aria-hidden="true">
              <path fill="currentColor" d={visible
                ? "M2 2H6V6H10V10H14V14H18V18H14V14H10V10H6V6H2ZM14 2H18V6H14V10H10V14H6V18H2V14H6V10H10V6H14Z"
                : "M0 2H20V6H0ZM0 8H20V12H0ZM0 14H20V18H0Z"} />
            </svg>
            <span>{visible ? t.close : t.menu}</span>
          </button>
        </div>
        <a className="header-brand" href="#inicio" aria-label="Bruno Venâncio" onClick={event => navigate(event, "inicio")}>
          <img src="/assets/bruno-logo-transparent.png" alt="Bruno Venâncio" width="1774" height="887" />
        </a>
        <div className="header-actions">
          <div className="language-picker" ref={languageRef}>
            <button className="pixel-control language-toggle" type="button" aria-expanded={languageOpen}
              aria-controls="language-options" aria-haspopup="true" aria-label={t.selectLanguage}
              onClick={() => setLanguageOpen(open => !open)}>
              <span className="current-language">{language.toUpperCase()}</span><span className="pixel-chevron" aria-hidden="true" />
            </button>
            <div className="language-options" id="language-options" hidden={!languageOpen}>
              {["pt", "en"].map(option => (
                <button key={option} type="button" aria-current={language === option ? "true" : undefined}
                  onClick={() => { setLanguage(option); setLanguageOpen(false); languageRef.current?.querySelector("button")?.focus(); }}>
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <a className="pixel-control header-contact" href="#contato" onClick={event => navigate(event, "contato")}>{t.contactButton}</a>
        </div>
      </header>
      <MenuScene sceneRef={sceneRef} state={state} t={t} activeSection={activeSection}
        activeItem={activeItem} setActiveItem={setActiveItem} navigate={navigate} />
    </div>
  );
}
