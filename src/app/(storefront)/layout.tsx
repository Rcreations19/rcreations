import { CartProvider } from '@/components/storefront/CartContext';
import { AuthProvider } from '@/components/storefront/AuthContext';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import FallingAnimation from '@/components/shared/FallingAnimation';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen relative font-sans text-neutral-900 selection:bg-neutral-200 bg-[#FAFAFA]">
          {/* Overlay to reduce background image opacity */}
          <div className="absolute inset-0 bg-white/70 pointer-events-none z-0"></div>
          
          <FallingAnimation className="opacity-15 !z-0" />
          {/* Main Page Layout */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>

          {/* Cart Drawer */}
          <CartDrawer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

