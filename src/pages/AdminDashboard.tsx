import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Car,
    ClipboardCheck,
    Clock,
    TrendingUp,
    CircleDollarSign,
    ArrowUpRight,
    CheckCircle2,
    XCircle,
    User as UserIcon,
    Calendar,
    ShieldCheck,
    AlertTriangle,
    Eye
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Stats {
    total_cars: number;
    total_bookings: number;
    pending_bookings: number;
    confirmed_bookings: number;
    monthly_revenue: number;
}

interface Vehicle {
    id: number;
    name: string;
    type: string;
    location: string;
    price_per_day: number;
    is_approved: boolean;
    is_available: boolean;
    image_url: string;
    owner_id: number;
}

interface User {
    email: string;
}

interface Booking {
    id: number;
    total_price: number;
    status: string;
    start_date: string;
    end_date: string;
    vehicle?: { name: string };
    user?: User;
}

export default function AdminDashboard() {
    const { toast } = useToast();
    const [stats, setStats] = useState<Stats | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "approvals" | "bookings">("overview");
    const isAdmin = localStorage.getItem("is_admin") === "true";

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'paid': return 'bg-blue-100 text-blue-700';
            case 'picked': return 'bg-indigo-100 text-indigo-700';
            case 'received': return 'bg-teal-100 text-teal-700';
            case 'pending': return 'bg-orange-100 text-orange-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { "Authorization": `Bearer ${token}` };

            // Fetch Stats
            const statsUrl = isAdmin ? "http://127.0.0.1:8000/admin/stats" : "http://127.0.0.1:8000/owner/stats";
            const statsRes = await fetch(statsUrl, { headers });
            if (statsRes.ok) setStats(await statsRes.json());

            if (isAdmin) {
                // Fetch All Vehicles for Approval
                const vehiclesRes = await fetch("http://127.0.0.1:8000/admin/vehicles", { headers });
                if (vehiclesRes.ok) setVehicles(await vehiclesRes.json());

                // Fetch All Bookings
                const bookingsRes = await fetch("http://127.0.0.1:8000/admin/bookings", { headers });
                if (bookingsRes.ok) setBookings(await bookingsRes.json());
            }
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id: number, approve: boolean) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/admin/vehicles/${id}/approve`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ is_approved: approve })
            });

            if (response.ok) {
                toast({
                    title: approve ? "Vehicle Approved" : "Approval Revoked",
                    description: `Vehicle status has been updated successfully.`,
                });
                fetchData();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update approval status.",
                variant: "destructive"
            });
        }
    };



    const statCards = [
        { label: "Total Cars", value: stats?.total_cars || 0, icon: Car, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Total Bookings", value: stats?.total_bookings || 0, icon: ClipboardCheck, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Pending", value: stats?.pending_bookings || 0, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
        { label: "Confirmed", value: stats?.confirmed_bookings || 0, icon: ClipboardCheck, color: "text-green-600", bg: "bg-green-50" },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                            {isAdmin ? "Super Admin" : "Owner Panel"}
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        {isAdmin 
                            ? "Manage the entire RentX platform, approve listings, and monitor global activity."
                            : "Monitor your fleet performance, bookings, and revenue."}
                    </p>
                </div>
                
                {isAdmin && (
                    <div className="flex p-1 bg-white border border-[#E9ECEF] rounded-2xl shadow-sm">
                        <button 
                            onClick={() => setActiveTab("overview")}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Overview
                        </button>
                        <button 
                            onClick={() => setActiveTab("approvals")}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'approvals' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Vehicles {vehicles.filter(v => !v.is_approved).length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{vehicles.filter(v => !v.is_approved).length}</span>}
                        </button>
                        <button 
                            onClick={() => setActiveTab("bookings")}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'bookings' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Global Bookings
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                    <motion.div 
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statCards.map((card, i) => (
                                <motion.div
                                    key={card.label}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 rounded-3xl bg-white border border-[#E9ECEF] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                                >
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-2xl ${card.bg}`}>
                                                <card.icon className={`w-6 h-6 ${card.color}`} />
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        </div>
                                        <p className="text-4xl font-black text-foreground mb-1 tracking-tight">
                                            {loading ? "..." : card.value}
                                        </p>
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{card.label}</p>
                                    </div>
                                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <card.icon className="w-24 h-24" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="lg:col-span-1 p-10 rounded-[2.5rem] bg-primary text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/30"
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-8 opacity-80 uppercase tracking-[0.2em] text-[10px] font-black">
                                        <TrendingUp className="w-3.5 h-3.5" /> Platform Revenue
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-5xl font-black tracking-tighter">
                                            {loading ? "..." : formatCurrency(stats?.monthly_revenue || 0)}
                                        </span>
                                    </div>
                                    <p className="text-primary-foreground/70 text-sm font-bold max-w-[15rem] leading-relaxed">
                                        Total accumulated revenue across all confirmed rentals this month.
                                    </p>

                                    <button className="mt-12 flex items-center gap-3 text-xs font-black bg-white text-primary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl">
                                        REVENUE REPORT <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <CircleDollarSign className="absolute -bottom-12 -right-12 w-64 h-64 text-white/10 rotate-12" />
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full" />
                            </motion.div>

                            <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-white border border-[#E9ECEF] shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black tracking-tight">Recent Activity</h3>
                                    <button className="text-xs font-black text-primary hover:underline">VIEW ALL</button>
                                </div>
                                <div className="space-y-4">
                                    {loading ? (
                                        [1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-20 rounded-2xl bg-secondary/30 animate-pulse" />
                                        ))
                                    ) : (
                                        isAdmin ? (
                                            bookings.slice(0, 4).map(booking => (
                                                <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF]/50 group hover:bg-white hover:shadow-lg transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            #{booking.id}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-foreground">{booking.vehicle?.name || "Vehicle"}</p>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                                                <UserIcon className="w-3 h-3" /> {booking.user?.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-primary">{formatCurrency(booking.total_price)}</p>
                                                        <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${getStatusColor(booking.status)}`}>
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <p className="text-muted-foreground font-bold">Platform activity is visible to super admins.</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "approvals" && (
                    <motion.div 
                        key="approvals"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-[2.5rem] border border-[#E9ECEF] shadow-sm overflow-hidden"
                    >
                        <div className="p-8 border-b border-[#E9ECEF] flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black tracking-tight">Vehicle Management</h3>
                                <p className="text-sm text-muted-foreground font-medium">Verify vehicle listings and monitor their current availability status.</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 border border-orange-100 text-orange-600">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-xs font-black uppercase">{vehicles.filter(v => !v.is_approved).length} PENDING</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F8F9FA] text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground border-b border-[#E9ECEF]">
                                    <tr>
                                        <th className="px-8 py-5">Vehicle</th>
                                        <th className="px-8 py-5">Category</th>
                                        <th className="px-8 py-5">Price/Day</th>
                                        <th className="px-8 py-5">Approval</th>
                                        <th className="px-8 py-5">Availability</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F8F9FA]">
                                    {vehicles.map((v) => (
                                        <tr key={v.id} className="hover:bg-[#F8F9FA]/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-10 rounded-lg overflow-hidden border border-[#E9ECEF]">
                                                        <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm text-foreground">{v.name}</p>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{v.location}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                                                    {v.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-black text-sm text-primary">{formatCurrency(v.price_per_day)}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                {v.is_approved ? (
                                                    <div className="flex items-center gap-1.5 text-green-600">
                                                        <ShieldCheck className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase">Approved</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-orange-500">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                {v.is_available ? (
                                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full bg-teal-100 text-teal-700">Received / Free</span>
                                                ) : (
                                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">Picked Up</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!v.is_approved ? (
                                                        <button 
                                                            onClick={() => handleApprove(v.id, true)}
                                                            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-green-500/20 hover:scale-105 transition-transform"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> APPROVE
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleApprove(v.id, false)}
                                                            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-100 transition-colors"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" /> REVOKE
                                                        </button>
                                                    )}
                                                    <button className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-primary transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {vehicles.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-12 text-center text-muted-foreground font-bold">
                                                No vehicle listings found in the system.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === "bookings" && (
                    <motion.div 
                        key="bookings"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white rounded-[2.5rem] border border-[#E9ECEF] shadow-sm overflow-hidden"
                    >
                        <div className="p-8 border-b border-[#E9ECEF]">
                            <h3 className="text-xl font-black tracking-tight">Global Booking Management</h3>
                            <p className="text-sm text-muted-foreground font-medium">Monitor all rental transactions across the platform.</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F8F9FA] text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground border-b border-[#E9ECEF]">
                                    <tr>
                                        <th className="px-8 py-5">ID</th>
                                        <th className="px-8 py-5">User</th>
                                        <th className="px-8 py-5">Vehicle</th>
                                        <th className="px-8 py-5">Duration</th>
                                        <th className="px-8 py-5">Total</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F8F9FA]">
                                    {bookings.map((b) => (
                                        <tr key={b.id} className="hover:bg-[#F8F9FA]/50 transition-colors group">
                                            <td className="px-8 py-6 font-black text-sm text-muted-foreground">#{b.id}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <UserIcon className="w-3.5 h-3.5 text-primary" />
                                                    </div>
                                                    <span className="text-sm font-bold text-foreground">{b.user?.email || "Unknown"}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-black text-foreground">{b.vehicle?.name || "Vehicle"}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-black text-sm text-primary">{formatCurrency(b.total_price)}</td>
                                            <td className="px-8 py-6">
                                                <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full ${getStatusColor(b.status)}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full ${getStatusColor(b.status)}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-8 py-12 text-center text-muted-foreground font-bold">
                                                No bookings have been made yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
