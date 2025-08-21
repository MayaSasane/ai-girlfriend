import { useEffect, useRef } from "react";

interface GateAnimationProps {
  onComplete: () => void;
}

const GateAnimation = ({ onComplete }: GateAnimationProps) => {
  // ✅ 1. Create a ref to access the video element directly
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // ✅ 2. Try to programmatically play the video when the component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        // This catch block will run if autoplay is blocked
        console.error("Autoplay was blocked by the browser:", error);
        // You could show a fallback "Click to play" button here if needed
      });
    }

    // Fallback timer remains useful
    const timer = setTimeout(() => {
      onComplete();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <video
        // ✅ 3. Attach the ref to the video element
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="/Video_Generation_with_Scene_Edits.mp4"
        // autoPlay can be kept as a fallback but the ref is more reliable
        autoPlay 
        muted
        playsInline
        onEnded={onComplete}
      />
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
};

export default GateAnimation;