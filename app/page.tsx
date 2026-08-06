import { HomeHero } from "@/components/HomeHero";
import { HomeSeoSection } from "@/components/HomeSeoSection";
import { HomeFaqSection } from "@/components/HomeFaqSection";
import { TopCompanions } from "@/components/TopCompanions";

export default function HomePage() {
  return (
    <>
      <div className="luxury-shell">
        <HomeHero />
      </div>
      <TopCompanions />
      <HomeSeoSection />
      <HomeFaqSection />
    </>
  );
}
