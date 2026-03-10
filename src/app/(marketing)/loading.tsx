export default function MarketingLoading() {
  return (
    <div className="container-shell page-section skeleton-shell" aria-live="polite" aria-busy="true">
      <div className="skeleton-line skeleton-line-lg" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-grid">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
    </div>
  );
}
