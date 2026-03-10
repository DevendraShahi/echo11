import Link from "next/link";

export default function StoryNotFound() {
  return (
    <div className="container-shell page-section detail-page">
      <p className="section-marker">Story not found</p>
      <h1>This story entry is not available.</h1>
      <p>Open the stories index to see current published breakdowns.</p>
      <Link href="/stories" className="text-link">
        Back to stories
      </Link>
    </div>
  );
}
