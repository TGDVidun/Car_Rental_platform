import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  const [showBookNow, setShowBookNow] = useState(false);
  const location = useLocation();
  const hideStickyBookNow = location.pathname === "/search" || location.pathname.startsWith("/vehicle/");

  useEffect(() => {
    const onScroll = () => setShowBookNow(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col transition-theme relative">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="blob w-[500px] h-[500px] bg-primary/20 -top-40 -right-40" />
        <div className="blob w-[400px] h-[400px] bg-accent/15 bottom-20 -left-40" />
        <div className="blob w-[300px] h-[300px] bg-primary/10 top-1/2 right-1/3" />
      </div>
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />

      {/* Sticky Book Now - hidden on Search and Vehicle detail pages */}
      <AnimatePresence>
        {showBookNow && !hideStickyBookNow && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <Link
              to="/search"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200"
            >
              <Search className="w-4 h-4" />
              Book Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
