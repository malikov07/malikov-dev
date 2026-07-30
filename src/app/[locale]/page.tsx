import RequestProvider from "@/components/request/RequestProvider";
import CtaBand from "@/components/site/CtaBand";
import Faq from "@/components/site/Faq";
import Footer from "@/components/site/Footer";
import Hero from "@/components/site/Hero";
import Nav from "@/components/site/Nav";
import Process from "@/components/site/Process";
import ScrollProgress from "@/components/site/ScrollProgress";
import Services from "@/components/site/Services";
import Showcase from "@/components/site/Showcase";
import StyleStrip from "@/components/site/StyleStrip";
import LiquidBackground from "@/components/visuals/LiquidBackground";

export default function Home() {
  return (
    <RequestProvider>
      <LiquidBackground />
      <ScrollProgress />
      <Nav />

      <main className="relative flex-1">
        <Hero />
        <Services />
        <Showcase />
        <StyleStrip />
        <Process />
        <Faq />
        <CtaBand />
      </main>

      <Footer />
    </RequestProvider>
  );
}
