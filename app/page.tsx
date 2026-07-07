import { HomeHero } from "@/components/HomeHero";
import { HomeSeoSection } from "@/components/HomeSeoSection";
import { TopCompanions } from "@/components/TopCompanions";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <TopCompanions />
      <HomeSeoSection />
    </>
  );
}
