import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="not-found-page">
      <div className="not-found-bg" aria-hidden />

      <motion.div
        className="not-found-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/" className="not-found-logo font-heading">
          Rent<span className="text-primary">X</span>
        </Link>

        <motion.p
          className="not-found-code font-heading"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          404
        </motion.p>

        <p className="not-found-title">Page not found</p>
        <p className="not-found-desc">
          The link may be broken or the page was removed.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="not-found-actions"
        >
          <Link to="/" className="not-found-btn">
            Back to home
          </Link>
          <Link to="/search" className="not-found-link">
            Browse vehicles
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
