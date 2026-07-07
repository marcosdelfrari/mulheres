import type { Metadata } from "next";
import { CatalogView } from "@/components/CatalogView";
import { buildCatalogMetadata } from "@/lib/seo";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ region?: string; search?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  return buildCatalogMetadata(params);
}

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogView />
    </Suspense>
  );
}
