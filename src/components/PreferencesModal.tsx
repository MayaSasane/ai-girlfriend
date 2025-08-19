import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Import Label
import { Slider } from "@/components/ui/slider"; // Import Slider
import { Heart, MessageCircle, Flame, Lock } from "lucide-react";

// --- TYPE DEFINITIONS ---
interface Avatar {
  id: string;
  name: string;
  video?: string;
  color: string;
  description: string;
}

// Type for the slider values object
export interface PreferenceValues {
  soft: number;
  emotionalSupportive: number;
  flirt: number;
  dirty: number;
}

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatar: Avatar | null;
  // Changed: onStartChat now accepts an object of preference values
  onStartChat: (preferences: PreferenceValues) => void; 
}

// --- COMPONENT ---
const PreferencesModal = ({
  isOpen,
  onClose,
  avatar,
  onStartChat,
}: PreferencesModalProps) => {
  // Changed: State is now an object holding values for each slider
  const [preferences, setPreferences] = useState<PreferenceValues>({
    soft: 50,
    emotionalSupportive: 70,
    flirt: 30,
    dirty: 0,
  });

  const preferenceSliders = [
    { id: 'soft', title: 'Soft & Caring', icon: Heart },
    { id: 'emotionalSupportive', title: 'Supportive', icon: MessageCircle },
    { id: 'flirt', title: 'Flirty', icon: Flame },
    { id: 'dirty', title: 'Passionate', icon: Lock },
  ];

  // Handler for when any slider's value changes
  const handleSliderChange = (trait: keyof PreferenceValues, value: number[]) => {
    setPreferences(prev => ({
      ...prev,
      [trait]: value[0],
    }));
  };

  // Changed: Passes the entire preferences object to the parent
  const handleStartChat = () => {
    onStartChat(preferences);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-md bg-card border-border rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden">
        <DialogHeader className="p-0">
          <DialogTitle className="text-xl sm:text-2xl text-center mb-4">
            Create Your Experience with{" "}
            <span className="empire-text">{avatar?.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5">
          {/* Avatar Preview */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0">
            {avatar?.video ? (
              <video src={avatar.video} className="w-full h-full object-cover" muted playsInline preload="metadata" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${avatar?.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{avatar?.name?.[0]}</span>
              </div>
            )}
          </div>

          {/* --- SLIDERS SECTION --- */}
          <div className="w-full space-y-4">
            {preferenceSliders.map(({ id, title, icon: Icon }) => (
              <div key={id} className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={id} className="flex items-center gap-2 font-semibold">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {title}
                  </Label>
                  <span className="text-sm font-mono text-primary w-8 text-right">
                    {preferences[id as keyof PreferenceValues]}%
                  </span>
                </div>
                <Slider
                  id={id}
                  defaultValue={[preferences[id as keyof PreferenceValues]]}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleSliderChange(id as keyof PreferenceValues, value)}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          
          {/* --- CTA --- */}
          <div className="text-center space-y-2 pt-2">
            <Button
              onClick={handleStartChat}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary-glow text-white font-bold px-8 py-3 hover:scale-[1.02] transition-transform"
            >
              Start Your 3-Minute Free Trial
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Unlimited conversations for just €30/month after trial
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreferencesModal;