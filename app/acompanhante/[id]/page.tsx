import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompanionById } from "@/lib/mock-data";
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const companion = getCompanionById(id);
  if (!companion) return { title: "Perfil não encontrado" };
  return buildCompanionMetadata(companion);
}

export default async function CompanionProfilePage({ params }: PageProps) {
  const { id } = await params;
  const companion = getCompanionById(id);

  if (!companion) {
    notFound();
  }

  const whatsappUrl = `https://wa.me/${companion.whatsapp}?text=${encodeURIComponent(
    `Olá ${companion.name}, vi seu perfil no Mulheres.`
  )}`;

  const breadcrumbItems =
    companion.city === "Belo Horizonte"
      ? [
          { name: "Início", url: absoluteUrl("/") },
          {
            name: "Belo Horizonte",
            url: absoluteUrl("/minas-gerais/belo-horizonte"),
          },
          {
            name: companion.name,
            url: absoluteUrl(`/acompanhante/${companion.id}`),
          },
        ]
      : [
          { name: "Início", url: absoluteUrl("/") },
          { name: "Catálogo", url: absoluteUrl("/catalogo") },
          {
            name: companion.name,
            url: absoluteUrl(`/acompanhante/${companion.id}`),
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
