import Hero from "../components/Hero";
import Features from "../components/Features";
import Pricing from "../components/Pricing";
import Faq from "../components/Faq";
import CTA from "../components/CTA";

export default function Home() {
  return (
    <>
      <div id="home">
        <Hero />
      </div>

      <div id="features">
        <Features />
      </div>

      <div id="pricing">
        <Pricing />
      </div>

      <div id="faq">
        <Faq />
      </div>

      <CTA />
    </>
  );
}
