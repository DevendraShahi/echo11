import { draftMode } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") ?? "/";
  const disable = searchParams.get("disable");

  if (!process.env.DRAFT_SECRET || secret !== process.env.DRAFT_SECRET) {
    return new Response("Invalid secret", { status: 401 });
  }

  const draft = await draftMode();

  if (disable === "1") {
    draft.disable();
    return Response.redirect(new URL("/", request.url));
  }

  draft.enable();
  return Response.redirect(new URL(slug, request.url));
}
