import AvatarCard from "./AvatarCard";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";

interface Avatar {
  id: string;
  name: string;
  description: string;
  image?: string; // Optional image for avatars without video
  video?: string;
  color: string;
  avatarId?: string; // Optional ID for Heygen avatar
  avatarName?: string; // Optional name for Heygen avatar
  ethnicity: string; // New property
}

interface AvatarGridProps {
  onAvatarSelect: (avatar: Avatar) => void;
}

// --- Polished "Create Your Own" Card ---
const CreateNewCard = () => (
  <div className="group relative cursor-not-allowed rounded-full aspect-square overflow-hidden 
                 bg-zinc-900 border-2 border-dashed border-zinc-700 
                 flex flex-col items-center justify-center text-center p-6 
                 transition-all duration-500 hover:scale-105 hover:border-primary
                 hover:shadow-[0_0_25px_5px_rgba(239,68,68,0.4)]">
    <div className="absolute inset-0 z-0 bg-gradient-radial from-primary/10 via-zinc-900 to-zinc-900"></div>
    <div className="relative z-10 flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 border border-primary/50">
        <Plus className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-2xl font-bold text-white">Create Your Own</h3>
      <p className="text-sm text-zinc-400">Bring your perfect girlfriend to life.</p>
      
    
      <div className="mt-4 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full">
        <p className="text-xs font-semibold text-primary">
          One time payment 99.99 € per avatar
        </p>
      </div>

    </div>
  </div>
);

// --- NEW: Live User Count Component ---
const LiveUserCount = () => {
  // Initialize with a realistic base number plus some randomness
  const [count, setCount] = useState(Math.floor(Math.random() * 200) + 1234);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate fluctuation by adding a small random number (-2 to +2)
      const fluctuation = Math.floor(Math.random() * 5) - 2;
      setCount(prevCount => prevCount + fluctuation);
    }, 2500); // Update every 2.5 seconds

    // Clean up the interval when the component unmounts to prevent memory leaks
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Pulsating green dot for "live" effect */}
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <p className="text-md text-zinc-300">
        <span className="font-bold text-white">{count.toLocaleString()}</span> users online now
      </p>
    </div>
  );
};


const AvatarGrid = ({ onAvatarSelect }: AvatarGridProps) => {
const avatars: Avatar[] = [
    {
      id: "pamela",
      name: "Pamela",
      description: "Seductive & Confident",
      video: "/pamela-video.mp4",
      image: "/pamela.png",
      color: "from-red-500 to-pink-500",
      avatarId: "Katya_Chair_Sitting_public", 
      avatarName: "Pamela",
      ethnicity: "European",
    },
    {
      id: "angela",
      name: "Angela",
      description: "Sweet & Caring",
      color: "from-blue-400 to-purple-400",
      ethnicity: "Latina",
    },
    {
      id: "stella",
      name: "Stella",
      description: "Mysterious & Elegant",
      color: "from-purple-500 to-indigo-500",
      ethnicity: "Italian",
    },
    {
      id: "leyla",
      name: "Leyla",
      description: "Exotic & Passionate",
      color: "from-orange-500 to-red-500",
      ethnicity: "African",
    },
    {
      id: "sakura",
      name: "Sakura",
      description: "Gentle & Traditional",
      color: "from-pink-400 to-rose-400",
      ethnicity: "Asian",
    },
    {
      id: "ivana",
      name: "Ivana",
      description: "Bold & Adventurous",
      color: "from-yellow-500 to-amber-500",
      ethnicity: "Russian",
    },
    {
      id: "claire",
      name: "Claire",
      description: "Intellectual & Witty",
      color: "from-cyan-500 to-blue-500",
      ethnicity: "French",
    },
    {
      id: "katie",
      name: "Katie",
      description: "Playful & Fun",
      color: "from-green-500 to-teal-500",
      ethnicity: "American",
    },
  ];

  return (
    // --- Changed: Improved background ---
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-16">
      {/* --- Added: Vignette effect for atmosphere --- */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_rgba(10,10,10,1)_0%,_rgba(0,0,0,1)_70%)]"></div>
      <div className="absolute inset-0 bg-grid-zinc-900/20 [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
         {/* ✅ --- ADDED BRAND TITLE --- */}
          <h1 className="text-5xl font-semibold text-primary/80 tracking-widest mb-2 animate-fade-in-slow">
            MyGirl.Ai
          </h1>
          <h1 className="text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
            Choose Your <span className="text-primary">Girlfriend</span>
          </h1>
          <p className="text-lg text-zinc-400">
            Meet our exclusive collection of AI companions, or create your own.
          </p>
          
          {/* --- ADDED: Live user count is displayed here --- */}
          <LiveUserCount />

        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {avatars.map((avatar) => (
            <AvatarCard key={avatar.id} avatar={avatar} onSelect={onAvatarSelect} />
          ))}
          <CreateNewCard />
        </div>
      </div>
    </div>
  );
};

export default AvatarGrid;