import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    AlertCircle,
    CreditCard,
    Car,
    Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import SafetyLogModal from "@/components/SafetyLogModal";

interface Vehicle {
    id: number;
    name: string;
    type: string;
    image_url: string;
    owner?: {
        email: string;
        full_name?: string;
        phone_number?: string;
    };
}

interface Booking {
    id: number;
    vehicle_id: number;
    start_date: string;
    end_date: string;
    total_price: number;
    status: string;
    with_driver: boolean;
    vehicle: Vehicle | null;
}

export default function MyBookingsPage() {
    const { toast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSafetyLogBookingId, setActiveSafetyLogBookingId] = useState<number | null>(null);

    const fetchBookings = async () => {
        try {
            setError(null);
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }
            console.log("Fetching user bookings...");
            const response = await fetch("http://127.0.0.1:8000/user/bookings", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Bookings loaded:", data.length);
                // Sort bookings so newest start dates are first (or ID desc)
                data.sort((a: Booking, b: Booking) => b.id - a.id);
                setBookings(data);
            } else {
                const errBody = await response.text();
                console.error("API error:", response.status, errBody);
                setError(`Failed to load bookings (${response.status})`);
                toast({
                    title: "Error Loading Bookings",
                    description: `Server returned status ${response.status}. Please try again.`,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Failed to fetch user bookings", error);
            setError("Could not connect to the server.");
            toast({
                title: "Connection Error",
                description: "Could not connect to the server. Please check your connection.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);



    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Approved by Owner</span>;
            case "paid":
                return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Payment Received</span>;
            case "picked":
                return <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><Car className="w-3 h-3" /> Vehicle Picked Up</span>;
            case "received":
                return <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
            case "cancelled":
                return <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Cancelled</span>;
            case "pending":
            default:
                return <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending Approval</span>;
        }
    };

    if (!localStorage.getItem("token")) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold mb-4">Please log in to view your bookings</h1>
                <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-24 min-h-[calc(100vh-80px)]">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-foreground mb-2">My Bookings</h1>
                    <p className="text-muted-foreground">Keep track of your rental requests and complete payments for approved vehicles.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm font-semibold text-muted-foreground">Loading your trips...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-24 bg-card rounded-3xl border border-dashed border-red-200 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                            <AlertCircle className="w-10 h-10 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Something went wrong</h3>
                        <p className="text-muted-foreground mb-2 max-w-sm">{error}</p>
                        <button onClick={() => { setLoading(true); fetchBookings(); }} className="mt-4 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                            Try Again
                        </button>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-24 bg-card rounded-3xl border border-dashed border-border/60 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                            <AlertCircle className="w-10 h-10 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No bookings yet</h3>
                        <p className="text-muted-foreground mb-8 max-w-sm">Ready for your next adventure? Browse our collection and find the perfect car for your trip.</p>
                        <Link to="/search" className="px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                            Browse Vehicles
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence>
                            {bookings.map((booking) => (
                                <motion.div
                                    key={booking.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
                                >
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-secondary overflow-hidden shrink-0 border border-border flex items-center justify-center">
                                            {booking.vehicle?.image_url ? (
                                                <img src={booking.vehicle.image_url} alt={booking.vehicle.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Car className="w-10 h-10 text-muted-foreground opacity-40" />
                                            )}
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                                <h3 className="text-lg md:text-xl font-bold text-foreground">
                                                    {booking.vehicle?.name || `Vehicle #${booking.vehicle_id}`}
                                                </h3>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 mt-2">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4 text-primary" /> 
                                                    <span className="font-medium text-foreground">
                                                        {new Date(booking.start_date).toLocaleDateString()}
                                                    </span>
                                                    <span className="mx-1 text-muted-foreground/50">→</span>
                                                    <span className="font-medium text-foreground">
                                                        {new Date(booking.end_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {booking.with_driver && (
                                                    <span className="text-[11px] font-bold bg-secondary text-foreground px-2.5 py-1 rounded-md uppercase tracking-wide border border-border/50">With Driver</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto md:w-64 gap-4 border-t border-border md:border-0 pt-4 md:pt-0">
                                        <div className="text-left md:text-right">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Amount</p>
                                            <p className="text-2xl font-black text-foreground">{formatCurrency(booking.total_price)}</p>
                                        </div>

                                        <div className="shrink-0 w-full md:w-auto flex flex-col gap-2">
                                            {booking.status === "confirmed" ? (
                                                <Link
                                                    to={`/checkout/${booking.id}`}
                                                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                    Make Payment
                                                </Link>
                                            ) : (booking.status === "paid" || booking.status === "picked" || booking.status === "received") ? (
                                                <div className="flex flex-col gap-3 w-full">
                                                    <div className="px-4 py-2.5 rounded-xl bg-green-500/10 text-green-600 text-sm font-black text-center border border-green-500/20 shadow-sm flex items-center justify-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4" /> 
                                                        {booking.status === "paid" ? "Payment Received" : booking.status === "picked" ? "In Progress" : "Completed"}
                                                    </div>
                                                    
                                                    {booking.status !== "received" && (
                                                        <button
                                                            onClick={() => setActiveSafetyLogBookingId(booking.id)}
                                                            className="px-4 py-2.5 bg-secondary hover:bg-primary/10 text-primary transition-all text-sm font-bold rounded-xl border border-primary/20 flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02]"
                                                        >
                                                            <Camera className="w-4 h-4" /> Submit Safety Check
                                                        </button>
                                                    )}
                                                    
                                                    {booking.vehicle?.owner && (
                                                        <div className="mt-2 p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3 text-left">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Owner Contact</p>
                                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-black text-foreground leading-none">{booking.vehicle.owner.full_name || "Vehicle Owner"}</p>
                                                                <div className="space-y-1.5 pt-1">
                                                                    <a href={`tel:${booking.vehicle.owner.phone_number}`} className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                                                        <span className="w-6 h-6 rounded-lg bg-white border border-primary/10 flex items-center justify-center text-[10px] shadow-sm text-primary font-bold">P</span>
                                                                        {booking.vehicle.owner.phone_number || "No phone provided"}
                                                                    </a>
                                                                    <a href={`mailto:${booking.vehicle.owner.email}`} className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                                                        <span className="w-6 h-6 rounded-lg bg-white border border-primary/10 flex items-center justify-center text-[10px] shadow-sm text-primary font-bold">E</span>
                                                                        {booking.vehicle.owner.email}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : booking.status === "pending" ? (
                                                <div className="px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-sm font-medium text-center border border-border/50 w-full min-w-[140px]">
                                                    Awaiting Approval
                                                </div>
                                            ) : (
                                                <div className="px-4 py-2 rounded-lg bg-red-500/10 text-red-600 text-sm font-bold text-center w-full min-w-[140px]">
                                                    Booking Cancelled
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <SafetyLogModal
                bookingId={activeSafetyLogBookingId!}
                isOpen={activeSafetyLogBookingId !== null}
                onClose={() => setActiveSafetyLogBookingId(null)}
                onSuccess={() => fetchBookings()}
            />
        </div>
    );
}
