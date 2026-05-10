import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Car, ChevronRight, ChevronLeft,
  Shield, CreditCard, Eye, Users, Sparkles,
} from "lucide-react";
// import { vehicles } from "@/data/vehicles"; // Removed static import
import VehicleCard from "@/components/VehicleCard";
import { DatePicker } from "@/components/DatePicker";
import hero1 from "@/assets/hero1.jpg";
import { startOfDay } from "date-fns";

import { useQuery } from "@tanstack/react-query";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

// Helper to transform backend vehicle to frontend format
const transformVehicle = (v: any) => ({
  id: v.id.toString(),
  name: v.name,
  type: v.type.toLowerCase(),
  seats: v.seats,
  transmission: v.transmission.toLowerCase(),
  location: v.location,
  province: v.province || "Western",
  pricePerDay: v.price_per_day,
  rating: v.rating || 5.0,
  reviewCount: v.review_count || 0,
  hasDriverOption: v.has_driver,
  images: v.image_url ? [v.image_url] : [],
  fuel: v.fuel_type,
  year: 2024,
  description: v.description
});

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [pickUpDate, setPickUpDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();

  const { data: remoteVehicles, isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const response = await fetch("http://127.0.0.1:8000/vehicles");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      return data.map(transformVehicle);
    }
  });

  const featured = remoteVehicles?.slice(0, 8) || [];
  const featuredLoop = featured.length > 0 ? [...featured, ...featured] : [];

  const [carouselPaused, setCarouselPaused] = useState(false);
  const CARD_WIDTH = 300 + 24; // min-w-[300px] + gap-6 (24px)
  const SET_WIDTH = featured.length * CARD_WIDTH; // width of one full set

  const scroll = (dir: number) => {
    const el = carouselRef.current;
    if (!el) return;
    let next = el.scrollLeft + dir * CARD_WIDTH;
    if (next < 0) next = 0;
    if (next > el.scrollWidth - el.clientWidth) next = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: next, behavior: "smooth" });
  };

  // Infinite loop: when we scroll into the duplicate set, jump back so it looks continuous
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollLeft >= SET_WIDTH) {
        el.scrollLeft -= SET_WIDTH;
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [SET_WIDTH]);

  useEffect(() => {
    if (carouselPaused) return;
    const el = carouselRef.current;
    if (!el) return;
    const t = setInterval(() => {
      el.scrollBy({ left: CARD_WIDTH, behavior: "smooth" });
    }, 3500);
    return () => clearInterval(t);
  }, [carouselPaused]);

  return (
    <>
      {/* Hero */}
      <section
        className="relative min-h-[85vh] flex flex-col overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${hero1})` }}
      >
        <div className="absolute inset-0 bg-black/40" aria-hidden />
        <div className="container relative z-10 mx-auto px-4 pt-20 pb-4 flex-1 flex flex-col">
          <div className="max-w-3xl mx-auto text-center flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="chip mb-6 inline-flex items-center gap-1.5 bg-primary text-primary-foreground">
                <Sparkles className="w-3.5 h-3.5" /> Premium Vehicle Rentals
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white mb-6 leading-tight">
                Drive Your Next{" "}
                <span className="gradient-text">Adventure</span>{" "}
                in Sri Lanka
              </h1>
              <p className="text-lg text-white mb-10 max-w-xl mx-auto">
                Explore the island with our curated fleet — from budget-friendly rides to luxury experiences. With or without a driver.
              </p>
            </motion.div>
          </div>

          {/* Search form at bottom of hero with 10px padding */}
          <div className="w-full max-w-4xl mx-auto mt-auto pb-[10px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="rounded-2xl border border-white/20 bg-black/25 dark:bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-8 dark:border-white/20"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 dark:text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Your Destination"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/15 dark:bg-white/10 border border-white/25 dark:border-white/20 text-white dark:text-foreground text-sm placeholder:text-white/60 dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-shadow"
                  />
                </div>
                <DatePicker
                  value={pickUpDate}
                  onChange={setPickUpDate}
                  placeholder="Pick-Up date"
                  minDate={startOfDay(new Date())}
                  className="bg-white/15 dark:bg-white/10 border-white/25 dark:border-white/20 !text-white dark:!text-foreground [&_svg]:text-white/60 dark:[&_svg]:text-muted-foreground"
                />
                <DatePicker
                  value={returnDate}
                  onChange={setReturnDate}
                  placeholder="Return Date"
                  minDate={pickUpDate ? startOfDay(pickUpDate) : startOfDay(new Date())}
                  className="bg-white/15 dark:bg-white/10 border-white/25 dark:border-white/20 !text-white dark:!text-foreground [&_svg]:text-white/60 dark:[&_svg]:text-muted-foreground"
                />
                <Link
                  to="/search"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Search className="w-4 h-4" />
                  Finder
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Verified Documents", desc: "All vehicles verified with proper insurance & registration" },
              { icon: CreditCard, title: "Secure Payments", desc: "Your transactions are protected with bank-level security" },
              { icon: Eye, title: "Transparent Pricing", desc: "No hidden fees — what you see is what you pay" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-card flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured vehicles */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-label text-primary mb-2 block">Featured</span>
              <h2 className="text-3xl font-heading font-bold text-foreground">Popular Vehicles</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => scroll(-1)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors" aria-label="Scroll left">
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button onClick={() => scroll(1)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors" aria-label="Scroll right">
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            onMouseEnter={() => setCarouselPaused(true)}
            onMouseLeave={() => setCarouselPaused(false)}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {isLoading ? (
              <div className="flex gap-6 overflow-x-auto pb-4 w-full">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="min-w-[300px] h-[400px] rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : featuredLoop.length === 0 ? (
              <div className="w-full py-20 text-center glass-card">
                <p className="text-muted-foreground">No vehicles listed yet. Be the first!</p>
              </div>
            ) : (
              featuredLoop.map((v, i) => (
                <div
                  key={`${v.id}-${i}`}
                  className={`min-w-[300px] snap-start shrink-0 ${i === 0 ? "-ml-16 sm:-ml-20" : ""
                    } ${i === featuredLoop.length - 1 ? "-mr-16 sm:-mr-20" : ""}`}
                >
                  <VehicleCard vehicle={v} />
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-secondary transition-colors"
            >
              View All Vehicles <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass-card gradient-primary text-center py-16 px-6 noise">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary-foreground mb-4">
              Ready to Hit the Road?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
              Join thousands of happy travelers exploring Sri Lanka with RentX.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/search"
                className="px-6 py-3 rounded-lg bg-card text-foreground font-medium text-sm hover:bg-card/90 transition-colors"
              >
                Browse Vehicles
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 rounded-lg border border-primary-foreground/30 text-primary-foreground font-medium text-sm hover:bg-primary-foreground/10 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
