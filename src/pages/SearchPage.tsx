import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, MapPin, Star, Map as MapIcon, LayoutGrid, Navigation } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { vehicles as fallbackVehicles, vehicleTypes, type Vehicle } from "@/data/vehicles";
import { 
  getProvinceForDistrict, 
  SRI_LANKA_CENTER, 
  SRI_LANKA_DEFAULT_ZOOM,
  getCoordsForVehicle 
} from "@/data/mapLocations";
import { useTheme } from "@/hooks/useTheme";
import { Link } from "react-router-dom";

// Helper to transform backend vehicle to frontend format
const transformVehicle = (v: any): Vehicle => {
  const district = v.district || v.location || "Colombo";
  return {
    id: v.id.toString(),
    name: v.name || "Vehicle",
    type: (v.type || "car").toLowerCase(),
    seats: Number(v.seats) || 5,
    transmission: (v.transmission || "automatic").toLowerCase(),
    location: v.location || "Colombo",
    province: getProvinceForDistrict(district),
    pricePerDay: Number(v.price_per_day) || 0,
    rating: Number(v.rating) || 5.0,
    reviewCount: Number(v.review_count) || 0,
    hasDriverOption: Boolean(v.has_driver),
    images: v.image_url ? [v.image_url] : [],
    fuel: v.fuel_type || "Petrol",
    year: 2024,
    description: v.description || "",
    latitude: v.latitude,
    longitude: v.longitude,
    district: district,
    city: v.city || v.location || "Colombo",
    road: v.road,
  };
};
import VehicleCard, { VehicleCardSkeleton } from "@/components/VehicleCard";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Draft state lives here so dragging only re-renders this component, not the whole page. */
function PriceRangeSlider({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (v: number) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    setDraft(value);
  }, [value]);
  return (
    <div>
      <h4 className="font-label text-muted-foreground mb-3">Max Price: {formatCurrency(draft)}/day</h4>
      <input
        type="range"
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={PRICE_STEP}
        value={draft}
        onChange={(e) => setDraft(Number(e.target.value))}
        onMouseUp={() => onCommit(draft)}
        onTouchEnd={() => onCommit(draft)}
        onPointerUp={() => onCommit(draft)}
        className="w-full accent-primary cursor-grab active:cursor-grabbing touch-none"
      />
    </div>
  );
}

/** Draft state lives here so dragging only re-renders this component, not the whole page. */
function SeatsRangeSlider({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (v: number) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    setDraft(value);
  }, [value]);
  return (
    <div>
      <h4 className="font-label text-muted-foreground mb-3">Min Seats: {draft}</h4>
      <input
        type="range"
        min={1}
        max={14}
        value={draft}
        onChange={(e) => setDraft(Number(e.target.value))}
        onMouseUp={() => onCommit(draft)}
        onTouchEnd={() => onCommit(draft)}
        onPointerUp={() => onCommit(draft)}
        className="w-full accent-primary cursor-grab active:cursor-grabbing touch-none"
      />
    </div>
  );
}

const sortOptions = [
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating", value: "rating" },
  { label: "Newest", value: "newest" },
];

