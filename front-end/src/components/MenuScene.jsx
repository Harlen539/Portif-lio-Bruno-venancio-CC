export const navigationItems = [
  { id: "inicio", image: "cassette-inicio.png", label: "home" },
  { id: "sobre", image: "cassette-sobre.png", label: "about" },
  { id: "projetos", image: "cassette-projetos.png", label: "projects" },
  { id: "conhecimentos", image: "cassette-conhecimentos.png", label: "knowledge" },
];

const decorations = [
  { name: "lightning", colored: true },
  { name: "alien" },
  { name: "heart" },
  { name: "cursor" },
  { name: "star" },
  { name: "trophy", colored: true },
  { name: "note", colored: true },
];

export default function MenuScene({ sceneRef, state, t, activeSection, activeItem, setActiveItem, navigate }) {
  return (
    <nav id="navigation" ref={sceneRef} className="record-menu" data-state={state}
      data-active={activeItem || "default"} aria-label={t.menu} hidden={state === "closed"}>
      <div className="record-panel" />
      <div className="record-stage">
        <div className="record-halo" aria-hidden="true" />
        <p className="record-caption">BRUNO VENÂNCIO — VOL. 01 <span>SELECT / PLAY</span></p>
        <div className="record-decorations" aria-hidden="true">
          {decorations.map((icon, index) => (
            <div className={`record-decoration decor-${index}`} key={icon.name}>
              <span className="record-symbol" style={{ "--loop": `${5 + index * .7}s`, "--offset": `${-index * 1.3}s` }}>
                {icon.colored ? (
                  <img className="record-glyph record-glyph-color" src={`/assets/flaticon/${icon.name}.png?v=2`} width="512" height="512" alt="" draggable="false" />
                ) : (
                  <span className="record-glyph record-glyph-mask" style={{ maskImage: `url(/assets/flaticon/${icon.name}.png)` }} />
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="record-carriage">
        <div className="record-box record-box-back" aria-hidden="true">
          <svg viewBox="0 0 320 220" shapeRendering="crispEdges">
            <path fill="#050505" d="M0 32H16V16H48V8H272V16H304V32H320V212H304V220H16V212H0Z" />
            <path fill="#555" d="M16 40H32V24H288V40H304V92H16Z" />
            <path fill="#121212" d="M32 48H288V168H32Z" />
            <path fill="#9c1723" d="M16 64H32V192H16ZM288 64H304V192H288Z" />
          </svg>
        </div>
        <div className="record-items">
          {navigationItems.map((item, index) => (
            <div className={`record-flight record-flight-${index}`} key={item.id}>
              <a href={`#${item.id}`} className="record-link" aria-label={t[item.label]}
                aria-current={activeSection === item.id ? "location" : undefined}
                style={{ "--tilt": `${index % 2 ? 5 : -5}deg` }}
                onPointerEnter={(event) => { if (event.pointerType !== "touch") setActiveItem(item.id); }}
                onPointerLeave={() => setActiveItem(null)}
                onFocus={() => setActiveItem(item.id)} onBlur={() => setActiveItem(null)}
                onClick={(event) => navigate(event, item.id)}>
                <img src={`/assets/${item.image}`} alt="" width="1536" height="1024" draggable="false" />
              </a>
            </div>
          ))}
        </div>
        <div className="record-box record-box-front" aria-hidden="true">
          <svg viewBox="0 0 320 220" shapeRendering="crispEdges">
            <path fill="#050505" d="M0 80H16V72H304V80H320V212H304V220H16V212H0Z" />
            <path fill="#b10f20" d="M16 88H304V204H16Z" />
            <path fill="#f22937" d="M16 88H304V104H16ZM16 104H32V196H16Z" />
            <path fill="#630914" d="M288 104H304V204H32V188H288Z" />
            <path fill="#050505" d="M112 112H208V136H112Z" />
            <path fill="#eee9df" d="M128 112H192V120H128ZM48 160H88V168H48ZM48 176H72V184H48ZM256 160H272V184H256Z" />
          </svg>
          <span>BV / RECORDS</span>
        </div>
        </div>
        <p className="record-footer">PORTFÓLIO PESSOAL <span>© BRUNO VENÂNCIO</span></p>
      </div>
    </nav>
  );
}
