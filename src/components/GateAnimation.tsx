import { useEffect } from "react";

interface GateAnimationProps {
  onComplete: () => void;
}

const GateAnimation = ({ onComplete }: GateAnimationProps) => {
  useEffect(() => {
    // Automatically trigger onComplete when the video ends
    const timer = setTimeout(() => {
      onComplete();
    }, 10000); // fallback in case video doesn't fire 'ended'

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/Video_Generation_with_Scene_Edits.mp4"
        autoPlay
        muted
        playsInline
        onEnded={onComplete}
      />

      {/* Optional overlay for dimming or branding */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
};

export default GateAnimation;
