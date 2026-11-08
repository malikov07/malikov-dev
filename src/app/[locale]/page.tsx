import RequestProvider from "@/components/request/RequestProvider";
import CtaBand from "@/components/site/CtaBand";
import Faq from "@/components/site/Faq";
import Footer from "@/components/site/Footer";
import Hero from "@/components/site/Hero";
import Manifesto from "@/components/site/Manifesto";
import Nav from "@/components/site/Nav";
import Process from "@/components/site/Process";
import ScrollProgress from "@/components/site/ScrollProgress";
import Services from "@/components/site/Services";
import Showcase from "@/components/site/Showcase";
import SmoothScroll from "@/components/site/SmoothScroll";
import StyleStrip from "@/components/site/StyleStrip";
import Ticker from "@/components/site/Ticker";
import Background3D from "@/components/three/Background3D";

/**
 * The page alternates dark and light chapters, the way a product page
 * alternates scenes: dark ones (`data-tone="dark"`) are transparent and show
 * the fixed 3D layer behind the page; light ones sit on opaque paper over it.
 *
 *   dark   Hero — pinned; the UI on a 3D phone and browser floats off the
 *          screens, snaps back together, lights up, and
 *          the camera dives into it as the page washes to white
 *   light  Manifesto · Services · Ticker · Showcase (horizontal gallery)
 *   dark   Styles — the 3D carousel, over the aurora
 *   light  Process · FAQ
 *   dark   Closing call to action, where the devices return · Footer
 */
export default function Home() {
  return (
    <RequestProvider>
      <SmoothScroll />
      <Background3D />
      <ScrollProgress />
      <Nav />

      <main className="relative flex-1">
        <Hero />
        <Manifesto />
        <Services />
        <Ticker />
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
