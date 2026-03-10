"use client";

import { useEffect } from "react";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-shell page-section detail-page">
      <p className="section-marker">Application error</p>
      <h1>Unexpected error in the site shell.</h1>
      <p>Reload or retry the last action.</p>
      <button className="action action-primary" type="button" onClick={reset}>
        Retry
      </button>
    </div>
  );
}
