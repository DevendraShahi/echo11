"use client";

import { useEffect } from "react";

type MarketingErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function MarketingError({ error, reset }: MarketingErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-shell page-section detail-page">
      <p className="section-marker">Error</p>
      <h1>Something failed while loading this page.</h1>
      <p>Try again or navigate back to the home page.</p>
      <button className="action action-primary" type="button" onClick={reset}>
        Retry
      </button>
    </div>
  );
}
