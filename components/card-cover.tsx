type CardCoverProps = {
  variant: "project" | "article";
  accent: string;
  tags: string[];
  imageUrl?: string;
};

export function CardCover({ variant, accent, tags, imageUrl }: CardCoverProps) {
  return (
    <div className={`card-cover card-cover-${variant}`}>
      <div className="card-cover-media">
        {imageUrl ? (
          <div className="card-cover-image-wrap">
            <img src={imageUrl} alt="" className="card-cover-image" />
          </div>
        ) : (
          <div className="card-cover-grid" aria-hidden="true">
            <span className="card-cover-ring" />
            <span className="card-cover-pulse" />
            <span className="card-cover-path path-a" />
            <span className="card-cover-path path-b" />
            <span className="card-cover-dot dot-a" />
            <span className="card-cover-dot dot-b" />
            <span className="card-cover-dot dot-c" />
          </div>
        )}

        <div className="card-cover-overlay">
          <span className="card-cover-badge">
            {variant === "project" ? "Project" : "Article"}
          </span>
          <div className="card-cover-meta">
            <small>{accent}</small>
            <div className="card-cover-tags">
              {tags.slice(0, 2).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
