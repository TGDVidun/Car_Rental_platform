import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, CreditCard, UserCircle, Headphones } from "lucide-react";

const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const offerItems = [
  { icon: Shield, text: "Verified vehicles and documents" },
  { icon: CreditCard, text: "Transparent pricing, no hidden fees" },
  { icon: UserCircle, text: "Optional driver for any booking" },
  { icon: Headphones, text: "24/7 support and roadside assistance" },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
      <motion.div
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.06 }}
        className="space-y-16"
      >
        <header className="space-y-6">
          <motion.p variants={fade} className="text-xs font-medium uppercase tracking-wider text-primary">
            About
          </motion.p>
          <motion.h1 variants={fade} className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tight">
            We connect travelers with the right wheels across Sri Lanka.
          </motion.h1>
          <motion.p variants={fade} className="text-muted-foreground leading-relaxed">
            RentX is a curated vehicle rental platform offering cars, SUVs, vans, and luxury options—with or without a driver—so you can explore the island on your terms.
          </motion.p>
        </header>

        <motion.section
          variants={fade}
          className="rounded-2xl overflow-hidden border border-border shadow-lg aspect-[16/9] max-h-[320px] sm:max-h-[380px]"
        >
          <img
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80"
            alt="Scenic road in Sri Lanka"
            className="w-full h-full object-cover"
          />
        </motion.section>

        <section className="space-y-6">
          <motion.h2 variants={fade} className="text-lg font-heading font-semibold text-foreground">
            Our mission
          </motion.h2>
          <motion.p variants={fade} className="text-muted-foreground leading-relaxed">
            To make rental simple, transparent, and reliable. Every vehicle is verified, every price is clear, and every trip is backed by support when you need it.
          </motion.p>
        </section>

        <section className="space-y-6">
          <motion.h2 variants={fade} className="text-lg font-heading font-semibold text-foreground">
            What we offer
          </motion.h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {offerItems.map((item, i) => (
              <motion.li
                key={i}
                variants={fade}
                whileHover={{ scale: 1.02, x: 4 }}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 hover:border-primary/20 transition-colors cursor-default"
              >
                <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </span>
                <span className="text-sm text-foreground">{item.text}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        <motion.section
          variants={fade}
          className="grid grid-cols-2 gap-3 sm:gap-4"
        >
          <div className="rounded-xl overflow-hidden border border-border aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80"
              alt="Vehicle rental"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-border aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&q=80"
              alt="Travel adventure"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </motion.section>

        <motion.div variants={fade} className="pt-4">
          <Link
            to="/contact"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Get in touch →
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
