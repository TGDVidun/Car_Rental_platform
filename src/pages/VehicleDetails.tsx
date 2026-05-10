import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Users, Fuel, Settings2, MapPin, Shield, Calendar,
  ChevronLeft, Clock, ChevronRight, Snowflake, Navigation,
  Bluetooth, Plug, Baby, ShieldCheck, UserRound, Car, Phone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, getDepositAmount } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  addMonths,
  subMonths,
  startOfMonth,
  getDaysInMonth,
  getISODay,
  format,
  isSameDay,
  isAfter,
  differenceInDays,
  startOfDay,
} from "date-fns";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Returns booked date keys (yyyy-MM-dd) for the given month for demo. */
function getBookedDatesForMonth(month: Date): Set<string> {
  const set = new Set<string>();
  const y = month.getFullYear();
  const m = month.getMonth();
  [5, 6, 7, 12, 13, 19, 20, 21].forEach((d) => {
    if (d <= getDaysInMonth(month)) set.add(format(new Date(y, m, d), "yyyy-MM-dd"));
  });
  return set;
}

// Helper to transform backend vehicle to frontend format
const transformVehicle = (v: any) => ({
  id: v.id.toString(),
  name: v.name,
  type: (v.type || "car").toLowerCase(),
  seats: v.seats || 5,
  transmission: (v.transmission || "automatic").toLowerCase(),
  location: v.location,
  province: v.province || "Western",
  pricePerDay: v.price_per_day,
  driverPricePerDay: v.driver_price_per_day || 1500,
  rating: v.rating || 5.0,
  reviewCount: v.review_count || 0,
  hasDriverOption: v.has_driver,
  images: v.image_url ? [v.image_url] : [],
  fuel: v.fuel_type || "Petrol",
  year: 2024,
  description: v.description || ""
});

function CarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-2-2.2-3.3C13 5.6 11.7 5 10.5 5H5.8C4.6 5 3.5 5.8 3.2 7L2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

