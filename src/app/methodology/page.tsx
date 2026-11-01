import { permanentRedirect } from "next/navigation";

// Preserve existing bookmarks while consolidating the visitor-facing pages.
export default function MethodologyPage() {
  permanentRedirect("/process");
}
