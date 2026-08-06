import { NOINDEX_METADATA } from "@/lib/seo";

export const metadata = NOINDEX_METADATA;

export default function RedefinirSenhaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="luxury-shell flex-1">{children}</div>;
}
