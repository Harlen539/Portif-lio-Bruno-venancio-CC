import "./knowledge.css";

const technologies = [
  { name: "Python", image: "python.png", color: "#ffd644" },
  { name: "Java", image: "java.png", color: "#ff5148" },
  { name: "HTML", image: "html.png", color: "#ff743d" },
  { name: "CSS", image: "css.png", color: "#459bff" },
  { name: "JavaScript", image: "javascript.png", color: "#ffe333" },
  { name: "Spring Boot", image: "spring-boot.png", color: "#8ed350" },
  { name: "React", image: "react.png", color: "#35d9f4" },
  { name: "Next.js", image: "nextjs.png", color: "#f3f1e9" },
  { name: "PostgreSQL", image: "postgresql.png", color: "#63a9e8" },
  { name: "GitHub", image: "github.png", color: "#f3f1e9" },
];

export default function Knowledge() {
  return (
    <section className="knowledge section-shell motion-section" id="conhecimentos" aria-labelledby="knowledge-title">
      <div className="section-surface">
        <div className="section-heading reveal">
          <div>
            <p className="eyebrow">03 / CONHECIMENTOS</p>
            <h2 id="knowledge-title">EM CONSTANTE<br /><em>EVOLUÇÃO.</em></h2>
          </div>
          <p>Aprender. Experimentar.<br />Construir. Repetir.</p>
        </div>
        <div className="technologies-band reveal">
          <div className="technologies-viewport">
            <div className="technologies-track">
              {[0, 1].map((copy) => (
                <ul key={copy} className="technologies-list" aria-label={copy === 0 ? "Tecnologias" : undefined} aria-hidden={copy === 1 ? true : undefined}>
                  {technologies.map(({ name, image, color }) => (
                    <li key={name} className="technology" style={{ "--technology-color": color }}>
                      <div className="technology-content">
                        <div className="technology-image">
                          <img src={`/assets/technologies/${image}`} alt="" width="1280" height="1280" decoding="async" />
                        </div>
                        <span className="technology-name">{name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
