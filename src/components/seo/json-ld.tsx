import type { JsonLdSchema } from "@/lib/seo";

type JsonLdProps = {
  schema: JsonLdSchema;
};

export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
