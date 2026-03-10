"use client";

import { useEffect } from "react";

type LegalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LegalError({ error, reset }: LegalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-shell page-section detail-page">
      <p className="section-marker">Legal page error</p>
      <h1>Unable to load this legal document right now.</h1>
      <p>Please retry or check again shortly.</p>
      <button className="action action-primary" type="button" onClick={reset}>
        Retry
      </button>
    </div>
  );
}
