import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Menu, X, Sun, Moon,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { vehicles } from "@/data/vehicles";
import { formatCurrency } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Browse" },
  { to: "/map", label: "Map" },
  { to: "/help", label: "Help" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { isDark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return vehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.province.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const hasQuery = query.trim().length > 0;
  const showDropdown = searchOpen && hasQuery;

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav transition-theme">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-heading font-bold text-lg text-foreground">
            Rent<span className="gradient-text">X</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Search with dropdown */}
          <div ref={searchRef} className="hidden sm:block relative flex-1 min-w-0 max-w-[12rem] sm:max-w-[14rem] md:max-w-[16rem]">
            <div className="flex items-center gap-3 h-10 px-4 rounded-xl border border-border bg-card/50 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 focus-within:bg-card transition-all duration-200">
              <Search className="w-4 h-4 shrink-0 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search vehicles..."
                className="flex-1 min-w-0 bg-transparent text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                aria-label="Search vehicles"
              />
            </div>
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-border bg-card shadow-xl z-[100] overflow-hidden max-h-[min(18rem,65vh)] overflow-y-auto"
                >
                  {searchResults.length === 0 ? (
                    <p className="px-3 py-4 text-xs text-muted-foreground text-center">No vehicles found</p>
                  ) : (
                    <ul className="py-1">
                      {searchResults.map((v) => (
                        <li key={v.id}>
                          <Link
                            to={`/vehicle/${v.id}`}
                            onClick={() => { setSearchOpen(false); setQuery(""); }}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-secondary/80 transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-md bg-muted shrink-0 overflow-hidden flex items-center justify-center">
                              <img
                                src={v.images[0] || "/placeholder.svg"}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">{v.name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{v.location}</p>
                            </div>
                            <span className="text-xs font-medium text-primary shrink-0">{formatCurrency(v.pricePerDay)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="flex items-center justify-center h-10 w-10 rounded-xl border border-border bg-card/50 text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border transition-colors shrink-0"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Auth */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {localStorage.getItem("token") ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/my-bookings"
                  className="hidden md:inline-flex items-center justify-center h-10 px-4 rounded-xl text-sm font-bold bg-secondary text-foreground hover:bg-secondary/80 transition-all border border-border"
                >
                  My Bookings
                </Link>
                <Link
                  to="/admin"
                  className="hidden md:inline-flex items-center justify-center h-10 px-4 rounded-xl text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20"
                >
                  Admin Dashboard
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/";
                  }}
                  className="inline-flex items-center justify-center h-10 min-w-[5rem] px-4 rounded-xl text-sm font-medium text-foreground border border-border bg-card/50 hover:bg-secondary hover:border-border transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center h-10 min-w-[5rem] px-4 rounded-xl text-sm font-medium text-foreground border border-border bg-card/50 hover:bg-secondary hover:border-border transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center h-10 min-w-[5.5rem] px-4 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-sm hover:opacity-90 hover:shadow active:scale-[0.98] transition-all"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary text-muted-foreground"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden glass border-t border-border"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-2">
                {localStorage.getItem("token") ? (
                  <>
                    <Link to="/my-bookings" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-4 py-2 rounded-lg border border-border text-sm font-medium">My Bookings</Link>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/";
                      }}
                      className="flex-1 text-center px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-4 py-2 rounded-lg border border-border text-sm font-medium">Log in</Link>
                    <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">Sign up</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
