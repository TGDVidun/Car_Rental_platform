import { useState, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, List, Star, Navigation, Loader2, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { vehicles as fallbackVehicles, type Vehicle } from "@/data/vehicles";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import {
  SRI_LANKA_CENTER,
  SRI_LANKA_DEFAULT_ZOOM,
  getCoordsForVehicle,
  locationCoords,
  getProvinceForDistrict
} from "@/data/mapLocations";
import "leaflet/dist/leaflet.css";

const LOCATION_NAMES = Object.keys(locationCoords).sort();

const transformVehicle = (v: any): Vehicle => ({
  id: v.id.toString(),
  name: v.name,
  type: (v.type || "car").toLowerCase(),
  seats: v.seats || 5,
  transmission: (v.transmission || "automatic").toLowerCase(),
  location: v.location,
  province: getProvinceForDistrict(v.district || v.location),
  pricePerDay: v.price_per_day,
  rating: v.rating || 5.0,
  reviewCount: v.review_count || 0,
  hasDriverOption: v.has_driver,
  images: v.image_url ? [v.image_url] : [],
  fuel: v.fuel_type || "Petrol",
  year: 2024,
  description: v.description || "",
  latitude: v.latitude,
  longitude: v.longitude,
  district: v.district,
  city: v.city,
  road: v.road,
});

function getVehiclePosition(vehicle: Vehicle, index: number): [number, number] {
  if (typeof vehicle.latitude === "number" && typeof vehicle.longitude === "number") {
    return [vehicle.latitude, vehicle.longitude];
  }

  return getCoordsForVehicle(vehicle.location, index);
}

// Car icon for vehicle markers (primary color via class)
const carIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-2-2.2-3.3C13 5.6 11.7 5 10.5 5H5.8C4.6 5 3.5 5.8 3.2 7L2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
const carIcon = L.divIcon({
  className: "vehicle-marker map-car-icon",
  html: `<div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid">${carIconSvg}</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

// Red location pin for user ("my location")
const locationPinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" stroke="#b91c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3" fill="white" stroke="#b91c1c"/></svg>`;
function createUserIcon() {
  return L.divIcon({
    className: "user-location-marker",
    html: `<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${locationPinSvg}</div>`,
    iconSize: [40, 40],
    iconAnchor: [12, 40],
    popupAnchor: [0, -40],
  });
}

/** Rough Sri Lanka bounds to avoid flying map abroad if user is elsewhere. */
const SRI_LANKA_BOUNDS = { latMin: 5.9, latMax: 9.9, lngMin: 79.5, lngMax: 82.0 };

function FlyToUser({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const doneRef = useRef(false);
  useEffect(() => {
    if (!position || doneRef.current) return;
    const [lat, lng] = position;
    const inSriLanka =
      lat >= SRI_LANKA_BOUNDS.latMin && lat <= SRI_LANKA_BOUNDS.latMax &&
      lng >= SRI_LANKA_BOUNDS.lngMin && lng <= SRI_LANKA_BOUNDS.lngMax;
    if (inSriLanka) {
      map.flyTo(position, 10, { duration: 1.5 });
    }
    doneRef.current = true;
  }, [map, position]);
  return null;
}

function FocusOnVehicle({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    map.flyTo(position, 14, { duration: 1 });
  }, [map, position]);
  return null;
}

function FlyToSearch({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    map.flyTo(position, 12, { duration: 1 });
  }, [map, position]);
  return null;
}

function MapZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-0.5 rounded-xl overflow-hidden border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-xl shadow-lg">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
        aria-label="Zoom in"
      >
        <span className="text-lg font-bold leading-none">+</span>
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-white/20 dark:hover:bg-white/10 transition-colors border-t border-white/20"
        aria-label="Zoom out"
      >
        <span className="text-lg font-bold leading-none">−</span>
      </button>
    </div>
  );
}

import { useFilters } from "@/context/FilterContext";

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
        map.setView(coords[0], 14, { animate: true });
      } else {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { 
          padding: [80, 80], 
          maxZoom: 12, 
          animate: true,
          duration: 1.5 
        });
      }
    } catch (err) {
      console.error("Map centering error:", err);
    }
  }, [vehicles, map]);
  return null;
}

