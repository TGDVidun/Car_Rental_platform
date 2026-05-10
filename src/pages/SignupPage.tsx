import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function getPasswordStrength(password: string): { score: number; level: "weak" | "medium" | "strong" } {
  if (!password.length) return { score: 0, level: "weak" };
  let score = 0;
  if (password.length >= 6) score += 25;
  if (password.length >= 8) score += 15;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
  if (/\d/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  score = Math.min(100, score);
  const level = score <= 33 ? "weak" : score <= 66 ? "medium" : "strong";
  return { score, level };
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: `${firstName} ${lastName}`.trim() || undefined,
          phone_number: phoneNumber || undefined
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Signup failed");
      }

      // Auto-login after successful signup
      const loginRes = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });

      setSuccess(true);

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        localStorage.setItem("token", loginData.access_token);
        setTimeout(() => navigate("/"), 1500);
      } else {
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err: any) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("Cannot connect to backend server. Make sure it is running on http://127.0.0.1:8000");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="auth-page">
      <div className="auth-page-bg" aria-hidden />

      {/* Brand panel — visible on desktop */}
      <motion.div
        className="auth-panel-brand"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="font-heading text-4xl font-bold text-foreground tracking-tight mb-6 block">
          Rent<span className="text-primary">X</span>
        </span>
        <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">
          Create account
        </h1>
        <p className="text-muted-foreground mt-2 text-[0.9375rem] leading-relaxed max-w-[20rem]">
          Join RentX to browse vehicles and start renting in minutes.
        </p>
      </motion.div>

      {/* Form panel */}
      <motion.div
        className="w-full max-w-[22rem]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        {/* Mobile header */}
        <div className="lg:hidden text-center mb-8">
          <span className="font-heading text-3xl font-bold text-foreground tracking-tight block mb-4">
            Rent<span className="text-primary">X</span>
          </span>
          <h1 className="font-heading text-xl font-semibold text-foreground">Create account</h1>
          <p className="text-muted-foreground text-sm mt-1">Start your journey with RentX</p>
        </div>

        {success ? (
          <motion.div
            className="text-center bg-card p-8 rounded-2xl border border-border/50 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-3">Account Created!</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Welcome to RentX, {firstName || email.split("@")[0]}! Signing you in...
            </p>
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </motion.div>
        ) : (
          <>
            <form onSubmit={handleSignup} className="auth-form flex flex-col">
              <motion.div variants={container} initial="hidden" animate="show" className="auth-form-fields">
                {error && (
                  <motion.div variants={item} className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 text-center">
                    {error}
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <motion.div variants={item} className="auth-input-group">
                    <label htmlFor="signup-first" className="auth-label">First name</label>
                    <div className="relative">
                      <User className="auth-input-icon" strokeWidth={1.75} />
                      <input
                        id="signup-first"
                        type="text"
                        placeholder="John"
                        autoComplete="given-name"
                        className="auth-input has-icon"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                  </motion.div>
                  <motion.div variants={item} className="auth-input-group">
                    <label htmlFor="signup-last" className="auth-label">Last name</label>
                    <input
                      id="signup-last"
                      type="text"
                      placeholder="Doe"
                      autoComplete="family-name"
                      className="auth-input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </motion.div>
                </div>

                <motion.div variants={item} className="auth-input-group">
                  <label htmlFor="signup-email" className="auth-label">Email</label>
                  <div className="relative">
                    <Mail className="auth-input-icon" strokeWidth={1.75} />
                    <input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="auth-input has-icon"
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div variants={item} className="auth-input-group">
                  <label htmlFor="signup-phone" className="auth-label">Phone Number</label>
                  <div className="relative">
                    <input
                      id="signup-phone"
                      type="tel"
                      placeholder="07X XXX XXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="auth-input"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={item} className="auth-input-group">
                  <label htmlFor="signup-password" className="auth-label">Password</label>
                  <div className="relative">
                    <Lock className="auth-input-icon" strokeWidth={1.75} />
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="auth-input has-icon has-toggle"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={0}
                    >
                      {showPassword ? (
                        <EyeOff className="w-[1.125rem] h-[1.125rem]" strokeWidth={1.75} />
                      ) : (
                        <Eye className="w-[1.125rem] h-[1.125rem]" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="auth-password-strength">
                      <div className="auth-password-strength-bar" role="progressbar" aria-valuenow={strength.score} aria-valuemin={0} aria-valuemax={100} aria-label="Password strength">
                        <div className={`auth-password-strength-fill ${strength.level}`} style={{ width: `${strength.score}%` }} />
                      </div>
                      <p className={`auth-password-strength-label ${strength.level}`}>
                        {strength.level === "weak" && "Weak"}
                        {strength.level === "medium" && "Medium"}
                        {strength.level === "strong" && "Strong"}
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>

              <motion.div
                variants={item}
                className="auth-form-actions flex items-start gap-3"
                initial="hidden"
                animate="show"
              >
                <label className="auth-checkbox-wrap flex-1">
                  <input type="checkbox" className="auth-checkbox mt-0.5" required />
                  <span className="auth-checkbox-label">
                    I agree to the{" "}
                    <Link to="/terms" className="auth-link inline">Terms of Service</Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="auth-link inline">Privacy Policy</Link>
                  </span>
                </label>
              </motion.div>

              <motion.div variants={item} initial="hidden" animate="show" className="auth-form-submit">
                <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </motion.div>
            </form>

            <p className="auth-form-footer text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
