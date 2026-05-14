import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Users, Fuel, Settings2, MapPin, Shield, ChevronRight } from "lucide-react";
import type { Vehicle } from "@/data/vehicles";
import { formatCurrency, getDepositAmount } from "@/lib/utils";

export function VehicleCardSkeleton() {
  return (
    <div className="glass-card animate-pulse rounded-2xl relative overflow-hidden border border-border/50">
      <div className="h-56 bg-muted mb-4" />
      <div className="p-5 pt-0">
        <div className="h-5 bg-muted rounded w-3/4 mb-3" />
        <div className="h-4 bg-muted rounded w-1/2 mb-5" />
        <div className="flex gap-2 mb-6">
          <div className="h-7 bg-muted rounded-full w-16" />
          <div className="h-7 bg-muted rounded-full w-16" />
          <div className="h-7 bg-muted rounded-full w-16" />
        </div>
        <div className="flex justify-between items-end border-t border-border/40 pt-4">
           <div className="h-8 bg-muted rounded w-1/3" />
           <div className="h-10 bg-muted rounded-xl w-28" />
        </div>
      </div>
    </div>
  );
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const deposit = getDepositAmount(vehicle.type);

  return (
    <Link to={`/vehicle/${vehicle.id}`} className="block">
      <motion.div
        whileHover={{ y: -8, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col h-full"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Image Section */}
        <div className="relative h-56 bg-secondary/30 overflow-hidden flex items-center justify-center">
          {vehicle.images?.[0] && !vehicle.images[0].endsWith("placeholder.svg") ? (
            <motion.img
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              src={vehicle.images[0]}
              alt={vehicle.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Car className="w-24 h-24 text-primary/20" />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {vehicle.hasDriverOption && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/30 backdrop-blur-md">
                Driver Available
              </span>
            )}
          </div>
          
          <div className="absolute top-3 right-3 z-10">
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md border border-white/10 capitalize">
              {vehicle.type}
            </span>
          </div>
          
          {/* Gradient overlay for better text contrast at bottom if we had any, or just aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1 relative z-20 bg-card">
          {/* Title & Rating */}
          <div className="flex items-start justify-between mb-2 gap-4">
            <h3 className="font-heading font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {vehicle.name}
            </h3>
            <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md shrink-0 border border-border/50">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold text-foreground">{vehicle.rating}</span>
              <span className="text-xs text-muted-foreground">({vehicle.reviewCount})</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
            <MapPin className="w-4 h-4 text-primary/70" />
            <span className="line-clamp-1">
              {vehicle.district || vehicle.location}, {vehicle.province}
            </span>
          </div>

          {/* Feature Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { icon: Users, label: vehicle.seats },
              { icon: Settings2, label: vehicle.transmission },
              { icon: Fuel, label: vehicle.fuel }
            ].map((tag, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/60 border border-border/40 text-xs font-medium text-foreground capitalize group-hover:border-primary/20 transition-colors">
                <tag.icon className="w-3.5 h-3.5 text-primary" />
                {tag.label}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-border/40 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-heading font-extrabold text-foreground tracking-tight">
                  {formatCurrency(vehicle.pricePerDay)}
                </span>
                <span className="text-sm text-muted-foreground font-medium">/day</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5 bg-primary/5 w-fit px-2 py-0.5 rounded text-primary-foreground/80 border border-primary/10">
                <Shield className="w-3 h-3 text-primary" />
                <span className="text-foreground/80 font-medium">Deposit: {formatCurrency(deposit)}</span>
              </div>
            </div>
            
            <button className="flex items-center justify-center gap-1.5 w-11 h-11 rounded-xl bg-secondary text-foreground group-hover:gradient-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function Car(props: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-2-2.2-3.3C13 5.6 11.7 5 10.5 5H5.8C4.6 5 3.5 5.8 3.2 7L2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}
