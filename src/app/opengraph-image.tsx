import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "echo11 Product Engineering Studio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const image = await readFile(
    join(process.cwd(), "public/seo/echo11-opengraph-image.png")
  );

  return new ImageResponse(
    (
      <img
        src={`data:image/png;base64,${image.toString("base64")}`}
        alt={alt}
        width={size.width}
        height={size.height}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    ),
    size
  );
}
