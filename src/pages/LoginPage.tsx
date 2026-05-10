import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";


const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("is_admin", String(data.user.is_admin));
      // Redirect to home after successful login
      navigate("/");
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
          Welcome back
        </h1>
        <p className="text-muted-foreground mt-2 text-[0.9375rem] leading-relaxed max-w-[20rem]">
          Sign in to continue to RentX and manage your rentals.
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
          <h1 className="font-heading text-xl font-semibold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form flex flex-col">
          <motion.div variants={container} initial="hidden" animate="show" className="auth-form-fields">
            {resetSuccess && (
              <motion.div variants={item} className="flex items-center gap-2 bg-green-500/10 text-green-600 text-sm p-3 rounded-md mb-4 text-center justify-center">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Password updated successfully! Sign in with your new password.
              </motion.div>
            )}
            {error && (
              <motion.div variants={item} className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 text-center">
                {error}
              </motion.div>
            )}

            <motion.div variants={item} className="auth-input-group">
              <label htmlFor="login-email" className="auth-label">
                Email
              </label>
              <div className="relative">
                <Mail className="auth-input-icon" strokeWidth={1.75} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="auth-input has-icon"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={item} className="auth-input-group">
              <label htmlFor="login-password" className="auth-label">
                Password
              </label>
              <div className="relative">
                <Lock className="auth-input-icon" strokeWidth={1.75} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="auth-input has-icon has-toggle"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
            </motion.div>
          </motion.div>

          <motion.div
            variants={item}
            className="flex items-center justify-between gap-4 auth-form-actions"
            initial="hidden"
            animate="show"
          >
            <label className="auth-checkbox-wrap">
              <input type="checkbox" className="auth-checkbox" defaultChecked />
              <span className="auth-checkbox-label">Remember me</span>
            </label>
            <Link to="/forgot-password" data-testid="forgot-password-link" className="auth-link text-[0.8125rem]">
              Forgot password?
            </Link>
          </motion.div>

          <motion.div variants={item} initial="hidden" animate="show" className="auth-form-submit">
            <button type="submit" className="auth-btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </motion.div>
        </form>

        <p className="auth-form-footer text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="auth-link">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
