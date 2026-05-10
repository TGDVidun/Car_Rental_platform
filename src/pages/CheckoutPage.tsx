import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    CreditCard, 
    Lock, 
    ShieldCheck, 
    ChevronLeft, 
    CheckCircle2, 
    Calendar,
    ArrowRight,
    Loader2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Booking {
    id: number;
    total_price: number;
    status: string;
    start_date: string;
    end_date: string;
    with_driver: boolean;
    vehicle?: {
        name: string;
        image_url: string;
        type: string;
        price_per_day: number;
        owner?: {
            email: string;
            full_name?: string;
            phone_number?: string;
        };
    };
}

export default function CheckoutPage() {
    const { bookingId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    
    const isSuccess = searchParams.get("success") === "true";
    const isCanceled = searchParams.get("canceled") === "true";

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://127.0.0.1:8000/user/bookings`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const allBookings = await response.json();
                    const currentBooking = allBookings.find((b: any) => b.id === parseInt(bookingId!));
                    if (currentBooking) {
                        setBooking(currentBooking);
                        
                        // If we are on the success page but the status is still confirmed, 
                        // manually trigger the pay endpoint to sync (useful for local testing without webhooks)
                        if (isSuccess && currentBooking.status === "confirmed") {
                            console.log("Syncing payment status with backend...");
                            await fetch(`http://127.0.0.1:8000/bookings/${bookingId}/pay`, {
                                method: "POST",
                                headers: { "Authorization": `Bearer ${token}` }
                            });
                            // Refresh booking data
                            const updatedResponse = await fetch(`http://127.0.0.1:8000/user/bookings`, {
                                headers: { "Authorization": `Bearer ${token}` }
                            });
                            const updatedBookings = await updatedResponse.json();
                            const updatedBooking = updatedBookings.find((b: any) => b.id === parseInt(bookingId!));
                            if (updatedBooking) setBooking(updatedBooking);
                        }
                    } else {
                        navigate("/my-bookings");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch booking", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();

        if (isCanceled) {
            toast({
                title: "Payment Canceled",
                description: "You have canceled the payment process.",
                variant: "destructive"
            });
        }
    }, [bookingId, navigate, isCanceled, isSuccess]);

    const handleStripeCheckout = async () => {
        setProcessing(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/create-checkout-session/${bookingId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            console.log("Create checkout session status:", response.status);

            if (response.ok) {
                const { url } = await response.json();
                // Redirect to Stripe's hosted checkout page
                window.location.href = url;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to initiate Stripe checkout.");
            }
        } catch (error: any) {
            toast({
                title: "Checkout Error",
                description: error.message,
                variant: "destructive"
            });
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    if (isSuccess || booking?.status === "paid") return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center"
            >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black text-foreground mb-2">Payment Successful!</h1>
                <p className="text-muted-foreground font-medium mb-8">
                    Your rental for {booking?.vehicle?.name} is confirmed.
                </p>

                {booking?.vehicle?.owner && (
                    <div className="bg-primary/5 rounded-2xl p-6 mb-8 text-left border border-primary/10">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Vehicle Owner Contact</p>
                        <p className="text-lg font-black text-foreground mb-1">{booking.vehicle.owner.full_name || "Owner"}</p>
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] shadow-sm text-primary">P</span>
                                {booking.vehicle.owner.phone_number || "No phone provided"}
                            </p>
                            <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] shadow-sm text-primary">E</span>
                                {booking.vehicle.owner.email}
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-[#F8F9FA] rounded-2xl p-6 mb-8 text-left space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-bold">Transaction Status</span>
                        <span className="text-green-600 font-black">PAID</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-bold">Booking ID</span>
                        <span className="font-black text-foreground uppercase">#{bookingId}</span>
                    </div>
                </div>
                
                <Link 
                    to="/my-bookings" 
                    className="block w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                    VIEW MY BOOKINGS
                </Link>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-24">
            <div className="max-w-4xl mx-auto px-4 pt-12">
                <Link to="/my-bookings" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8">
                    <ChevronLeft className="w-4 h-4" /> Cancel and Return
                </Link>

                <div className="bg-white rounded-[3rem] border border-[#E9ECEF] shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Summary Section */}
                        <div className="p-12 bg-[#F8F9FA] border-r border-[#E9ECEF]">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-foreground tracking-tight">Checkout</h2>
                                    <p className="text-muted-foreground font-medium text-sm">Review your booking details.</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-[#E9ECEF] shadow-sm shrink-0">
                                        <img src={booking?.vehicle?.image_url} alt="Vehicle" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">{booking?.vehicle?.type}</p>
                                        <p className="text-lg font-black text-foreground">{booking?.vehicle?.name}</p>
                                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {new Date(booking?.start_date!).toLocaleDateString()} - {new Date(booking?.end_date!).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-[#E9ECEF]">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-bold">Rental Total</span>
                                        <span className="font-black text-foreground">{formatCurrency(booking?.total_price || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-bold">Platform Fee</span>
                                        <span className="font-black text-green-600">FREE</span>
                                    </div>
                                    <div className="pt-6 border-t border-[#E9ECEF] flex justify-between items-end">
                                        <p className="text-sm font-black text-foreground">Total Amount</p>
                                        <p className="text-4xl font-black text-primary tracking-tighter">{formatCurrency(booking?.total_price || 0)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="p-12 flex flex-col justify-center bg-white">
                            <div className="text-center mb-10">
                                <div className="inline-flex p-4 rounded-full bg-blue-50 text-blue-600 mb-6">
                                    <ShieldCheck className="w-12 h-12" />
                                </div>
                                <h3 className="text-xl font-black text-foreground mb-2">Secure Stripe Payment</h3>
                                <p className="text-muted-foreground text-sm font-medium">You will be redirected to Stripe's secure payment page to complete your transaction.</p>
                            </div>

                            <button 
                                onClick={handleStripeCheckout}
                                disabled={processing}
                                className="group relative w-full py-6 rounded-[2rem] bg-primary text-primary-foreground font-black text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <AnimatePresence mode="wait">
                                    {processing ? (
                                        <motion.div 
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            SECURELY CONNECTING...
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            key="ready"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            PROCEED TO PAYMENT <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            </button>

                            <div className="mt-10 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-3 opacity-40">
                                    <div className="w-8 h-5 bg-black rounded text-[6px] font-bold text-white flex items-center justify-center">VISA</div>
                                    <div className="w-8 h-5 bg-black rounded text-[6px] font-bold text-white flex items-center justify-center">MC</div>
                                    <div className="w-8 h-5 bg-black rounded text-[6px] font-bold text-white flex items-center justify-center">AMEX</div>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> Encrypted by Stripe
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
