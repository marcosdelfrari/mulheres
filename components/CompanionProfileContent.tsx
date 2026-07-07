import type { Companion } from "@/lib/types";
import { CompanionGallery } from "./CompanionGallery";
import { CompanionProfileDetails } from "./CompanionProfileDetails";

interface CompanionProfileContentProps {
  companion: Companion;
}

function SectionHeading({
  children,
  count,
}: {
  children: string;
  count?: number;
}) {
  return (
    <div className="border-b border-gray-200">
      <h2 className="inline-block border-b-[3px] border-[#d94a42] pb-2.5 text-[15px] font-bold leading-none text-[#d94a42]">
        {children}
        {count !== undefined && ` (${count})`}
      </h2>
    </div>
  );
}

export function CompanionProfileContent({
  companion,
}: CompanionProfileContentProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6">
      <section>
        <SectionHeading count={companion.photos.length}>
          Fotos e vídeos
        </SectionHeading>
        <div className="mt-4">
          <CompanionGallery
            photos={companion.photos}
            name={companion.name}
            variant="embedded"
          />
        </div>
      </section>

      <section className="space-y-4 pt-1">
        <SectionHeading>Sobre mim</SectionHeading>

        {!companion.verified && (
          <p className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-900">
            Perfil em verificação. Recomendamos cautela.
          </p>
        )}

        <p className="leading-relaxed text-gray-700">{companion.bio}</p>

        <CompanionProfileDetails
          services={companion.services}
          servicesFor={companion.servicesFor}
          serviceLocations={companion.serviceLocations}
          payments={companion.payments}
        />
      </section>
    </div>
  );
}
