import { useState, useEffect } from "react";
import { X, ShieldCheck, History } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface SafetyLog {
  id: number;
  photo_url: string;
  condition_type: string;
  note?: string;
  created_at: string;
}

interface SafetyHistoryModalProps {
  bookingId: number | null;
  onClose: () => void;
}

export default function SafetyHistoryModal({ bookingId, onClose }: SafetyHistoryModalProps) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<SafetyLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchLogs();
    }
  }, [bookingId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/bookings/${bookingId}/safety-logs`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setLogs(await res.json());
        // Fire-and-forget: Mark as read
        fetch(`http://127.0.0.1:8000/bookings/${bookingId}/safety-logs/read`, {
          method: "PATCH",
          headers: { "Authorization": `Bearer ${token}` }
        }).catch(err => console.error("Failed to mark read:", err));
      } else {
        throw new Error("Cannot fetch logs");
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to load safety history.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!bookingId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/30 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-primary">
            <History className="w-5 h-5" />
            <h2 className="font-heading font-bold text-lg text-foreground">Safety Log History</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-card/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Loading history...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-foreground font-bold">No Records Found</h3>
              <p className="text-sm text-muted-foreground">The renter hasn't submitted any safety photos yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6 border-l-2 border-border/60 pb-2">
                  {/* Timeline Dot */}
                  <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full bg-primary ring-4 ring-card" />
                  
                  <div className="bg-secondary/20 border border-border rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-border/50 flex justify-between items-center bg-secondary/30">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-primary text-primary-foreground tracking-wide uppercase shadow-sm">
                        Condition: {log.condition_type}
                      </span>
                    </div>
                    
                    <div className="p-4 flex flex-col sm:flex-row gap-4">
                      {log.photo_url && (
                        <div className="w-full sm:w-48 h-32 shrink-0 rounded-xl overflow-hidden bg-card border border-border/50">
                          <img src={log.photo_url} alt="Safety Check" className="w-full h-full object-cover" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-muted-foreground mb-1">Renter's Notes</h4>
                        <p className="text-sm text-foreground bg-card border border-border/30 rounded-xl p-3 min-h-[5rem]">
                          {log.note || <span className="italic text-muted-foreground/60">No additional notes provided.</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
