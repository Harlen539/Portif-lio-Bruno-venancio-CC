import PixelSwap from "../components/PixelSwap.jsx";

export default function About() {
  return (
    <section
      className="about section-shell motion-section"
      id="sobre"
      aria-labelledby="about-title"
    >
      <PixelSwap />
      <div className="section-surface">
        <div className="window reveal">
          <div className="window-bar">
            <h2 id="about-title">01 / SOBRE MIM</h2>
            <span className="window-controls" aria-hidden="true">
              <i>−</i>
              <i>□</i>
              <i>×</i>
            </span>
          </div>
          <div className="about-content">
            <div className="workstation-wrap">
              <span className="small-coordinate" aria-hidden="true">
                IDEIA → CÓDIGO → POSSIBILIDADE
              </span>
              <img
                className="workstation parallax-layer"
                src="/assets/workstation.png"
                alt="Ilustração pixel art de uma estação de programação com computador retrô"
                width="1024"
                height="1024"
                loading="lazy"
              />
              <span className="art-caption">
                <span className="red-square" aria-hidden="true" /> MEU PONTO DE
                PARTIDA
              </span>
            </div>
            <div className="about-copy">
              <p className="eyebrow muted">PRAZER, BRUNO.</p>
              <h3>
                MUITO PRA APRENDER.
                <br />
                MUITO PRA <em>CRIAR.</em>
              </h3>
              <p>
                Sou Bruno Venâncio, estudante do{" "}
                <strong>4º período de Ciência da Computação.</strong> Exploro
                linguagens de programação e bancos de dados para transformar
                ideias em projetos.
              </p>
              <p className="muted">
                Cada descoberta é uma oportunidade de construir algo novo. Por
                aqui, compartilho um pouco dessa jornada.
              </p>
              <div className="tags">
                <span>PROGRAMAÇÃO</span>
                <span>BANCO DE DADOS</span>
                <span>COMPUTAÇÃO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
