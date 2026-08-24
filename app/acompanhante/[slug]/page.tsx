import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  buildCompanionSlug,
  companionProfilePath,
} from "@/lib/companion-utils";
import { buildCompanionBreadcrumb } from "@/lib/companion-breadcrumb";
import { getCompanionBySlugOrId, getPublishedCompanions } from "@/lib/listings";
import { whatsappIntl } from "@/lib/phone";
import { CompanionContactBar } from "@/components/CompanionContactBar";
import { CompanionProfileBreadcrumb } from "@/components/CompanionProfileBreadcrumb";
import { CompanionProfileHero } from "@/components/CompanionProfileHero";
import { CompanionProfileContent } from "@/components/CompanionProfileContent";
import { JsonLd } from "@/components/JsonLd";
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildCompanionJsonLd,
  buildCompanionMetadata,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const companions = await getPublishedCompanions();
    return companions.map((c) => ({ slug: buildCompanionSlug(c) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const companion = await getCompanionBySlugOrId(slug);
  if (!companion) return { title: "Perfil não encontrado" };
  return buildCompanionMetadata(companion);
}

export default async function CompanionProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const companion = await getCompanionBySlugOrId(slug);

  if (!companion) {
    notFound();
  }

  const whatsappUrl = `https://wa.me/${whatsappIntl(companion.whatsapp)}?text=${encodeURIComponent(
    `Olá ${companion.name}, vi seu perfil no *Mulheres de Luxo* e gostaria de agendar.`,
  )}`;

  const breadcrumbTrail = buildCompanionBreadcrumb(companion);
  const breadcrumbItems = [
    ...breadcrumbTrail.map((item) => ({
      name: item.label,
      url: absoluteUrl(item.href),
    })),
    {
      name: companion.name,
      url: absoluteUrl(companionProfilePath(companion)),
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          buildCompanionJsonLd(companion),
          buildBreadcrumbJsonLd(breadcrumbItems),
        ]}
      />

      <div className="pb-24 sm:pb-28">
        <div className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
          <CompanionProfileBreadcrumb companion={companion} />
        </div>

        <CompanionProfileHero companion={companion} />

        <div className="mt-5">
          <CompanionProfileContent companion={companion} />
        </div>
      </div>

      <CompanionContactBar phone={companion.phone} whatsappUrl={whatsappUrl} />
    </>
  );
}
