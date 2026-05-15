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
    Eye,
    Search,
    Filter,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Users,
    MapPin,
    Smartphone
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
    district?: string;
    city?: string;
    road?: string;
    price_per_day: number;
    is_approved: boolean;
    is_available: boolean;
    image_url: string;
    owner_id: number;
    has_driver?: boolean;
    owner?: {
        email: string;
        full_name?: string;
        phone_number?: string;
    };
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
    const [activeTab, setActiveTab] = useState<"overview" | "approvals" | "bookings" | "listings">("overview");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending">("all");
    const [groupByOwner, setGroupByOwner] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, groupByOwner]);

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

    const handleDeleteVehicle = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this listing? This will permanently remove it from the platform and cancel its presence on the map and search results.")) return;
        
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/admin/vehicles/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                toast({
                    title: "Listing Deleted",
                    description: "The vehicle has been removed from the platform.",
                });
                fetchData();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete vehicle.",
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
                        <button 
                            onClick={() => setActiveTab("listings")}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'listings' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Manage Listings
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
                {activeTab === "listings" && (
                    <motion.div 
                        key="listings"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6"
                    >
                        <div className="p-8 rounded-[2.5rem] bg-white border border-[#E9ECEF] shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">Listing Management</h3>
                                    <p className="text-sm text-muted-foreground font-medium">Search, filter, and moderate all vehicle listings on RentX.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input 
                                            type="text" 
                                            placeholder="Search name, owner, email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-64"
                                        />
                                    </div>
                                    <select 
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value as any)}
                                        className="px-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl text-sm font-bold focus:outline-none transition-all cursor-pointer"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="approved">Approved</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                    <button 
                                        onClick={() => setGroupByOwner(!groupByOwner)}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold border transition-all ${groupByOwner ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-[#E9ECEF] text-muted-foreground'}`}
                                    >
                                        <Users className="w-4 h-4" /> Group by Owner
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {(() => {
                                    const filtered = vehicles.filter(v => {
                                        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                             v.owner?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                             v.owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
                                        const matchesStatus = filterStatus === "all" || 
                                                             (filterStatus === "approved" && v.is_approved) || 
                                                             (filterStatus === "pending" && !v.is_approved);
                                        return matchesSearch && matchesStatus;
                                    });

                                    if (groupByOwner) {
                                        const owners = Array.from(new Set(filtered.map(v => v.owner_id)));
                                        return owners.map(ownerId => {
                                            const ownerVehicles = filtered.filter(v => v.owner_id === ownerId);
                                            const owner = ownerVehicles[0]?.owner;
                                            return (
                                                <div key={ownerId} className="space-y-4 p-6 rounded-3xl bg-[#F8F9FA] border border-[#E9ECEF]/50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-white border border-[#E9ECEF] flex items-center justify-center">
                                                                <UserIcon className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-foreground">{owner?.full_name || "Unknown Owner"}</p>
                                                                <p className="text-xs font-bold text-muted-foreground">{owner?.email}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-black bg-white border border-[#E9ECEF] px-3 py-1 rounded-full text-muted-foreground uppercase">
                                                            {ownerVehicles.length} LISTINGS
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {ownerVehicles.map(v => (
                                                            <VehicleCard key={v.id} v={v} onDelete={handleDeleteVehicle} onApprove={handleApprove} />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    }

                                    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                                    
                                    return (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                {paginated.map(v => (
                                                    <VehicleCard key={v.id} v={v} onDelete={handleDeleteVehicle} onApprove={handleApprove} />
                                                ))}
                                            </div>
                                            {filtered.length > itemsPerPage && (
                                                <div className="flex items-center justify-center gap-4 mt-12">
                                                    <button 
                                                        disabled={currentPage === 1}
                                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                                        className="p-2 rounded-xl bg-white border border-[#E9ECEF] disabled:opacity-30 transition-all hover:bg-secondary"
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </button>
                                                    <span className="text-sm font-black">Page {currentPage} of {Math.ceil(filtered.length / itemsPerPage)}</span>
                                                    <button 
                                                        disabled={currentPage >= Math.ceil(filtered.length / itemsPerPage)}
                                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                                        className="p-2 rounded-xl bg-white border border-[#E9ECEF] disabled:opacity-30 transition-all hover:bg-secondary"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                            {filtered.length === 0 && (
                                                <div className="text-center py-20">
                                                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                                                        <Car className="w-8 h-8 text-muted-foreground opacity-50" />
                                                    </div>
                                                    <p className="font-bold text-muted-foreground">No matching listings found.</p>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function VehicleCard({ v, onDelete, onApprove }: { v: Vehicle, onDelete: (id: number) => void, onApprove: (id: number, approve: boolean) => void }) {
    return (
        <div className="group relative bg-white border border-[#E9ECEF] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="aspect-[16/10] overflow-hidden relative">
                <img src={v.image_url} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-lg ${v.is_approved ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                        {v.is_approved ? 'APPROVED' : 'PENDING'}
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider">
                        {v.type}
                    </span>
                </div>
            </div>
            <div className="p-4">
                <div className="mb-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-black text-sm text-foreground mb-1">{v.name}</h4>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                                <MapPin className="w-3 h-3" /> {v.city || v.district || v.location}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-primary/70 uppercase">Owner</p>
                            <p className="text-[10px] font-bold text-foreground truncate max-w-[80px]">{v.owner?.full_name?.split(' ')[0] || v.owner?.email.split('@')[0]}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-y border-[#F8F9FA] mb-4">
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground leading-none mb-1">Rental Price</p>
                        <p className="text-sm font-black text-primary">{formatCurrency(v.price_per_day)}<span className="text-[10px] font-normal text-muted-foreground">/day</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground leading-none mb-1">Driver</p>
                        <p className="text-[10px] font-black uppercase tracking-tighter text-foreground">{v.has_driver ? 'Available' : 'Self-drive'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!v.is_approved ? (
                        <button 
                            onClick={() => onApprove(v.id, true)}
                            className="flex-1 py-2 rounded-xl bg-green-500 text-white text-[10px] font-black hover:bg-green-600 transition-colors"
                        >
                            APPROVE
                        </button>
                    ) : (
                        <button 
                            onClick={() => onApprove(v.id, false)}
                            className="flex-1 py-2 rounded-xl bg-[#F8F9FA] text-muted-foreground text-[10px] font-black hover:bg-secondary transition-colors"
                        >
                            REVOKE
                        </button>
                    )}
                    <button 
                        onClick={() => onDelete(v.id)}
                        className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
