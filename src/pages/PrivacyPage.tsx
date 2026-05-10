import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const sections = [
  { title: "1. Information We Collect", body: "We collect personal information you provide during registration (name, email, phone), payment details, driver's license information, and usage data including search history and booking patterns." },
  { title: "2. How We Use Your Data", body: "Your data is used to process bookings, communicate about reservations, improve our services, send promotional offers (with your consent), and comply with legal obligations." },
  { title: "3. Data Sharing", body: "We share necessary information with vehicle owners to facilitate rentals, payment processors for transactions, and law enforcement when legally required. We never sell your personal data." },
  { title: "4. Data Security", body: "We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information." },
  { title: "5. Cookies", body: "We use cookies and similar technologies to improve your browsing experience, analyze traffic, and personalize content. You can manage cookie preferences in your browser settings." },
  { title: "6. Your Rights", body: "You have the right to access, correct, or delete your personal data. You can also opt out of marketing communications at any time through your account settings." },
  { title: "7. Contact", body: "For privacy-related inquiries, contact our Data Protection Officer at privacy@rentx.lk or write to us at 42 Galle Road, Colombo 03, Sri Lanka." },
];

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
      <motion.div
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.05 }}
        className="space-y-10"
      >
        <header className="space-y-2">
          <motion.p variants={fade} className="text-xs font-medium uppercase tracking-wider text-primary">
            Legal
          </motion.p>
          <motion.h1 variants={fade} className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tight">
            Privacy Policy
          </motion.h1>
          <motion.p variants={fade} className="text-sm text-muted-foreground">
            Last updated: February 2026
          </motion.p>
        </header>

        <div className="space-y-8">
          {sections.map((section) => (
            <motion.section
              key={section.title}
              variants={fade}
              className="pb-8 border-b border-border last:border-0 last:pb-0"
            >
              <h2 className="text-lg font-heading font-semibold text-foreground mb-2">
                {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {section.body}
              </p>
            </motion.section>
          ))}
        </div>

        <motion.div variants={fade} className="pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link to="/contact" className="text-primary hover:underline">Contact us</Link>
          <span>·</span>
          <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
          <span>·</span>
          <Link to="/help" className="text-primary hover:underline">Help & FAQ</Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
