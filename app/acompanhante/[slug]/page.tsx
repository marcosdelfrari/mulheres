import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  buildCompanionSlug,
  companionProfilePath,
} from "@/lib/companion-utils";
import {
  getCompanionBySlugOrId,
  getPublishedCompanions,
} from "@/lib/listings";
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
import { CITY_HUBS, cityHubPath } from "@/lib/location-hubs";

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
    `Olá ${companion.name}, vi seu perfil no Mulheres.`,
  )}`;

  const cityHub = CITY_HUBS.find(
    (h) => h.region === companion.region && h.city === companion.city,
  );

  const breadcrumbItems = cityHub
    ? [
        { name: "Início", url: absoluteUrl("/") },
        {
          name: companion.region,
          url: absoluteUrl(
            `/acompanhantes?region=${encodeURIComponent(companion.region)}`,
          ),
        },
        { name: companion.city, url: absoluteUrl(cityHubPath(cityHub)) },
        {
          name: companion.name,
          url: absoluteUrl(companionProfilePath(companion)),
        },
      ]
    : [
        { name: "Início", url: absoluteUrl("/") },
        { name: "As modelos", url: absoluteUrl("/acompanhantes") },
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
