import Link from "next/link";

export default function ServiceNotFound() {
  return (
    <div className="container-shell page-section detail-page">
      <p className="section-marker">Service not found</p>
      <h1>The requested service page is unavailable.</h1>
      <p>Browse the full service catalog to continue.</p>
      <Link href="/services" className="text-link">
        Back to services
      </Link>
    </div>
  );
}
