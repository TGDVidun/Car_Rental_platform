import { useState, useEffect } from "react";
import { X, Camera, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUploadZone from "./ImageUploadZone";

interface SafetyLogModalProps {
  bookingId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CONDITION_OPTIONS = [
  "Excellent",
  "Good",
  "Normal Wear",
  "Needs Maintenance",
  "Damaged"
];

export default function SafetyLogModal({ bookingId, isOpen, onClose, onSuccess }: SafetyLogModalProps) {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [condition, setCondition] = useState<string>("Good");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setImageUrl("");
      setCondition("Good");
      setNote("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!imageUrl) {
      toast({
        title: "Photo Required",
        description: "Please upload a clear photo of the vehicle.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      console.log("Submitting safety log for booking:", bookingId);
      
      const response = await fetch(`http://127.0.0.1:8000/bookings/${bookingId}/safety-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          photo_url: imageUrl,
          condition_type: condition,
          note: note.trim() || null
        })
      });

      if (response.ok) {
        toast({
          title: "Safety Log Submitted",
          description: "Thank you! The vehicle owner will review the condition log."
        });
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Safety log submission failed:", response.status, errorData);
        throw new Error(errorData.detail || "Failed to submit safety log.");
      }
    } catch (error: any) {
      console.error("Safety log submission error:", error);
      toast({
        title: "Submission Error",
        description: error.message || "There was a problem submitting your safety check.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-3xl shadow-xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/30 shrink-0">
          <div className="flex items-center gap-2 text-primary">
            <Camera className="w-5 h-5" />
            <h2 className="font-heading font-bold text-lg text-foreground">Submit Safety Check</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">1. Upload Current Photo *</label>
            <p className="text-xs text-muted-foreground mb-3">Upload a clear picture showing the current condition of the vehicle.</p>
            <ImageUploadZone
              onUploadSuccess={(url) => setImageUrl(url)}
              onRemove={() => setImageUrl("")}
              currentImage={imageUrl}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">2. Current Condition *</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CONDITION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setCondition(opt)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    condition === opt
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/40 hover:bg-secondary"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">3. Additional Notes (Optional)</label>
            <textarea
              className="w-full h-24 rounded-xl border border-border bg-secondary/20 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Any new scratches, issues, or details the owner should know?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-secondary/30 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-transparent text-muted-foreground font-medium rounded-xl hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Log
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
