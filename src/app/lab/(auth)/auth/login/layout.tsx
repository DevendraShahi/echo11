import type { Metadata } from "next";

// The login page is a client component and cannot export metadata, so this
// server layout supplies the route title. Robots noindex is inherited from
// the lab root layout's noIndexMetadata. No auth behavior lives here.
export const metadata: Metadata = {
  title: "Lab Sign In | echo11",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
