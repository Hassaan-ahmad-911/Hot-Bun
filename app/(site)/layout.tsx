import { CartDrawer } from "@/components/cart/CartDrawer";
import { FlyLayer } from "@/components/cart/FlyLayer";
import { MobileCartBar } from "@/components/cart/MobileCartBar";
import { ScrollProgress } from "@/components/motion/Kinetic";
import { BurgerIntro } from "@/components/site/BurgerIntro";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BurgerIntro />
      <ScrollProgress />
      <Header />
      <main id="main" tabIndex={-1} className="min-h-[70vh] outline-none">
        {children}
      </main>
      <Footer />
      <MobileCartBar />
      <CartDrawer />
      <FlyLayer />
    </>
  );
}
