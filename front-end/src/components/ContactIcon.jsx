const icons = {
  github: { viewBox: "270 235 710 830" },
  mail: { viewBox: "265 380 720 520" },
  whatsapp: { viewBox: "215 230 810 810" },
};

export default function ContactIcon({ name }) {
  return (
    <svg viewBox={icons[name].viewBox} aria-hidden="true" focusable="false">
      <image href={`/assets/contact/${name}.png`} width="1254" height="1254" />
    </svg>
  );
}