// Map logic
const carIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-2-2.2-3.3C13 5.6 11.7 5 10.5 5H5.8C4.6 5 3.5 5.8 3.2 7L2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
const carIcon = L.divIcon({
  className: "vehicle-marker map-car-icon",
  html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid #2563eb">${carIconSvg}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const PRICE_MIN = 0;
const PRICE_MAX = 150000;
const PRICE_STEP = 1000;

const PROVINCE_DISTRICT_MAP: Record<string, string[]> = {
  "Western": ["Colombo", "Gampaha", "Kalutara"],
  "Central": ["Kandy", "Matale", "Nuwara Eliya"],
  "Southern": ["Galle", "Matara", "Hambantota"],
  "Northern": ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
  "Eastern": ["Trincomalee", "Batticaloa", "Ampara"],
  "North Western": ["Kurunegala", "Puttalam"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  "Uva": ["Badulla", "Monaragala"],
  "Sabaragamuwa": ["Ratnapura", "Kegalle"]
};

function MapSync({ vehicles }: { vehicles: Vehicle[] }) {
  const map = useMap();
  useEffect(() => {
    if (vehicles.length === 0) {
      map.setView(SRI_LANKA_CENTER, SRI_LANKA_DEFAULT_ZOOM);
      return;
    }

    try {
      const coords = vehicles.map((v, i) => {
        const lat = Number(v.latitude);
        const lng = Number(v.longitude);
        if (lat && lng && lat !== 0 && lng !== 0) return [lat, lng];
        return getCoordsForVehicle(v.district || v.location || "Colombo", i);
      }) as [number, number][];

      if (coords.length === 1) {
        // Special case: Single vehicle centering
        map.setView(coords[0], 13, { animate: true });
      } else {
        // Multiple vehicles: fit bounds
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { 
          padding: [50, 50], 
          maxZoom: 12, 
          animate: true,
          duration: 1 
        });
      }
    } catch (err) {
      console.error("Map centering error:", err);
    }
  }, [vehicles, map]);
  return null;
}

// Separate Map component for cleaner reactivity
function VehicleMap({ vehicles, isDark }: { vehicles: Vehicle[], isDark: boolean }) {
  useEffect(() => {
    console.log("VehicleMap: Rendering markers for", vehicles.length, "vehicles");
  }, [vehicles]);

  return (
    <div className="flex-1 relative rounded-2xl overflow-hidden border border-border shadow-inner min-h-[400px]">
      <MapContainer
        center={SRI_LANKA_CENTER}
        zoom={SRI_LANKA_DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url={isDark ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        />
        <MapSync vehicles={vehicles} />
        {vehicles.map((v, i) => {
          const lat = Number(v.latitude);
          const lng = Number(v.longitude);
          const pos: L.LatLngExpression = (lat && lng && lat !== 0 && lng !== 0)
            ? [lat, lng]
            : getCoordsForVehicle(v.district || v.location || "Colombo", i) as L.LatLngExpression;

          return (
            <Marker 
              key={`marker-${v.id}-${vehicles.length}`} // Force fresh key if needed
              position={pos} 
              icon={carIcon}
            >
              <Popup className="rentx-vehicle-popup" minWidth={240}>
                <div className="overflow-hidden rounded-xl">
                  <div className="h-24 w-full overflow-hidden bg-secondary">
                    {v.images[0] ? (
                      <img src={v.images[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><MapPin className="w-6 h-6 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="p-3 bg-card">
                    <h5 className="font-heading font-bold text-sm">{v.name}</h5>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {v.district}, {v.province}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-primary font-bold text-xs">{formatCurrency(v.pricePerDay)}<span className="text-[10px] font-normal text-muted-foreground">/day</span></span>
                      <Link to={`/vehicle/${v.id}`} className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded-md font-bold">View</Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

interface FilterPanelProps {
  vehicleTypes: readonly string[];
  selectedTypes: string[];
  toggleType: (t: string) => void;
  selectedProvince: string;
  handleProvinceChange: (p: string) => void;
  provinceOptions: string[];
  selectedDistrict: string;
  handleDistrictChange: (d: string) => void;
  currentDistricts: string[];
  selectedLocation: string;
  setSelectedLocation: (l: string) => void;
  currentCities: string[];
  maxPrice: number;
  setMaxPrice: (p: number) => void;
  minSeats: number;
  setMinSeats: (s: number) => void;
  driverOnly: boolean;
  setDriverOnly: (d: boolean) => void;
  transmission: string;
  setTransmission: (t: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;
}

function FilterPanel({
  vehicleTypes, selectedTypes, toggleType,
  selectedProvince, handleProvinceChange, provinceOptions,
  selectedDistrict, handleDistrictChange, currentDistricts,
  selectedLocation, setSelectedLocation, currentCities,
  maxPrice, setMaxPrice, minSeats, setMinSeats,
  driverOnly, setDriverOnly, transmission, setTransmission,
  clearFilters, applyFilters
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Vehicle type */}
      <div>
        <h4 className="font-label text-muted-foreground mb-3">Vehicle Type</h4>
        <div className="flex flex-wrap gap-2">
          {vehicleTypes.map((t) => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`chip text-xs capitalize ${selectedTypes.includes(t) ? "gradient-primary text-primary-foreground" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Province */}
      <div>
        <h4 className="font-label text-muted-foreground mb-3">Province</h4>
        <Select
          value={selectedProvince || "__all__"}
          onValueChange={handleProvinceChange}
        >
          <SelectTrigger className="w-full rounded-lg bg-secondary border-0 text-foreground h-9 px-3 focus:ring-2 focus:ring-primary/30">
            <SelectValue placeholder="All Provinces" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Provinces</SelectItem>
            {provinceOptions.map((p) => (
              <SelectItem key={p} value={p}>{p} Province</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District */}
      <div>
        <h4 className="font-label text-muted-foreground mb-3">District</h4>
        <Select
          value={selectedDistrict || "__all__"}
          onValueChange={handleDistrictChange}
          disabled={!selectedProvince}
        >
          <SelectTrigger className="w-full rounded-lg bg-secondary border-0 text-foreground h-9 px-3 focus:ring-2 focus:ring-primary/30 disabled:opacity-50">
            <SelectValue placeholder={selectedProvince ? "All Districts" : "Select Province first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Districts</SelectItem>
            {currentDistricts.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City */}
      <div>
        <h4 className="font-label text-muted-foreground mb-3">City/Area</h4>
        <Select
          value={selectedLocation || "__all__"}
          onValueChange={(v) => setSelectedLocation(v === "__all__" ? "" : v)}
          disabled={!selectedDistrict}
        >
          <SelectTrigger className="w-full rounded-lg bg-secondary border-0 text-foreground h-9 px-3 focus:ring-2 focus:ring-primary/30 disabled:opacity-50">
            <SelectValue placeholder={selectedDistrict ? "All Cities" : "Select District first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Cities</SelectItem>
            {currentCities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PriceRangeSlider value={maxPrice} onCommit={setMaxPrice} />
      <SeatsRangeSlider value={minSeats} onCommit={setMinSeats} />

      <div>
        <h4 className="font-label text-muted-foreground mb-3">Transmission</h4>
        <div className="flex gap-2">
          {["", "automatic", "manual"].map((t) => (
            <button
              key={t}
              onClick={() => setTransmission(t)}
              className={`chip text-xs capitalize ${transmission === t ? "gradient-primary text-primary-foreground" : ""}`}
            >
              {t || "Any"}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={driverOnly}
          onChange={(e) => setDriverOnly(e.target.checked)}
          className="w-4 h-4 rounded accent-primary"
        />
        <span className="text-sm text-foreground">Driver available only</span>
      </label>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <button onClick={clearFilters} className="w-full py-2.5 rounded-lg bg-secondary text-foreground font-medium text-sm">
          Clear
        </button>
        <button onClick={applyFilters} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-medium text-sm">
          Apply
        </button>
      </div>
    </div>
  );
}

import { useFilters } from "@/context/FilterContext";

export default function SearchPage() {
  const { isDark } = useTheme();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const {
    selectedProvince, setSelectedProvince,
    selectedDistrict, setSelectedDistrict,
    selectedCity: selectedLocation, setSelectedCity: setSelectedLocation,
    selectedTypes, setSelectedTypes,
    maxPrice, setMaxPrice,
    minSeats, setMinSeats,
    driverOnly, setDriverOnly,
    transmission, setTransmission,
    sort, setSort,
    filteredVehicles,
    isLoading,
    isError,
    clearFilters
  } = useFilters();

  // Dynamic options based on selection
  const provinceOptions = Object.keys(PROVINCE_DISTRICT_MAP).sort();
  
  const currentDistricts = useMemo(() => {
    if (!selectedProvince) return [];
    return PROVINCE_DISTRICT_MAP[selectedProvince] || [];
  }, [selectedProvince]);

  const currentCities = useMemo(() => {
    if (!selectedDistrict) return [];
    // For cities, we look at ALL possible vehicles (could be optimized if needed)
    return Array.from(new Set(
      fallbackVehicles // Using fallback for options list or we could use context's availableVehicles if we exposed it
        .filter(v => v.district === selectedDistrict)
        .map(v => v.city)
        .filter(Boolean)
    )).sort() as string[];
  }, [selectedDistrict]);

  const handleProvinceChange = (p: string) => {
    const val = p === "__all__" ? "" : p;
    setSelectedProvince(val);
    setSelectedDistrict("");
    setSelectedLocation(""); // Reset City
  };

  const handleDistrictChange = (d: string) => {
    const val = d === "__all__" ? "" : d;
    setSelectedDistrict(val);
    setSelectedLocation(""); // Reset City
  };

  const toggleType = (t: string) => {
    setSelectedTypes(
      selectedTypes.includes(t) 
        ? selectedTypes.filter((x) => x !== t) 
        : [...selectedTypes, t]
    );
  };

  const applyFilters = () => {
    setFiltersOpen(false);
    toast({ title: "Filters applied", description: `${filteredVehicles.length} vehicles found` });
  };


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Search Vehicles</h1>
          <p className="text-sm text-muted-foreground">{filteredVehicles.length} vehicles available</p>
          {isError && (
            <p className="text-xs text-muted-foreground">Showing sample vehicles until the server reconnects.</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-secondary rounded-lg p-1 mr-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "map" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
              title="Map View"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[11rem] min-w-[11rem] rounded-lg bg-secondary border-0 text-foreground h-9 px-4 focus:ring-2 focus:ring-primary/30">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop filters sidebar */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="glass-card sticky top-24">
            <h3 className="font-heading font-semibold text-foreground mb-6">Filters</h3>
            <FilterPanel 
              vehicleTypes={vehicleTypes}
              selectedTypes={selectedTypes}
              toggleType={toggleType}
              selectedProvince={selectedProvince}
              handleProvinceChange={handleProvinceChange}
              provinceOptions={provinceOptions}
              selectedDistrict={selectedDistrict}
              handleDistrictChange={handleDistrictChange}
              currentDistricts={currentDistricts}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              currentCities={currentCities}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              minSeats={minSeats}
              setMinSeats={setMinSeats}
              driverOnly={driverOnly}
              setDriverOnly={setDriverOnly}
              transmission={transmission}
              setTransmission={setTransmission}
              clearFilters={clearFilters}
              applyFilters={applyFilters}
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)
                : filteredVehicles.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 h-[700px] lg:h-[calc(100vh-16rem)]">
              {/* Sidebar list in Map view */}
              <div className="w-full lg:w-80 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {filteredVehicles.map((v) => (
                  <div key={v.id} className="group relative glass-card p-3 flex gap-4 hover:border-primary/50 transition-colors">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      {v.images[0] ? (
                        <img src={v.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <MapPin className="w-6 h-6 text-muted-foreground m-auto" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-heading font-semibold text-sm truncate">{v.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{v.district}, {v.province}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-primary font-bold text-sm">{formatCurrency(v.pricePerDay)}</span>
                        <Link to={`/vehicle/${v.id}`} className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground hover:text-primary transition-colors">Details</Link>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredVehicles.length === 0 && <p className="text-center text-muted-foreground py-10">No vehicles match filters.</p>}
              </div>

              {/* The Map */}
              <VehicleMap vehicles={filteredVehicles} isDark={isDark} />
            </div>
          )}
          {!isLoading && filteredVehicles.length === 0 && viewMode === "grid" && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No vehicles match your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={() => setFiltersOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-80 glass p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading font-semibold text-foreground">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <FilterPanel 
                vehicleTypes={vehicleTypes}
                selectedTypes={selectedTypes}
                toggleType={toggleType}
                selectedProvince={selectedProvince}
                handleProvinceChange={handleProvinceChange}
                provinceOptions={provinceOptions}
                selectedDistrict={selectedDistrict}
                handleDistrictChange={handleDistrictChange}
                currentDistricts={currentDistricts}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                currentCities={currentCities}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                minSeats={minSeats}
                setMinSeats={setMinSeats}
                driverOnly={driverOnly}
                setDriverOnly={setDriverOnly}
                transmission={transmission}
                setTransmission={setTransmission}
                clearFilters={clearFilters}
                applyFilters={applyFilters}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
