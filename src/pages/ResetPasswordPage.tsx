import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

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

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            setError("Missing or invalid reset token. Please request a new link.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("http://127.0.0.1:8000/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, new_password: password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Reset failed");
            }

            // Success handled via navigation or a more stylish UI
            navigate("/login?reset=success");
        } catch (err: any) {
            setError(err.message);
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
                <Link to="/" className="inline-block mb-6">
                    <span className="font-heading text-4xl font-bold text-foreground tracking-tight">
                        Rent<span className="text-primary">X</span>
                    </span>
                </Link>
                <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">
                    Secure reset
                </h1>
                <p className="text-muted-foreground mt-2 text-[0.9375rem] leading-relaxed max-w-[20rem]">
                    Set a new password for your RentX account to restore access.
                </p>
            </motion.div>

            {/* Main panel */}
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
                    <h1 className="font-heading text-xl font-semibold text-foreground">Reset Password</h1>
                    <p className="text-muted-foreground text-sm mt-1">Choose a new password</p>
                </div>

                {!token ? (
                    <div className="text-center bg-card p-8 rounded-2xl border border-destructive/20 shadow-sm">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-destructive" />
                        </div>
                        <h2 className="text-xl font-semibold mb-3">Invalid Link</h2>
                        <p className="text-muted-foreground text-sm mb-8">
                            This reset link is missing its token or has expired.
                        </p>
                        <Link to="/forgot-password" title="Get new link" className="auth-btn-primary w-full inline-flex items-center justify-center">
                            Request new link
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form flex flex-col">
                        <motion.div variants={container} initial="hidden" animate="show" className="auth-form-fields">
                            {error && (
                                <motion.div variants={item} className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 text-center">
                                    {error}
                                </motion.div>
                            )}

                            <motion.div variants={item} className="auth-input-group">
                                <label htmlFor="new-password" className="auth-label">
                                    New password
                                </label>
                                <div className="relative">
                                    <Lock className="auth-input-icon" strokeWidth={1.75} />
                                    <input
                                        id="new-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="auth-input has-icon has-toggle"
                                        required
                                        minLength={8}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="w-[1.125rem] h-[1.125rem]" /> : <Eye className="w-[1.125rem] h-[1.125rem]" />}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div variants={item} className="auth-input-group">
                                <label htmlFor="confirm-password" className="auth-label">
                                    Confirm new password
                                </label>
                                <div className="relative">
                                    <Lock className="auth-input-icon" strokeWidth={1.75} />
                                    <input
                                        id="confirm-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Repeat your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="auth-input has-icon"
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={item} className="auth-form-submit mt-6">
                                <button type="submit" className="auth-btn-primary w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                            Updating...
                                        </>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <ShieldCheck className="w-4 h-4" /> Reset password
                                        </span>
                                    )}
                                </button>
                            </motion.div>
                        </motion.div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
