type HeroVisualProps = {
  eyebrow: string;
  title: string;
  detail: string;
  rows: Array<{
    label: string;
    value: string;
  }>;
  chips: string[];
};

export function HeroVisual({
  eyebrow,
  title,
  detail,
  rows,
  chips,
}: HeroVisualProps) {
  return (
    <aside className="hero-visual-card">
      <div className="hero-visual-grid" aria-hidden="true">
        <span className="hero-visual-node node-a" />
        <span className="hero-visual-node node-b" />
        <span className="hero-visual-node node-c" />
        <span className="hero-visual-node node-d" />
        <span className="hero-visual-line line-a" />
        <span className="hero-visual-line line-b" />
        <span className="hero-visual-line line-c" />
      </div>

      <div className="hero-visual-head">
        <span>{eyebrow}</span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>

      <div className="hero-visual-rows">
        {rows.map((row) => (
          <div key={row.label} className="hero-visual-row">
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>

      <div className="hero-visual-chips">
        {chips.map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </div>
    </aside>
  );
}