export default function MapPage() {
  const { isDark } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [locationSearchOpen, setLocationSearchOpen] = useState(false);
  const [searchFlyToPosition, setSearchFlyToPosition] = useState<[number, number] | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const {
    selectedProvince, setSelectedProvince,
    selectedDistrict: districtFilter, setSelectedDistrict: setDistrictFilter,
    selectedCity, setSelectedCity,
    filteredVehicles,
    isLoading: vehiclesLoading
  } = useFilters();

  const locationNames = useMemo(
    () =>
      Array.from(
        new Set([
          ...LOCATION_NAMES,
          ...fallbackVehicles.map((vehicle) => vehicle.location).filter(Boolean),
        ])
      ).sort(),
    []
  );

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setLocationSearchOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const locationSuggestions = locationSearchQuery.trim()
    ? locationNames.filter((name) =>
        name.toLowerCase().includes(locationSearchQuery.trim().toLowerCase())
      ).slice(0, 8)
    : locationNames.slice(0, 8);

  const handleSelectLocation = (name: string) => {
    setSelectedCity(name);
    setLocationSearchQuery(name);
    setLocationSearchOpen(false);
  };

  const vehicleCoords = filteredVehicles.map((v, i) => ({
    vehicle: v,
    position: getVehiclePosition(v, i),
  }));

  const selectedPosition = selected
    ? vehicleCoords.find((c) => c.vehicle.id === selected)?.position ?? null
    : null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex-none px-4 py-3 bg-background rounded-b-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Map View
          </h1>
          <div className="flex items-center gap-4">
            {vehiclesLoading && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading vehicles...
              </span>
            )}
            <span className="flex items-center gap-2 font-label text-muted-foreground text-sm">
              <select 
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="bg-transparent border-none outline-none font-semibold text-primary"
              >
                <option value="">All Districts</option>
                <optgroup label="Western">
                  <option value="Colombo">Colombo</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Kalutara">Kalutara</option>
                </optgroup>
                <optgroup label="Central">
                  <option value="Kandy">Kandy</option>
                  <option value="Matale">Matale</option>
                  <option value="Nuwara Eliya">Nuwara Eliya</option>
                </optgroup>
                <optgroup label="Southern">
                  <option value="Galle">Galle</option>
                  <option value="Matara">Matara</option>
                  <option value="Hambantota">Hambantota</option>
                </optgroup>
                <optgroup label="Northern">
                  <option value="Jaffna">Jaffna</option>
                  <option value="Kilinochchi">Kilinochchi</option>
                  <option value="Mannar">Mannar</option>
                  <option value="Mullaitivu">Mullaitivu</option>
                  <option value="Vavuniya">Vavuniya</option>
                </optgroup>
                <optgroup label="Eastern">
                  <option value="Trincomalee">Trincomalee</option>
                  <option value="Batticaloa">Batticaloa</option>
                  <option value="Ampara">Ampara</option>
                </optgroup>
                <optgroup label="North Western">
                  <option value="Kurunegala">Kurunegala</option>
                  <option value="Puttalam">Puttalam</option>
                </optgroup>
                <optgroup label="North Central">
                  <option value="Anuradhapura">Anuradhapura</option>
                  <option value="Polonnaruwa">Polonnaruwa</option>
                </optgroup>
                <optgroup label="Uva">
                  <option value="Badulla">Badulla</option>
                  <option value="Monaragala">Monaragala</option>
                </optgroup>
                <optgroup label="Sabaragamuwa">
                  <option value="Ratnapura">Ratnapura</option>
                  <option value="Kegalle">Kegalle</option>
                </optgroup>
              </select>
              <List className="w-4 h-4" />
              {filteredVehicles.length} vehicles
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 gap-0">
        <div className="flex-1 relative z-0 min-h-[300px] pl-2 md:pl-4 pr-2 py-2">
          {/* Search by location - glass overlay on map */}
          <div
            ref={searchRef}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-2 md:px-0"
          >
            <div className="relative rounded-2xl border border-border bg-white dark:bg-card shadow-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/90 pointer-events-none" />
              <input
                type="text"
                value={locationSearchQuery}
                onChange={(e) => {
                  setLocationSearchQuery(e.target.value);
                  setLocationSearchOpen(true);
                }}
                onFocus={() => setLocationSearchOpen(true)}
                placeholder="Search by location..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-transparent text-foreground text-sm placeholder:text-muted-foreground/80 focus:outline-none focus:ring-0 border-0"
              />
              {districtFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setDistrictFilter("");
                    setLocationSearchQuery("");
                    setLocationSearchOpen(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:bg-white/20 dark:hover:bg-white/10 hover:text-foreground transition-colors"
                  aria-label="Clear location"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {locationSearchOpen && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border bg-white dark:bg-card shadow-xl overflow-hidden">
                  {locationSuggestions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelectLocation(name)}
                      className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-white/20 dark:hover:bg-white/10 flex items-center gap-3 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="h-full w-full rounded-xl overflow-hidden shadow-inner">
            <MapContainer
              center={SRI_LANKA_CENTER}
              zoom={SRI_LANKA_DEFAULT_ZOOM}
              className="h-full w-full rounded-xl"
              scrollWheelZoom={true}
              zoomControl={false}
              attributionControl={false}
            >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={isDark ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
            />
            <MapSync vehicles={filteredVehicles} />
            <FocusOnVehicle position={selectedPosition} />
            <FlyToSearch position={searchFlyToPosition} />
            <MapZoomControls />
            {vehicleCoords.map(({ vehicle, position }) => {
              const hasImage = vehicle.images?.[0] && !vehicle.images[0].endsWith("placeholder.svg");
              return (
                <Marker
                  key={vehicle.id}
                  position={position}
                  icon={carIcon}
                  eventHandlers={{
                    click: () => setSelected(vehicle.id),
                  }}
                >
                  <Popup className="rentx-vehicle-popup" minWidth={260} maxWidth={280}>
                    <div className="rentx-popup-content min-w-[240px] overflow-hidden rounded-xl">
                      <div className="relative h-28 w-full overflow-hidden bg-secondary">
                        {hasImage ? (
                          <img
                            src={vehicle.images![0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <MapPin className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {vehicle.rating}
                        </div>
                      </div>
                      <div className="bg-card p-3">
                        <p className="font-heading font-semibold text-foreground">{vehicle.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {vehicle.district || vehicle.location}, {vehicle.province}
                        </p>
                        <p className="mt-2 font-heading font-bold text-primary">{formatCurrency(vehicle.pricePerDay)}<span className="text-xs font-normal text-muted-foreground">/day</span></p>
                        <Link
                          to={`/vehicle/${vehicle.id}`}
                          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            </MapContainer>
          </div>
        </div>

        <div className="w-full lg:w-80 flex-shrink-0 overflow-y-auto bg-muted/30 dark:bg-muted/10 p-3 space-y-2 rounded-l-xl border-l border-border/50">
          {filteredVehicles.map((v) => {
            const hasImage = v.images?.[0] && !v.images[0].endsWith("placeholder.svg");
            const isSelected = selected === v.id;
            return (
              <div
                key={v.id}
                className={`group relative w-full overflow-hidden rounded-xl transition-all duration-200 border shadow-sm ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 bg-card"
                    : "border-border/60 bg-card hover:border-border hover:shadow-md"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelected(v.id)}
                  className="w-full text-left p-0 flex min-h-0"
                >
                  <div className="w-20 h-20 shrink-0 rounded-l-xl overflow-hidden bg-muted flex items-center justify-center">
                    {hasImage ? (
                      <img
                        src={v.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center py-2.5 pl-3 pr-10 gap-1">
                    <p className="font-heading font-semibold text-foreground text-sm leading-tight truncate">{v.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{v.district || v.location}, {v.province}</p>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="font-semibold text-primary text-sm">{formatCurrency(v.pricePerDay)}<span className="font-normal text-muted-foreground text-xs">/day</span></span>
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {v.rating}
                      </span>
                    </div>
                  </div>
                </button>
                <Link
                  to={`/vehicle/${v.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-sm"
                >
                  View
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