export default function VehicleDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const response = await fetch(`http://127.0.0.1:8000/vehicles/${id}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      return transformVehicle(data);
    }
  });

  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [pickStart, setPickStart] = useState<Date | null>(null);
  const [pickEnd, setPickEnd] = useState<Date | null>(null);
  const [withDriver, setWithDriver] = useState(false);

  const images = vehicle?.images?.filter((src) => src && !src.endsWith("placeholder.svg")) ?? [];
  const hasImages = images.length > 0;
  const mainImage = hasImages ? images[selectedImageIndex % images.length] : null;

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium">Loading car details...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">Vehicle Not Found</h1>
        <Link to="/search" className="text-primary hover:underline">Browse all vehicles</Link>
      </div>
    );
  }

  const handleBooking = async () => {
    if (!pickStart || !pickEnd) {
      toast({
        title: "Select Dates",
        description: "Please select start and end dates from the calendar.",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please log in to make a reservation.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setBookingLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicle_id: parseInt(id!),
          start_date: pickStart.toISOString(),
          end_date: pickEnd.toISOString(),
          with_driver: withDriver
        })
      });

      if (response.ok) {
        toast({
          title: "Reservation Requested!",
          description: "Your booking request has been sent to the owner for approval.",
        });
        navigate("/search");
      } else {
        const errData = await response.json();
        toast({
          title: "Booking Failed",
          description: errData.detail || "Could not complete the reservation.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Network Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const numDays =
    pickStart && pickEnd
      ? Math.max(1, differenceInDays(pickEnd, pickStart) + 1)
      : pickStart
        ? 1
        : 3;
  const subtotal = vehicle.pricePerDay * numDays;
  const driverFee = withDriver ? vehicle.driverPricePerDay * numDays : 0;
  const depositAmount = getDepositAmount(vehicle.type);
  const total = subtotal + driverFee + depositAmount;

  const currentMonthStart = startOfMonth(new Date());
  const canGoToPrevMonth = isAfter(calendarMonth, currentMonthStart);
  const firstDay = startOfMonth(calendarMonth);
  const daysInMonth = getDaysInMonth(calendarMonth);
  const offset = getISODay(firstDay) - 1;
  const bookedInMonth = getBookedDatesForMonth(calendarMonth);
  const calendarCells: (Date | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i + 1)),
  ];

  const handleDateClick = (d: Date) => {
    const today = startOfDay(new Date());
    const target = startOfDay(d);
    
    // Disable past dates (but allow today)
    if (target < today) return;
    
    const key = format(d, "yyyy-MM-dd");
    if (bookedInMonth.has(key)) return;
    
    if (!pickStart || (pickStart && pickEnd)) {
      setPickStart(target);
      setPickEnd(null);
      return;
    }
    
    if (target < pickStart) {
      setPickStart(target);
      setPickEnd(pickStart);
    } else {
      setPickEnd(target);
    }
  };

  const isInRange = (d: Date) => {
    if (!pickStart || !pickEnd) return false;
    const t = startOfDay(d);
    const s = startOfDay(pickStart);
    const e = startOfDay(pickEnd);
    return (t >= s && t <= e) || (t >= e && t <= s);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/search" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to search
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left */}
        <div className="flex-1">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Gallery */}
            <div className="glass-card mb-6">
              <div className="relative h-64 sm:h-80 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg overflow-hidden flex items-center justify-center mb-4 group">
                <AnimatePresence mode="wait">
                  {mainImage ? (
                    <motion.img
                      key={mainImage}
                      src={mainImage}
                      alt={vehicle.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <CarIcon className="w-32 h-32 text-primary/20" />
                  )}
                </AnimatePresence>
                {hasImages && images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex((i) => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {hasImages ? (
                  images.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      className={`w-20 h-14 rounded-lg shrink-0 overflow-hidden flex items-center justify-center transition-all duration-200 ${i === selectedImageIndex
                        ? "ring-2 ring-primary bg-primary/10 scale-[1.02]"
                        : "bg-secondary hover:ring-2 hover:ring-primary/50 hover:bg-primary/5"
                        }`}
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))
                ) : (
                  <div className="w-20 h-14 rounded-lg shrink-0 flex items-center justify-center bg-secondary">
                    <CarIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="glass-card mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-heading font-bold text-foreground">{vehicle.name}</h1>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {vehicle.location}, {vehicle.province}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-heading font-bold text-lg text-foreground">{vehicle.rating}</span>
                  <span className="text-sm text-muted-foreground">({vehicle.reviewCount})</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{vehicle.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Users, label: "Seats", value: vehicle.seats },
                  { icon: Settings2, label: "Transmission", value: vehicle.transmission },
                  { icon: Fuel, label: "Fuel", value: vehicle.fuel },
                  { icon: Calendar, label: "Year", value: vehicle.year },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-lg bg-secondary text-center">
                    <item.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="font-label text-muted-foreground">{item.label}</p>
                    <p className="font-heading font-semibold text-foreground capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="glass-card mb-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Features & Includes</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Snowflake, label: "Air Conditioning" },
                  { icon: Navigation, label: "GPS Navigation" },
                  { icon: Bluetooth, label: "Bluetooth Audio" },
                  { icon: Plug, label: "USB Charging" },
                  { icon: Baby, label: "Child Seat Available" },
                  { icon: ShieldCheck, label: "Insurance Included" },
                  { icon: vehicle.hasDriverOption ? UserRound : Car, label: vehicle.hasDriverOption ? "Driver Available" : "Self-Drive Only" },
                  { icon: Phone, label: "24/7 Roadside Assist" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-foreground">
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Availability calendar */}
            <div className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-foreground">Availability</h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((m) => subMonths(m, 1))}
                    disabled={!canGoToPrevMonth}
                    className="p-2 rounded-lg hover:bg-secondary text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-heading font-medium text-foreground min-w-[10rem] text-center">
                    {format(calendarMonth, "MMMM yyyy")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
                    className="p-2 rounded-lg hover:bg-secondary text-foreground transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAY_LABELS.map((d) => (
                  <span key={d} className="font-label text-muted-foreground py-1 text-xs">{d}</span>
                ))}
                {calendarCells.map((cell, i) => {
                  if (!cell) return <div key={`empty-${i}`} />;
                  const key = format(cell, "yyyy-MM-dd");
                  const booked = bookedInMonth.has(key);
                  const today = startOfDay(new Date());
                  const isPast = startOfDay(cell) < today;
                  const selected = (pickStart && isSameDay(cell, pickStart)) || (pickEnd && isSameDay(cell, pickEnd));
                  const inRange = isInRange(cell);
                  
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={booked || isPast}
                      onClick={() => handleDateClick(cell)}
                      className={`py-2 rounded-lg text-sm transition-colors relative ${booked
                        ? "bg-destructive/10 text-destructive line-through cursor-not-allowed"
                        : isPast
                        ? "text-muted-foreground opacity-30 cursor-not-allowed"
                        : selected
                        ? "bg-primary text-primary-foreground font-semibold shadow-md"
                        : inRange
                        ? "bg-primary/20 text-foreground"
                        : "bg-secondary text-foreground hover:bg-primary/10 cursor-pointer"
                        }`}
                    >
                      {format(cell, "d")}
                      {isSameDay(cell, today) && !selected && (
                         <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-secondary" /> Available</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-destructive/20" /> Booked</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary" /> Selected</span>
              </div>
              {(pickStart || pickEnd) && (
                <p className="mt-3 text-sm text-foreground">
                  {pickStart && format(pickStart, "MMM d, yyyy")}
                  {pickEnd && ` — ${format(pickEnd, "MMM d, yyyy")}`}
                  {pickStart && !pickEnd && " (click another date for range)"}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sticky Booking Summary */}
        <div className="w-full lg:w-80">
          <div className="glass-card sticky top-24">
            <h3 className="font-heading font-semibold text-foreground mb-4">Booking Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rent ({formatCurrency(vehicle.pricePerDay)} × {numDays} days)</span>
                <span className="text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              {withDriver && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Driver ({formatCurrency(vehicle.driverPricePerDay)} × {numDays} days)</span>
                  <span className="text-foreground">{formatCurrency(driverFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                <span className="text-muted-foreground">Refundable Deposit</span>
                <span className="text-foreground">{formatCurrency(depositAmount)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-heading font-bold text-lg">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{formatCurrency(total)}</span>
              </div>
            </div>

            {vehicle.hasDriverOption && (
              <div className="p-4 rounded-xl bg-secondary/50 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Add Professional Driver</span>
                </div>
                <button
                  onClick={() => setWithDriver(!withDriver)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${withDriver ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${withDriver ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            )}

            <button
              disabled={bookingLoading}
              onClick={handleBooking}
              className={`w-full py-3 rounded-lg font-medium text-sm mb-3 flex items-center justify-center gap-2 transition-all ${bookingLoading
                ? "bg-muted text-muted-foreground"
                : "gradient-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30"
                }`}
            >
              {bookingLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                "Reserve Now"
              )}
            </button>
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> Free cancellation up to 24h before
            </p>

            <div className="mt-6 p-3 rounded-lg bg-secondary">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Clock className="w-4 h-4 text-accent" />
                <span>Usually responds in 30 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
