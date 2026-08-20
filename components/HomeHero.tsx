"use client";

import { LocationHero } from "@/components/LocationHero";

export function HomeHero() {
  return (
    <LocationHero
      eyebrow="Exclusividade em todo o Brasil"
      locationName="todo o Brasil"
      subtitle="Descubra perfis selecionados nas principais capitais e regiões. Uma curadoria focada em discrição, sofisticação e atendimento de alto nível."
      searchPlaceholder="Qual cidade você procura?"
      catalogHref="/acompanhantes"
    />
  );
}
