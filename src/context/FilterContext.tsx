import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehicles as fallbackVehicles, type Vehicle } from '@/data/vehicles';
import { getProvinceForDistrict } from '@/data/mapLocations';

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

interface FilterContextType {
  selectedProvince: string;
  setSelectedProvince: (p: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (d: string) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  selectedTypes: string[];
  setSelectedTypes: (t: string[]) => void;
  maxPrice: number;
  setMaxPrice: (p: number) => void;
  minSeats: number;
  setMinSeats: (s: number) => void;
  driverOnly: boolean;
  setDriverOnly: (d: boolean) => void;
  transmission: string;
  setTransmission: (t: string) => void;
  sort: string;
  setSort: (s: string) => void;
  filteredVehicles: Vehicle[];
  isLoading: boolean;
  isError: boolean;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(150000);
  const [minSeats, setMinSeats] = useState(1);
  const [driverOnly, setDriverOnly] = useState(false);
  const [transmission, setTransmission] = useState("");
  const [sort, setSort] = useState("rating");
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);

  const { data: remoteVehicles, isLoading, isError } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const response = await fetch("http://127.0.0.1:8000/vehicles");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      return data.map(transformVehicle);
    }
  });

  const availableVehicles = useMemo(() => remoteVehicles?.length ? remoteVehicles : fallbackVehicles, [remoteVehicles]);

  useEffect(() => {
    let result = [...availableVehicles].filter((v) => {
      if (selectedTypes.length && !selectedTypes.includes(v.type)) return false;
      if (selectedProvince && v.province.toLowerCase() !== selectedProvince.toLowerCase()) return false;
      if (selectedDistrict && v.district?.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      if (selectedCity) {
        const cityMatch = v.city?.toLowerCase() === selectedCity.toLowerCase();
        const locMatch = v.location?.toLowerCase() === selectedCity.toLowerCase();
        if (!cityMatch && !locMatch) return false;
      }
      if (v.pricePerDay > maxPrice) return false;
      if (v.seats < minSeats) return false;
      if (driverOnly && !v.hasDriverOption) return false;
      if (transmission && v.transmission !== transmission) return false;
      return true;
    });

    result.sort((a, b) => {
      if (sort === "price-asc") return a.pricePerDay - b.pricePerDay;
      if (sort === "price-desc") return b.pricePerDay - a.pricePerDay;
      if (sort === "rating") return b.rating - a.rating;
      return b.year - a.year;
    });

    setFilteredVehicles(result);
  }, [availableVehicles, selectedTypes, selectedProvince, selectedDistrict, selectedCity, maxPrice, minSeats, driverOnly, transmission, sort]);

  const clearFilters = () => {
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedCity("");
    setSelectedTypes([]);
    setMaxPrice(150000);
    setMinSeats(1);
    setDriverOnly(false);
    setTransmission("");
    setSort("rating");
  };

  return (
    <FilterContext.Provider value={{
      selectedProvince, setSelectedProvince,
      selectedDistrict, setSelectedDistrict,
      selectedCity, setSelectedCity,
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
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
