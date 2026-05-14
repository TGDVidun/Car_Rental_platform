import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Car,
    MapPin,
    CircleDollarSign,
    Image as ImageIcon,
    Type,
    FileText,
    Upload,
    CheckCircle2,
    User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ImageUploadZone from "@/components/ImageUploadZone";
import { getProvinceForDistrict } from "@/data/mapLocations";

// Fix leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

const PRICE_RANGES = {
    "Car": { min: 3000, max: 15000 },
    "SUV": { min: 8000, max: 30000 },
    "Van": { min: 7000, max: 25000 },
    "Bike": { min: 1000, max: 5000 },
    "Truck": { min: 10000, max: 50000 },
    "Luxury": { min: 20000, max: 150000 }
};

export default function AddVehiclePage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [priceError, setPriceError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast({
                title: "Login Required",
                description: "You must be logged in to list a vehicle.",
                variant: "destructive"
            });
            navigate("/login");
        }
    }, [navigate, toast]);

    const [formData, setFormData] = useState({
        name: "",
        type: "Car",
        location: "Colombo",
        price_per_day: "",
        driver_price_per_day: "1500",
        image_url: "",
        description: "",
        fuel_type: "Petrol",
        transmission: "Automatic",
        has_driver: true,
        seats: "5",
        province: "Western",
        latitude: null as number | null,
        longitude: null as number | null,
        district: "",
        city: "",
        road: ""
    });

    const validatePrice = (type: string, price: string) => {
        const range = PRICE_RANGES[type as keyof typeof PRICE_RANGES];
        if (range && price) {
            const val = parseFloat(price);
            if (val < range.min || val > range.max) {
                setPriceError(`Price for ${type} must be between LKR ${range.min} and ${range.max}`);
                return false;
            }
        }
        setPriceError("");
        return true;
    };

    const handleTypeChange = (newType: string) => {
        setFormData({ ...formData, type: newType });
        validatePrice(newType, formData.price_per_day);
    };

    const handlePriceChange = (newPrice: string) => {
        setFormData({ ...formData, price_per_day: newPrice });
        validatePrice(formData.type, newPrice);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.image_url) {
            toast({
                title: "Photo Required",
                description: "Please upload an image of your vehicle.",
                variant: "destructive"
            });
            return;
        }

        if (!formData.price_per_day || isNaN(parseFloat(formData.price_per_day))) {
            toast({
                title: "Price Required",
                description: "Please enter a valid daily price.",
                variant: "destructive"
            });
            return;
        }

        if (priceError) {
            toast({
                title: "Invalid Price",
                description: priceError,
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            console.log("Submit Token:", token);

            if (!token) {
                toast({
                    title: "Authentication Required",
                    description: "Please log in again to list a vehicle.",
                    variant: "destructive"
                });
                navigate("/login");
                return;
            }

            const response = await fetch("http://127.0.0.1:8000/vehicles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    price_per_day: parseFloat(formData.price_per_day) || 0,
                    driver_price_per_day: parseFloat(formData.driver_price_per_day) || 0,
                    seats: parseInt(formData.seats) || 5,
                    is_available: true
                })
            });

            if (response.ok) {
                toast({
                    title: "Success!",
                    description: `${formData.name} has been listed successfully.`,
                });
                navigate("/admin/cars");
            } else if (response.status === 401) {
                toast({
                    title: "Session Expired",
                    description: "Please log in again to continue.",
                    variant: "destructive"
                });
                localStorage.removeItem("token");
                navigate("/login");
            } else {
                const error = await response.json();
                let errorMessage = "Failed to list vehicle.";

                if (typeof error.detail === 'string') {
                    errorMessage = error.detail;
                } else if (Array.isArray(error.detail)) {
                    errorMessage = error.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', ');
                }

                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Network Error",
                description: "Could not connect to the server.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const currentRange = PRICE_RANGES[formData.type as keyof typeof PRICE_RANGES];

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">List a New Vehicle</h1>
                <p className="text-muted-foreground mt-1">Fill in the details below to make your car available for rent.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Col: Basics */}
                <div className="space-y-6">
                    <div className="p-8 rounded-3xl bg-white border border-[#E9ECEF] shadow-sm space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Basic Information</h3>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#495057] flex items-center gap-2">
                                <Type className="w-3 h-3 text-muted-foreground" /> Vehicle Name
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Honda Civic 2023"
                                className="w-full px-4 py-3 rounded-xl bg-[#F8F9FA] border border-transparent focus:border-primary/30 focus:bg-white transition-all outline-none text-sm font-medium"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#495057] flex items-center gap-2">
                                    <Car className="w-3 h-3 text-muted-foreground" /> Type
                                </label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-[#F8F9FA] border border-transparent focus:border-primary/30 focus:bg-white transition-all outline-none text-sm font-medium appearance-none"
                                    value={formData.type}
                                    onChange={(e) => handleTypeChange(e.target.value)}
                                >
                                    <option>Car</option>
                                    <option>SUV</option>
                                    <option>Van</option>
                                    <option>Bike</option>
                                    <option>Truck</option>
                                    <option>Luxury</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#495057] flex items-center gap-2">
                                    <User className="w-3 h-3 text-muted-foreground" /> Seats
                                </label>
                                <input
                                    type="number"
                                    placeholder="5"
                                    className="w-full px-4 py-3 rounded-xl bg-[#F8F9FA] border border-transparent focus:border-primary/30 focus:bg-white transition-all outline-none text-sm font-medium"
                                    value={formData.seats}
                                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#495057]">Fuel Type</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-[#F8F9FA] border border-transparent focus:border-primary/30 focus:bg-white transition-all outline-none text-sm font-medium"
                                    value={formData.fuel_type}
                                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                                >
                                    <option>Petrol</option>
                                    <option>Diesel</option>
                                    <option>Hybrid</option>
                                    <option>Electric</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#495057]">Transmission</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-[#F8F9FA] border border-transparent focus:border-primary/30 focus:bg-white transition-all outline-none text-sm font-medium"
                                    value={formData.transmission}
                                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                                >
                                    <option>Automatic</option>
                                    <option>Manual</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-[#495057] flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-muted-foreground" /> Precise Location
                            </label>
                            
                            <div className="h-64 rounded-xl overflow-hidden border border-[#E9ECEF] relative z-0">
                                <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <LocationMarker onLocationSelect={async (lat, lng) => {
                                        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                                        
                                        // Reverse geocoding
                                        try {
                                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                                            const data = await res.json();
                                            const addr = data.address;
                                            
                                            const detectedDistrict = addr.state_district || addr.district || addr.state || "";
                                            const correctProvince = getProvinceForDistrict(detectedDistrict);
                                            
                                            setFormData(prev => ({
                                                ...prev,
                                                district: detectedDistrict,
                                                city: addr.city || addr.town || addr.village || addr.suburb || "",
                                                road: addr.road || "",
                                                province: correctProvince
                                            }));
                                        } catch (err) {
                                            console.error("Geocoding error:", err);
                                        }
                                    }} />
                                    {formData.latitude && formData.longitude && (
                                        <Marker position={[formData.latitude, formData.longitude]} />
                                    )}
                                </MapContainer>
                            </div>

                            {formData.city && (
                                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 space-y-1">
                                    <p className="text-[10px] font-bold text-primary uppercase">Detected Address</p>
                                    <p className="text-xs font-medium text-foreground">
                                        {formData.district}, {formData.province}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#495057]">Select District</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-[#F8F9FA] border border-transparent focus:border-primary/30 focus:bg-white transition-all outline-none text-sm font-medium"
                                    value={formData.district}
                                    onChange={(e) => {
                                        const d = e.target.value;
                                        setFormData({ 
                                            ...formData, 
                                            district: d, 
                                            location: d,
                                            province: getProvinceForDistrict(d) 
                                        });
                                    }}
                                >
                                    <option value="">Select District</option>
                                    <optgroup label="Western">
                                        <option>Colombo</option>
                                        <option>Gampaha</option>
                                        <option>Kalutara</option>
                                    </optgroup>
                                    <optgroup label="Central">
                                        <option>Kandy</option>
                                        <option>Matale</option>
                                        <option>Nuwara Eliya</option>
                                    </optgroup>
                                    <optgroup label="Southern">
                                        <option>Galle</option>
                                        <option>Matara</option>
                                        <option>Hambantota</option>
                                    </optgroup>
                                    <optgroup label="Northern">
                                        <option>Jaffna</option>
                                        <option>Kilinochchi</option>
                                        <option>Mannar</option>
                                        <option>Mullaitivu</option>
                                        <option>Vavuniya</option>
                                    </optgroup>
                                    <optgroup label="Eastern">
                                        <option>Trincomalee</option>
                                        <option>Batticaloa</option>
                                        <option>Ampara</option>
                                    </optgroup>
                                    <optgroup label="North Western">
                                        <option>Kurunegala</option>
                                        <option>Puttalam</option>
                                    </optgroup>
                                    <optgroup label="North Central">
                                        <option>Anuradhapura</option>
                                        <option>Polonnaruwa</option>
                                    </optgroup>
                                    <optgroup label="Uva">
                                        <option>Badulla</option>
                                        <option>Monaragala</option>
                                    </optgroup>
                                    <optgroup label="Sabaragamuwa">
                                        <option>Ratnapura</option>
                                        <option>Kegalle</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-white border border-[#E9ECEF] shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Pricing (LKR)</h3>
                            {currentRange && (
                                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
                                    Range: {currentRange.min} - {currentRange.max}
                                </span>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#495057] flex items-center gap-2">
                                    <CircleDollarSign className="w-3 h-3 text-muted-foreground" /> Daily Rental Price
                                </label>
                                <input
                                    required
                                    type="number"
                                    placeholder="8500"
                                    className={`w-full px-4 py-3 rounded-xl bg-[#F8F9FA] border ${priceError ? 'border-red-500 bg-red-50' : 'border-transparent'} focus:border-primary/30 focus:bg-white transition-all outline-none text-sm font-medium`}
                                    value={formData.price_per_day}
                                    onChange={(e) => handlePriceChange(e.target.value)}
                                />
                                {priceError && <p className="text-[10px] text-red-500 font-bold mt-1">{priceError}</p>}
                            </div>

                            <hr className="border-[#E9ECEF]" />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${formData.has_driver ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <label htmlFor="has_driver" className="text-xs font-bold text-[#495057] cursor-pointer block">
                                                Driver Option
                                            </label>
                                            <p className="text-[10px] text-muted-foreground">Allow users to book with a driver</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        id="has_driver"
                                        checked={formData.has_driver}
                                        onChange={(e) => setFormData({ ...formData, has_driver: e.target.checked })}
                                        className="w-5 h-5 accent-primary rounded-md cursor-pointer"
                                    />
                                </div>

                                {formData.has_driver && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-1.5 pt-2"
                                    >
                                        <label className="text-xs font-bold text-[#495057]">Driver's Daily Fee (LKR)</label>
                                        <input
                                            type="number"
                                            placeholder="1500"
                                            className="w-full px-4 py-3 rounded-xl bg-[#F8F9FA] border border-transparent focus:border-primary/30 focus:bg-white transition-all outline-none text-sm font-medium"
                                            value={formData.driver_price_per_day}
                                            onChange={(e) => setFormData({ ...formData, driver_price_per_day: e.target.value })}
                                        />
                                        <p className="text-[10px] text-muted-foreground italic">Standard rate is usually LKR 1500 - 2500 per day.</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Media & Desc */}
                <div className="space-y-6">
                    <div className="p-8 rounded-3xl bg-white border border-[#E9ECEF] shadow-sm space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Vehicle Photo</h3>

                        <div className="space-y-4">
                            <ImageUploadZone
                                currentImage={formData.image_url}
                                onUploadSuccess={(url) => setFormData({ ...formData, image_url: url })}
                                onRemove={() => setFormData({ ...formData, image_url: "" })}
                            />
                            <p className="text-[10px] text-muted-foreground italic text-center px-4">
                                Drag and drop a high-quality photo of your vehicle. First impressions matter!
                            </p>
                        </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-white border border-[#E9ECEF] shadow-sm space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Description</h3>

                        <div className="space-y-1.5">
                            <textarea
                                rows={4}
                                placeholder="Tell us about your vehicle's features, condition, and any other details..."
                                className="w-full px-4 py-3 rounded-xl bg-[#F8F9FA] border border-transparent focus:border-primary/30 focus:bg-white transition-all outline-none text-sm font-medium resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading || !!priceError}
                        className={`w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 ${loading || priceError ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                List Vehicle Now
                            </>
                        )}
                    </motion.button>

                    <div className="p-4 rounded-xl bg-green-50 text-green-700 text-[10px] font-bold uppercase flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Your listing will be instantly visible to thousands of users!
                    </div>
                </div>
            </form>
        </div>
    );
}

