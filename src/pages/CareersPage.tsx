import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Eye, Award } from "lucide-react";

const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const values = [
  { icon: Heart, text: "Customer-first—every decision starts with the traveler." },
  { icon: Eye, text: "Transparency—clear pricing and honest communication." },
  { icon: Award, text: "Quality—verified vehicles and reliable partners." },
];

export default function CareersPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
      <motion.div
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.06 }}
        className="space-y-16"
      >
        <header className="space-y-4">
          <motion.p variants={fade} className="text-xs font-medium uppercase tracking-wider text-primary">
            Careers
          </motion.p>
          <motion.h1 variants={fade} className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tight">
            Join the team
          </motion.h1>
          <motion.p variants={fade} className="text-muted-foreground leading-relaxed">
            We're building the best way to rent a vehicle in Sri Lanka. If you're driven, thoughtful, and care about travel and tech, we'd like to hear from you.
          </motion.p>
        </header>

        <motion.section
          variants={fade}
          className="rounded-2xl overflow-hidden border border-border aspect-[16/9] max-h-[280px] sm:max-h-[340px]"
        >
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
            alt="Team collaboration"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        </motion.section>

        <section className="space-y-6">
          <motion.h2 variants={fade} className="text-lg font-heading font-semibold text-foreground">
            What we care about
          </motion.h2>
          <ul className="space-y-4">
            {values.map((item, i) => (
              <motion.li
                key={i}
                variants={fade}
                whileHover={{ x: 6 }}
                className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 hover:border-primary/20 transition-colors cursor-default group"
              >
                <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </span>
                <span className="text-muted-foreground pt-1.5">{item.text}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        <motion.section variants={fade} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80",
            "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80",
          ].map((src, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="rounded-xl overflow-hidden border border-border aspect-square"
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </motion.section>

        <motion.section variants={fade} className="pt-4 border-t border-border">
          <p className="text-muted-foreground text-sm mb-6">
            We don't have open roles listed right now. Send us your CV and a short note—we'll keep you in mind when something fits.
          </p>
          <motion.div whileHover={{ x: 4 }}>
            <Link
              to="/contact"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              Get in touch →
            </Link>
          </motion.div>
        </motion.section>

        <motion.p variants={fade} className="text-sm text-muted-foreground">
          <Link to="/about" className="text-primary hover:underline">
            About RentX
          </Link>
          {" · "}
          <Link to="/contact" className="text-primary hover:underline">
            Contact
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
