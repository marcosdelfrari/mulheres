import { NOINDEX_METADATA } from "@/lib/seo";
import { RecaptchaScript } from "@/components/RecaptchaScript";

export const metadata = NOINDEX_METADATA;

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="luxury-shell flex-1">
      <RecaptchaScript />
      {children}
    </div>
  );
}
