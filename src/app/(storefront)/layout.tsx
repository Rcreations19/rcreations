import { CartProvider } from '@/components/storefront/CartContext';
import { AuthProvider } from '@/components/storefront/AuthContext';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import FallingAnimation from '@/components/shared/FallingAnimation';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import FloatingWhatsApp from '@/components/storefront/FloatingWhatsApp';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen relative font-sans text-neutral-900 selection:bg-neutral-200 bg-[#FAFAFA]">
          <FallingAnimation className="opacity-50 z-40" />
          {/* Skip to content — keyboard accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg"
          >
            Skip to content
          </a>
          {/* Main Page Layout */}
          <div className="relative z-10 flex flex-col min-h-screen pb-24 md:pb-0">
            <Navbar />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
          </div>

          <MobileBottomNav />

          {/* Cart Drawer */}
          <CartDrawer />

          {/* Floating WhatsApp */}
          <FloatingWhatsApp />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

