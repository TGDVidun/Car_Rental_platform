import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const sections = [
  { title: "1. Acceptance of Terms", body: "By accessing or using RentX's services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform." },
  { title: "2. Eligibility", body: "You must be at least 21 years old with a valid driver's license to rent a vehicle. Additional age restrictions may apply for certain vehicle categories." },
  { title: "3. Rental Agreement", body: "Each rental is subject to a separate rental agreement. You are responsible for the vehicle during the rental period and must return it in the same condition." },
  { title: "4. Payment & Fees", body: "All prices are listed in LKR (Sri Lankan Rupees). A security deposit may be required. Late returns incur additional charges at the daily rate." },
  { title: "5. Cancellation Policy", body: "Free cancellation is available up to 24 hours before pick-up. Cancellations within 24 hours may be subject to a fee of up to 50% of the rental cost." },
  { title: "6. Liability", body: "RentX acts as a marketplace connecting renters with vehicle owners. We are not liable for accidents, damages, or losses during the rental period beyond the included insurance coverage." },
  { title: "7. Modifications", body: "We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms." },
];

export default function TermsPage() {
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
            Terms of Service
          </motion.h1>
          <motion.p variants={fade} className="text-sm text-muted-foreground">
            Last updated: February 2026
          </motion.p>
        </header>

        <div className="space-y-8">
          {sections.map((section, i) => (
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
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          <span>·</span>
          <Link to="/help" className="text-primary hover:underline">Help & FAQ</Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
