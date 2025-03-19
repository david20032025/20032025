import { createClient } from "../../supabase/server";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ServiceBenefits from "@/components/service-benefits";
import Testimonials from "@/components/testimonials";
import FinalCTA from "@/components/final-cta";
import AssetCategories from "@/components/asset-categories";
import StatsSection from "@/components/stats-section";
import PricingSection from "@/components/pricing-section";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />

      {/* Service Benefits Section */}
      <ServiceBenefits />

      {/* Asset Categories Section */}
      <AssetCategories />

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Pricing Section */}
      <PricingSection plans={plans} user={user} />

      {/* Final CTA Section */}
      <FinalCTA />

      <Footer />
    </div>
  );
}
