import { PixelEdge } from "../components/PixelDecorations.jsx";

export default function Hero({ t }) {
  return (
    <section id="inicio" className="hero" aria-labelledby="hero-title">
      <div className="hero-grid parallax-layer" aria-hidden="true" />
      <div className="hero-frames" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <span className="pixel-star star-one parallax-layer" aria-hidden="true" />
      <span className="pixel-star star-two parallax-layer" aria-hidden="true" />
      <span className="pixel-star star-three" aria-hidden="true" />
      <div className="floating-window study-window parallax-layer">
        <div className="mini-title">
          <span>PLAYER.INFO</span>
          <span aria-hidden="true">− □ ×</span>
        </div>
        <p>
          CIÊNCIA DA
          <br />
          COMPUTAÇÃO
        </p>
        <strong>4º PERÍODO</strong>
        <div className="level-blocks" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
      </div>
      <div className="hero-center">
        <div className="hero-logo parallax-layer">
          <img
            src="/assets/bruno-logo-clean.png"
            alt="Logo BV de Bruno Venâncio"
            width="1774"
            height="887"
            fetchPriority="high"
          />
        </div>
        <h1 id="hero-title" className="sr-only">
          Bruno Venâncio
        </h1>
      </div>
      <div className="floating-window status-window parallax-layer">
        <div className="mini-title">
          <span>STATUS.EXE</span>
          <span aria-hidden="true">− □ ×</span>
        </div>
        <span className="status-label">EM CONSTANTE EVOLUÇÃO</span>
        <p>
          APRENDENDO
          <br />E CRIANDO
          <span className="blink-caret" aria-hidden="true">
            _
          </span>
        </p>
        <div className="status-bottom">
          <span className="status-dot" aria-hidden="true" />
          UM PASSO DE CADA VEZ
        </div>
      </div>
      <a className="pixel-control hero-contact" href="#contato">{t.contactButton}</a>
      <PixelEdge name="hero" />
    </section>
  );
}
