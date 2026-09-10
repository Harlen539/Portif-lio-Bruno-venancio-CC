import ContactIcon from "../components/ContactIcon.jsx";
import { PixelEdge, PixelShutter } from "../components/PixelDecorations.jsx";
import { safeUrl } from "../utils/safeUrl.js";

export default function Contact({ contact }) {
  const emailIsValid =
    typeof contact.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);
  const github = safeUrl(contact.github);
  const whatsapp = safeUrl(contact.whatsapp);

  return (
    <section
      className="contact motion-section"
      id="contato"
      aria-labelledby="contact-title"
    >
      <PixelShutter offset={3} />
      <PixelEdge name="contact" className="pixel-edge-top" />
      <div className="section-surface">
        <div className="contact-frames parallax-layer" aria-hidden="true" />
        <div className="contact-content reveal">
          <p className="eyebrow">04 / PRÓXIMO PASSO</p>
          <h2 id="contact-title">
            VAMOS CRIAR
            <br />
            ALGO <span>JUNTOS?</span>
          </h2>
          <p>Uma boa ideia começa com uma conversa.</p>
          <div id="contact-actions">
            {github && (
              <a className="contact-social" href={github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                <ContactIcon name="github" />
              </a>
            )}
            <a
              className="contact-social"
              href={emailIsValid ? `mailto:${contact.email}?subject=${encodeURIComponent("Vamos criar algo juntos?")}` : undefined}
              aria-label={emailIsValid ? "E-mail" : "E-mail em breve"}
              aria-disabled={!emailIsValid || undefined}
              title={emailIsValid ? "E-mail" : "E-mail em breve"}
            >
              <ContactIcon name="mail" />
            </a>
            {whatsapp && (
              <a className="contact-social" href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp">
                <ContactIcon name="whatsapp" />
              </a>
            )}
          </div>
        </div>
        <span
          className="pixel-star contact-star parallax-layer"
          aria-hidden="true"
        />
      </div>
      <PixelEdge name="contact-bottom" />
    </section>
  );
}
