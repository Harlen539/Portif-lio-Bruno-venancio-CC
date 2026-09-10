import { useEffect, useRef } from "react";
import { safeUrl } from "../utils/safeUrl.js";

export default function ProjectDialog({ project, ready, onClose, openerRef }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (project && dialog && !dialog.open) dialog.showModal();
  }, [project]);

  const close = () => dialogRef.current?.close();
  const handleClosed = () => {
    onClose();
    openerRef.current?.focus({ preventScroll: true });
  };
  if (!project) return null;
  const liveUrl = safeUrl(project.liveUrl);
  const repoUrl = safeUrl(project.repoUrl);
  return (
    <dialog
      ref={dialogRef}
      id="project-dialog"
      aria-labelledby="dialog-title"
      onClose={handleClosed}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          close();
      }}
    >
      <div className="window-bar">
        <span>PROJECT.INFO</span>
        <button
          className="dialog-close"
          type="button"
          aria-label="Fechar detalhes"
          onClick={close}
        >
          ×
        </button>
      </div>
      <div className="dialog-content">
        <span className="project-status">
          {ready ? project.category || "PROJETO" : "EM PREPARAÇÃO"}
        </span>
        <h2 id="dialog-title">{project.title}</h2>
        <p>{project.description}</p>
        <p className="muted">
          {ready
            ? (project.technologies || []).join(" / ")
            : "Os projetos e os links serão adicionados em breve."}
        </p>
        <div>
          {liveUrl && (
            <a href={liveUrl} target="_blank" rel="noopener noreferrer">
              Visitar projeto ↗
            </a>
          )}
          {repoUrl && (
            <a href={repoUrl} target="_blank" rel="noopener noreferrer">
              Ver código ↗
            </a>
          )}
        </div>
        <button
          className="button button-red dialog-close"
          type="button"
          onClick={close}
        >
          VOLTAR AO PORTFÓLIO <span aria-hidden="true">↗</span>
        </button>
      </div>
    </dialog>
  );
}
