import { useEffect, useState } from "react";
import {
    Car,
    MapPin,
    Trash2,
    Plus,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
    id: number;
    name: string;
    type: string;
    location: string;
    price_per_day: number;
    is_available: boolean;
    image_url: string;
}

export default function ManageVehiclesPage() {
    const { toast } = useToast();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:8000/owner/vehicles", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setVehicles(data);
            }
        } catch (error) {
            console.error("Failed to fetch vehicles", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/owner/vehicles/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                toast({
                    title: "Vehicle Deleted",
                    description: "Your listing has been removed successfully.",
                });
                fetchVehicles();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete vehicle.",
                variant: "destructive"
            });
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/owner/vehicles/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ is_available: !currentStatus })
            });

            if (response.ok) {
                toast({
                    title: "Status Updated",
                    description: `Vehicle is now ${!currentStatus ? 'available' : 'unavailable'}.`,
                });
                fetchVehicles();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update availability.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Manage Your Fleet</h1>
                    <p className="text-muted-foreground">View and manage the vehicles you have listed for rent.</p>
                </div>
                <Link
                    to="/admin/add"
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl gradient-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <Plus className="w-5 h-5" /> List New Car
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-muted-foreground">Loading your fleet...</p>
                </div>
            ) : vehicles.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-[#E9ECEF] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <Car className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No vehicles listed yet</h3>
                    <p className="text-muted-foreground text-sm">Start earning today by listing your first vehicle.</p>
                    <Link to="/admin/add" className="mt-6 text-primary font-bold flex items-center gap-1 hover:underline">
                        Add your first car <Plus className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {vehicles.map((vehicle, i) => (
                            <motion.div
                                key={vehicle.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative overflow-hidden rounded-3xl bg-white border border-[#E9ECEF] shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img
                                        src={vehicle.image_url}
                                        alt={vehicle.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-[#212529] shadow-sm border border-white/20">
                                            {vehicle.type}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#212529]">{vehicle.name}</h3>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                                                <MapPin className="w-3 h-3" /> {vehicle.location}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground leading-none mb-1 font-bold">Daily Price</p>
                                            <p className="text-lg font-black text-primary">{formatCurrency(vehicle.price_per_day)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-y border-[#F8F9FA] mb-4">
                                        <span className="text-xs font-bold text-muted-foreground uppercase opacity-60">Listing Status</span>
                                        <button
                                            onClick={() => handleToggleStatus(vehicle.id, vehicle.is_available)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${vehicle.is_available
                                                ? "bg-green-50 text-green-600 hover:bg-green-100"
                                                : "bg-red-50 text-red-600 hover:bg-red-100"
                                                }`}
                                        >
                                            {vehicle.is_available ? (
                                                <><CheckCircle2 className="w-3.5 h-3.5" /> Available</>
                                            ) : (
                                                <><AlertCircle className="w-3.5 h-3.5" /> Unavailable</>
                                            )}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button className="flex-1 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] text-foreground text-xs font-bold hover:bg-secondary transition-colors">
                                            Edit Details
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vehicle.id)}
                                            className="w-10 h-10 rounded-xl bg-destructive/5 text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-all shadow-sm"
                                            title="Delete Vehicle"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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
