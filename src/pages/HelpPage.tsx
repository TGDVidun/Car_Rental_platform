import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { Link } from "react-router-dom";

const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const faqs = [
  { q: "How do I book a vehicle?", a: "Browse our collection, select your dates and vehicle, then click 'Reserve Now'. You'll receive a confirmation within 30 minutes." },
  { q: "Can I get a driver with my rental?", a: "Yes! Many vehicles offer an optional driver service. Look for the 'Driver Available' badge on vehicle cards." },
  { q: "What documents do I need?", a: "A valid driver's license (local or international), a government-issued ID, and a credit or debit card for the security deposit." },
  { q: "What's the cancellation policy?", a: "Free cancellation up to 24 hours before your pick-up time. After that, a partial fee may apply." },
  { q: "Is insurance included?", a: "Basic insurance is included with every rental. You can opt for premium coverage at checkout for additional peace of mind." },
  { q: "What if the vehicle breaks down?", a: "We provide 24/7 roadside assistance. Call our hotline and we'll have help to you within the hour." },
  { q: "Do you deliver vehicles?", a: "Yes, delivery is available in most major cities for a small additional fee. Check availability during booking." },
  { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, bank transfers, and popular mobile payment methods." },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
      <motion.div
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.05 }}
        className="space-y-10"
      >
        <header className="space-y-4">
          <motion.p variants={fade} className="text-xs font-medium uppercase tracking-wider text-primary">
            Help & FAQ
          </motion.p>
          <motion.h1 variants={fade} className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tight">
            Find answers
          </motion.h1>
          <motion.p variants={fade} className="text-muted-foreground leading-relaxed">
            Common questions about booking, payments, and rentals.
          </motion.p>
        </header>

        <motion.div variants={fade} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
          />
        </motion.div>

        {filtered.length === 0 ? (
          <motion.p variants={fade} className="text-muted-foreground text-center py-8">
            No questions match your search. Try different keywords or{" "}
            <Link to="/contact" className="text-primary hover:underline">contact us</Link>.
          </motion.p>
        ) : (
          <div className="space-y-2">
            {filtered.map((faq, i) => (
              <motion.div
                key={i}
                variants={fade}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-secondary/30 transition-colors"
                  aria-expanded={open === i}
                >
                  <span className="font-medium text-foreground pr-2">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-2">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div variants={fade} className="pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link to="/contact" className="text-primary hover:underline">Contact us</Link>
          <span>·</span>
          <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
          <span>·</span>
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
