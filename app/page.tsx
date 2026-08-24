import { HomeHero } from "@/components/HomeHero";
import { HomeSeoSection } from "@/components/HomeSeoSection";
import { HomeFaqSection } from "@/components/HomeFaqSection";
import { TopCompanions } from "@/components/TopCompanions";
import {
  getSponsoredCompanions,
  getTopCompanions,
} from "@/lib/listings";

export const revalidate = 3600;

export default async function HomePage() {
  const [tops, sponsored] = await Promise.all([
    getTopCompanions(6),
    getSponsoredCompanions(),
  ]);

  return (
    <>
      <div className="luxury-shell">
        <HomeHero />
      </div>
      <TopCompanions tops={tops} sponsored={sponsored} />
      <HomeSeoSection />
      <HomeFaqSection />
    </>
  );
}
