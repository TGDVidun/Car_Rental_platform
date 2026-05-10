import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

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

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("http://127.0.0.1:8000/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Request failed");
            }

            setIsSubmitted(true);
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
                <Link to="/" className="inline-block mb-6">
                    <span className="font-heading text-4xl font-bold text-foreground tracking-tight">
                        Rent<span className="text-primary">X</span>
                    </span>
                </Link>
                <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">
                    Forgot password?
                </h1>
                <p className="text-muted-foreground mt-2 text-[0.9375rem] leading-relaxed max-w-[20rem]">
                    Enter your email address and we'll send you instructions to reset your password.
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
                    <h1 className="font-heading text-xl font-semibold text-foreground">Forgot password?</h1>
                    <p className="text-muted-foreground text-sm mt-1">Reset your account access</p>
                </div>

                {isSubmitted ? (
                    <motion.div
                        className="text-center bg-card p-8 rounded-2xl border border-border/50 shadow-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold mb-3">Check your email</h2>
                        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                            We've sent a password reset link to your email. Check your <strong>inbox</strong> (and spam folder) and click the link to set a new password.
                        </p>
                        <Link to="/login" className="auth-btn-primary w-full inline-flex items-center justify-center">
                            Back to sign in
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} className="auth-form flex flex-col">
                            <motion.div variants={container} initial="hidden" animate="show" className="auth-form-fields">
                                {error && (
                                    <motion.div variants={item} className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 text-center">
                                        {error}
                                    </motion.div>
                                )}

                                <motion.div variants={item} className="auth-input-group">
                                    <label htmlFor="reset-email" className="auth-label">
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <Mail className="auth-input-icon" strokeWidth={1.75} />
                                        <input
                                            id="reset-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="auth-input has-icon"
                                            required
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={item} className="auth-form-submit mt-4">
                                    <button type="submit" className="auth-btn-primary w-full" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                                Sending link...
                                            </>
                                        ) : (
                                            "Send reset link"
                                        )}
                                    </button>
                                </motion.div>
                            </motion.div>
                        </form>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 text-center"
                        >
                            <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to sign in
                            </Link>
                        </motion.div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
