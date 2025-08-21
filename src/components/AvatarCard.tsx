import { useRef } from "react";

interface Avatar {
  id: string;
  name: string;
  description: string;
  ethnicity: string; // ✅ Added ethnicity property
  image?: string;
  video?: string;
  color: string;
  avatarId?: string;
  avatarName?: string;
}

interface AvatarCardProps {
  avatar: Avatar;
  onSelect: (avatar: Avatar) => void;
}

const AvatarCard = ({ avatar, onSelect }: AvatarCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) videoRef.current.play();
  };

  const handleMouseLeave = () => {
    if (videoRef.current) videoRef.current.pause();
  };

  return (
    <div
      onClick={() => onSelect(avatar)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative cursor-pointer rounded-full aspect-square overflow-hidden bg-zinc-950 
                 transition-all duration-500 hover:scale-105 
                 shadow-[0_0_12px_2px_rgba(239,68,68,0.3),_0_0_4px_1px_rgba(255,100,100,0.2)] 
                 hover:shadow-[0_0_30px_6px_rgba(239,68,68,0.5),_0_0_10px_2px_rgba(255,100,100,0.4)]"
    >
      <div className="absolute inset-0 rounded-full shadow-inner shadow-black/50 z-30 pointer-events-none"></div>
      
      <div className="relative z-10 w-full h-full">
        {avatar.video ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover rounded-full"
            src={avatar.video}
            poster={avatar.image}
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${avatar.color} flex items-center justify-center rounded-full`}>
            <span className="text-8xl font-bold text-white/20">{avatar.name[0]}</span>
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 z-20 flex items-end justify-center bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 text-center">
        <div>
          <h3 className="text-2xl font-bold text-primary drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
            {avatar.name}
          </h3>
          {/* ✅ ADDED: Ethnicity displayed right below the name */}
          <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {avatar.ethnicity}
          </p>
          <p className="text-sm text-zinc-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] line-clamp-2 mt-1">
            {avatar.description}
          </p>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-1/2 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-500 z-20 pointer-events-none"></div>
    </div>
  );
};

export default AvatarCard;