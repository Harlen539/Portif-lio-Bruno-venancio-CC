const levels = [1, 2, 0, 1, 3, 1, 2, 0, 1, 1, 3, 2, 1, 0, 2, 1, 3, 1, 0, 2];

export function PixelEdge({ name, className = "" }) {
  const offset =
    name === "projects"
      ? 1
      : name === "projects-bottom"
        ? 2
        : name === "contact"
          ? 3
          : name === "contact-bottom"
            ? 4
            : 0;
  return (
    <div className={`pixel-edge ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: 40 }, (_, index) => (
        <i
          key={index}
          style={{
            height: `${17 + levels[(index + offset * 5) % levels.length] * 24}%`,
          }}
        />
      ))}
    </div>
  );
}
