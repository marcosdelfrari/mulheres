import { getActiveLocationLinks } from "@/lib/active-locations";
import { FooterClient } from "@/components/FooterClient";

export async function Footer() {
  const { cities, states } = await getActiveLocationLinks();
  return <FooterClient cities={cities} states={states} />;
}
