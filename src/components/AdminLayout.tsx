import { Link, useLocation, Outlet } from "react-router-dom";
import {
    LayoutDashboard,
    PlusSquare,
    Car,
    ClipboardList,
    LogOut,
    User,
    ChevronRight,
    CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

const sidebarLinks = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: PlusSquare, label: "Add car", path: "/admin/add" },
    { icon: Car, label: "Manage Cars", path: "/admin/cars" },
    { icon: ClipboardList, label: "Manage Bookings", path: "/admin/bookings" },
    { icon: CheckCircle, label: "Paid Bookings", path: "/admin/paid" },
];

export default function AdminLayout() {
    const location = useLocation();
    const isAdmin = localStorage.getItem("is_admin") === "true";

    return (
        <div className="flex min-h-screen bg-[#F8F9FA]">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-[#E9ECEF] flex flex-col sticky top-0 h-screen">
                <div className="p-6 border-b border-[#E9ECEF]">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold gradient-text">RentX</span>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                            {isAdmin ? "Admin" : "Owner"}
                        </span>
                    </Link>
                </div>

                <div className="p-4 mb-4 mt-6">
                    <div className="flex items-center gap-3 px-3 py-4 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#212529]">
                                {isAdmin ? "Super Admin" : "Fleet Owner"}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                                {isAdmin ? "Platform Access" : "Premium Account"}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {sidebarLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "text-[#495057] hover:bg-secondary hover:text-foreground"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-[#ADB5BD] group-hover:text-primary transition-colors"}`} />
                                    <span className="text-sm font-semibold">{link.label}</span>
                                </div>
                                {isActive && (
                                    <motion.div layoutId="active-pill">
                                        <ChevronRight className="w-4 h-4 text-primary-foreground" />
                                    </motion.div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[#E9ECEF]">
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-[#495057] hover:bg-destructive/5 hover:text-destructive transition-all">
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-semibold">Exit Admin</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="h-20 bg-white border-b border-[#E9ECEF] flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-[#212529]">
                        {sidebarLinks.find(l => l.path === location.pathname)?.label || "Admin Panel"}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-muted-foreground">{isAdmin ? "Super Admin" : "Fleet Owner"}</p>
                            <p className="text-sm font-bold text-[#212529]">Platform Admin</p>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-secondary">
                            <img src={`https://ui-avatars.com/api/?name=${isAdmin ? 'Admin' : 'Owner'}&background=6366f1&color=fff`} alt="Avatar" />
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
