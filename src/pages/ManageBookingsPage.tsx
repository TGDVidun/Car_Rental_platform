import { useEffect, useState } from "react";
import {
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Calendar,
    AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Booking {
    id: number;
    user_id: number;
    vehicle_id: number;
    start_date: string;
    end_date: string;
    total_price: number;
    status: string;
    with_driver: boolean;
    vehicle?: {
        name: string;
    };
    user?: {
        email: string;
        full_name?: string;
        phone_number?: string;
    };
}

export default function ManageBookingsPage() {
    const { toast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:8000/owner/bookings", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBookings(data);
            }
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/bookings/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                toast({
                    title: `Booking ${status}`,
                    description: `The request has been ${status} successfully.`,
                });
                fetchBookings();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update booking status.",
                variant: "destructive"
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
            case "paid":
                return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Payment Received</span>;
            case "cancelled":
                return <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Cancelled</span>;
            case "rejected":
                return <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Rejected</span>;
            case "pending":
            default:
                return <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending Approval</span>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Manage Bookings</h1>
                <p className="text-muted-foreground">Approve or decline rental requests from your customers.</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-muted-foreground">Loading bookings...</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-[#E9ECEF] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No bookings found</h3>
                    <p className="text-muted-foreground text-sm">When customers book your cars, they will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {bookings.map((booking) => (
                            <motion.div
                                key={booking.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="p-6 rounded-2xl bg-white border border-[#E9ECEF] shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="w-16 h-16 rounded-xl bg-[#F8F9FA] flex items-center justify-center border border-[#E9ECEF]">
                                        <Calendar className="w-8 h-8 text-primary/40" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-foreground">
                                                {booking.vehicle?.name || `Reservation #${booking.id}`}
                                            </h3>
                                            {getStatusBadge(booking.status)}
                                        </div>
                                        {booking.vehicle && (
                                            <p className="text-xs font-semibold text-primary/70 -mt-1 mb-1">
                                                Order ID: #{booking.id}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                                                <User className="w-3.5 h-3.5" /> 
                                                {booking.user?.full_name || booking.user?.email || `Customer #${booking.user_id}`}
                                            </div>
                                            {booking.user?.phone_number && (
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    {booking.user.phone_number}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                                                <Clock className="w-3.5 h-3.5" /> {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                            </div>
                                            {booking.with_driver && (
                                                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">With Driver</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full md:w-auto md:gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">Total Earnings</p>
                                        <p className="text-xl font-black text-foreground">{formatCurrency(booking.total_price)}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {booking.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                                                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, "rejected")}
                                                    className="px-6 py-2.5 rounded-xl bg-[#F8F9FA] text-rose-600 text-sm font-bold border border-rose-100 hover:bg-rose-50 transition-all"
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

        </div>
    );
}
