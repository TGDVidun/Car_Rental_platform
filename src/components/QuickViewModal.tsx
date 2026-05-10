import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Users, Fuel, Settings2, MapPin } from "lucide-react";
import type { Vehicle } from "@/data/vehicles";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";

interface QuickViewModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export default function QuickViewModal({ vehicle, onClose }: QuickViewModalProps) {
  if (!vehicle) return null;

  return (
    <AnimatePresence>
      {vehicle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-foreground">{vehicle.name}</h2>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {vehicle.location}, {vehicle.province}
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Close">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="h-52 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-24 h-24 text-primary/30">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-2-2.2-3.3C13 5.6 11.7 5 10.5 5H5.8C4.6 5 3.5 5.8 3.2 7L2 12v4c0 .6.4 1 1 1h2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{vehicle.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="chip text-xs"><Users className="w-3 h-3" /> {vehicle.seats} seats</span>
              <span className="chip text-xs"><Settings2 className="w-3 h-3" /> {vehicle.transmission}</span>
              <span className="chip text-xs"><Fuel className="w-3 h-3" /> {vehicle.fuel}</span>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium text-foreground">{vehicle.rating}</span>
              <span className="text-muted-foreground text-sm">({vehicle.reviewCount} reviews)</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-heading font-bold text-foreground">{formatCurrency(vehicle.pricePerDay)}</span>
                <span className="text-muted-foreground">/day</span>
              </div>
              <Link
                to={`/vehicle/${vehicle.id}`}
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg gradient-primary text-primary-foreground font-medium text-sm"
              >
                View Details
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
