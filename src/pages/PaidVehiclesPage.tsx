import { useEffect, useState } from "react";
import {
    CheckCircle2,
    Calendar,
    AlertCircle,
    User,
    Mail,
    Phone,
    Car
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import SafetyHistoryModal from "@/components/SafetyHistoryModal";

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
        image_url?: string;
    };
    user?: {
        email: string;
        full_name?: string;
        phone_number?: string;
    };
}

export default function PaidVehiclesPage() {
    const { toast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeHistoryBookingId, setActiveHistoryBookingId] = useState<number | null>(null);

    const fetchPaidBookings = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:8000/owner/bookings", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Filter for 'paid', 'picked', and 'received' statuses
                const activeStatuses = ["paid", "picked", "received"];
                const activeOnes = data.filter((b: Booking) => activeStatuses.includes(b.status));
                setBookings(activeOnes);
            }
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaidBookings();
    }, []);

    const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/bookings/${bookingId}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                toast({
                    title: "Status Updated",
                    description: `Booking successfully marked as ${newStatus}.`,
                });
                fetchPaidBookings();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update status",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Paid & Finalized Bookings</h1>
                <p className="text-muted-foreground">Detailed overview of completed payments and customer information.</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-muted-foreground">Loading paid trips...</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-[#E9ECEF] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No paid bookings found</h3>
                    <p className="text-muted-foreground text-sm">Once customers complete their payments, they will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {bookings.map((booking) => (
                            <motion.div
                                key={booking.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col"
                            >
                                <div className="p-5 border-b border-border flex items-center justify-between bg-green-50/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{booking.vehicle?.name}</p>
                                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Payment Received</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">Revenue</p>
                                        <p className="text-lg font-black text-foreground">{formatCurrency(booking.total_price)}</p>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Trip Details */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span>Trip Dates:</span>
                                        </div>
                                        <span className="font-bold text-foreground">
                                            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Customer Info Card */}
                                    <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                                        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                            <User className="w-3 h-3" /> Customer Information
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-xs font-bold text-primary">
                                                    {booking.user?.full_name?.charAt(0) || "U"}
                                                </div>
                                                <p className="text-sm font-bold text-foreground">
                                                    {booking.user?.full_name || "Valued Customer"}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 pl-11">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Mail className="w-3.5 h-3.5 text-primary/60" />
                                                    {booking.user?.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                    <Phone className="w-3.5 h-3.5 text-primary/60" />
                                                    {booking.user?.phone_number || "No contact provided"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 pt-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {booking.with_driver && (
                                                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-tighter">Driver Included</span>
                                                )}
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                                                    booking.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'picked' ? 'bg-indigo-100 text-indigo-700' :
                                                    'bg-teal-100 text-teal-700'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-bold">Booking ID: #{booking.id}</p>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2 border-t border-border pt-4">
                                            {booking.status === "paid" && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, "picked")}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    MARK AS PICKED
                                                </button>
                                            )}
                                            {booking.status === "picked" && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, "received")}
                                                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-black shadow-lg shadow-teal-600/20 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    MARK AS RECEIVED
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setActiveHistoryBookingId(booking.id)}
                                                className="px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-black hover:bg-primary/10 transition-all border border-primary/20"
                                            >
                                                VIEW SAFETY LOGS
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <SafetyHistoryModal
                bookingId={activeHistoryBookingId}
                onClose={() => setActiveHistoryBookingId(null)}
            />
        </div>
    );
}
