import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-shell page-section detail-page">
      <p className="section-marker">404</p>
      <h1>Route not found.</h1>
      <p>
        The page you requested does not exist or has been moved into the latest
        Echo11 route structure.
      </p>
      <Link href="/" className="text-link">
        Return to home
      </Link>
    </div>
  );
}
