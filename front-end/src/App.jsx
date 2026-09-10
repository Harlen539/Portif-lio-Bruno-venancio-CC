import { useCallback, useEffect, useState } from "react";
import Preloader from "./components/Preloader.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import SpriteDefinitions from "./components/SpriteDefinitions.jsx";
import Hero from "./sections/Hero.jsx";
import About from "./sections/About.jsx";
import Projects from "./sections/Projects.jsx";
import Knowledge from "./sections/Knowledge.jsx";
import Contact from "./sections/Contact.jsx";
import { portfolio } from "./data/portfolio.js";
import { translations } from "./data/translations.js";
import { useActiveSection } from "./hooks/useActiveSection.js";
import { useReveal } from "./hooks/useReveal.js";
import { useScrollMotion } from "./hooks/useScrollMotion.js";

const getInitialLanguage = () => {
  try {
    const saved = localStorage.getItem("portfolio-language");
    return translations[saved] ? saved : "pt";
  } catch {
    return "pt";
  }
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const finishLoading = useCallback(() => setLoading(false), []);
  const [language, setLanguage] = useState(getInitialLanguage);
  const activeSection = useActiveSection();
  const t = translations[language];
  useReveal();
  useScrollMotion();

  useEffect(() => {
    if (loading || !location.hash) return;
    // Initial anchors can be skipped by the browser while the page is inert.
    const target = document.getElementById(location.hash.slice(1));
    target?.scrollIntoView({ behavior: "instant", block: "start" });
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, [loading]);

  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
    try {
      localStorage.setItem("portfolio-language", language);
    } catch {
      /* Storage may be disabled. */
    }
  }, [language]);

  return (
    <>
      {loading && <Preloader onComplete={finishLoading} language={language} />}
      <div className="portfolio-page" inert={loading}>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header
        language={language}
        setLanguage={setLanguage}
        t={t}
        activeSection={activeSection}
      />
      <main id="conteudo">
        <div className="intro-transition">
          <Hero t={t} />
          <About />
        </div>
        <Projects projects={portfolio.projects} />
        <Knowledge />
        <Contact contact={portfolio.contact} />
      </main>
      <Footer />
      <SpriteDefinitions />
      </div>
    </>
  );
}
