import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const contacts = [
  { icon: Mail, label: "Email", value: "hello@rentx.lk", href: "mailto:hello@rentx.lk" },
  { icon: Phone, label: "Phone", value: "+94 11 234 5678", href: "tel:+94112345678" },
  { icon: MapPin, label: "Office", value: "42 Galle Road, Colombo 03", href: null },
];

export default function ContactPage() {
  const { toast } = useToast();

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
      <motion.div
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.06 }}
        className="space-y-12"
      >
        <header className="space-y-4">
          <motion.p variants={fade} className="text-xs font-medium uppercase tracking-wider text-primary">
            Contact
          </motion.p>
          <motion.h1 variants={fade} className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tight">
            Get in touch
          </motion.h1>
          <motion.p variants={fade} className="text-muted-foreground leading-relaxed">
            Have a question or need help with a booking? We're here to help.
          </motion.p>
        </header>

        <motion.section variants={fade} className="rounded-2xl overflow-hidden border border-border aspect-[21/9] max-h-[200px] sm:max-h-[240px]">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
            alt="Colombo city"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        </motion.section>

        <section className="grid sm:grid-cols-3 gap-4">
          {contacts.map(({ icon: Icon, label, value, href }) => (
            <motion.div
              key={label}
              variants={fade}
              whileHover={{ y: -2 }}
              className="group"
            >
              {href ? (
                <a
                  href={href}
                  className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 hover:border-primary/20 transition-colors block"
                >
                  <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </a>
              ) : (
                <div className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 hover:border-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              )}
            </motion.div>
          ))}
        </section>

        <motion.section variants={fade} className="space-y-4">
          <h2 className="text-lg font-heading font-semibold text-foreground">Send a message</h2>
          <form
            className="space-y-4 p-6 rounded-2xl border border-border bg-card"
            onSubmit={(e) => {
              e.preventDefault();
              toast({ title: "Message sent", description: "We'll get back to you soon." });
            }}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
            />
            <textarea
              rows={4}
              placeholder="Message"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-shadow"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" /> Send
            </motion.button>
          </form>
        </motion.section>

        <motion.p variants={fade} className="text-sm text-muted-foreground">
          <Link to="/about" className="text-primary hover:underline">
            About RentX
          </Link>
          {" · "}
          <Link to="/help" className="text-primary hover:underline">
            Help & FAQ
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
