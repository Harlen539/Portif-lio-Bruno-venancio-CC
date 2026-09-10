import { useRef, useState } from "react";
import { PixelEdge } from "../components/PixelDecorations.jsx";
import ProjectDialog from "../components/ProjectDialog.jsx";
import ContactIcon from "../components/ContactIcon.jsx";
import { safeUrl } from "../utils/safeUrl.js";
import { placeholderProjects } from "../data/portfolio.js";

export default function Projects({ projects }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const openerRef = useRef(null);
  const hasRealProjects = Array.isArray(projects) && projects.length > 0;
  const visibleProjects = hasRealProjects ? projects : placeholderProjects;
  const openProject = (project, event) => {
    openerRef.current = event.currentTarget;
    setSelectedProject(project);
    document.body.classList.add("dialog-open");
  };
  const closeProject = () => {
    setSelectedProject(null);
    document.body.classList.remove("dialog-open");
  };
  return (
    <>
      <section
        className="projects motion-section"
        id="projetos"
        aria-labelledby="projects-title"
      >
        <PixelEdge name="projects" className="pixel-edge-top" />
        <div className="section-surface">
          <div className="section-shell">
            <div className="section-heading reveal">
              <div>
                <p className="eyebrow">02 / PROJETOS</p>
                <h2 id="projects-title">
                  DA IDEIA
                  <br />
                  AO <span className="outline-text">CÓDIGO.</span>
                </h2>
              </div>
              <p>
                Um espaço para o que
                <br />
                estou construindo.
              </p>
            </div>
            <div className="projects-grid">
              {visibleProjects.map((project, index) => (
                <article
                  className="project-card project-preview-card"
                  key={project.id || project.title || index}
                >
                  <div className="window-bar">
                    <span>
                      {String(index + 1).padStart(2, "0")} —{" "}
                      {project.category || "PROJETO"}
                    </span>
                    <span className="window-controls" aria-hidden="true">
                      <i>−</i>
                      <i>□</i>
                    </span>
                  </div>
                  <div
                    className={`project-image ${project.variant || "web-preview"}`}
                  >
                    {project.variant === "database-preview" ? (
                      <>
                        <div className="data-symbol" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <use href="#icon-database" />
                          </svg>
                        </div>
                        <span className="database-label" aria-hidden="true">
                          IDEIAS BEM
                          <br />
                          ESTRUTURADAS.
                        </span>
                      </>
                    ) : (
                      <img
                        className="parallax-layer"
                        src={project.image || "/assets/project-world.png"}
                        alt={
                          project.imageAlt ||
                          `Prévia de ${project.title || "projeto"}`
                        }
                        width="1536"
                        height="1024"
                        loading="lazy"
                        onError={(event) => {
                          const image = event.currentTarget;
                          if (image.dataset.fallbackApplied) return;
                          image.dataset.fallbackApplied = "true";
                          image.src = "/assets/project-world.png";
                        }}
                      />
                    )}
                    <span className="project-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="project-details">
                    <div>
                      <span className="project-status">
                        {hasRealProjects ? "PROJETO" : "EM PREPARAÇÃO"}
                      </span>
                      <h3>{project.title || "Projeto"}</h3>
                      <p>
                        {project.description || project.cardDescription || ""}
                      </p>
                    </div>
                    <div className="project-technologies">
                      <span className="project-technologies-label">TECNOLOGIAS UTILIZADAS</span>
                      {project.technologies?.length ? (
                        <ul>
                          {project.technologies.map((technology) => (
                            <li key={technology}><span aria-hidden="true">+</span>{technology}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="project-technology-pending">EM DEFINIÇÃO</span>
                      )}
                    </div>
                    <div className="project-card-actions">
                    <button
                      className="project-open"
                      type="button"
                      aria-label={`Ver detalhes de ${project.title || "projeto"}`}
                      onClick={(event) => openProject(project, event)}
                    >
                      <span>VER DETALHES</span>
                      <svg className="pixel-icon" aria-hidden="true">
                        <use href="#icon-arrow" />
                      </svg>
                    </button>
                    {safeUrl(project.repoUrl) ? (
                      <a className="project-repository" href={safeUrl(project.repoUrl)} target="_blank" rel="noopener noreferrer" aria-label={`GitHub de ${project.title}`} title="Ver código no GitHub">
                        <ContactIcon name="github" />
                      </a>
                    ) : (
                      <span className="project-repository" aria-label="Repositório em breve" title="Repositório em breve">
                        <ContactIcon name="github" />
                      </span>
                    )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {!hasRealProjects && (
              <p className="projects-note">
                <span aria-hidden="true">*</span> Os primeiros projetos serão
                compartilhados aqui em breve.
              </p>
            )}
          </div>
        </div>
        <PixelEdge name="projects-bottom" />
      </section>
      <ProjectDialog
        project={selectedProject}
        ready={hasRealProjects}
        onClose={closeProject}
        openerRef={openerRef}
      />
    </>
  );
}
