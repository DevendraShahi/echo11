import Link from "next/link";

export default function WorkCaseNotFound() {
  return (
    <div className="container-shell page-section detail-page">
      <p className="section-marker">Case study not found</p>
      <h1>This work entry no longer exists.</h1>
      <p>Try browsing the latest case studies from the work index.</p>
      <Link href="/work" className="text-link">
        View all work
      </Link>
    </div>
  );
}
