import { useState } from "react";
import GateAnimation from '@/components/GateAnimation';
import AvatarGrid from '@/components/AvatarGrid';
import PreferencesModal, { PreferenceValues } from '@/components/PreferencesModal';
import ChatInterface from '@/components/ChatInterface';
import { Button } from "@/components/ui/button"; // Import the Button component

// --- INTERFACES ---
interface Avatar {
  id: string;
  name: string;
  description: string;
  image?: string;
  video?: string;
  color: string;
  avatarId?: string; // ✅ Set to optional
  avatarName?: string; // ✅ Set to optional
  ethnicity?: string; // ✅ Set to optional to avoid future errors
}

interface ChatData {
  avatar: Avatar;
  preferences: PreferenceValues;
}

// --- MAIN COMPONENT ---
const Index = () => {
  const [showGate, setShowGate] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [apiResponse, setApiResponse] = useState(''); // State for API test

  const handleGateComplete = () => {
    setShowGate(false);
  };

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setShowPreferences(true);
  };

  const handleStartChat = (preferences: PreferenceValues) => {
    if (selectedAvatar) {
      setChatData({
        avatar: selectedAvatar,
        preferences,
      });
      setShowPreferences(false);
    }
  };

  const handleBackToHome = () => {
    setChatData(null);
    setSelectedAvatar(null);
    setShowPreferences(false);
  };

  // --- New function to test the API ---
  const testApi = async () => {
    setApiResponse('Loading...');
    try {
      const response = await fetch('/api/hello');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Failed to fetch from API:", error);
      setApiResponse(`Error fetching from API: ${error}`);
    }
  };

  if (showGate) {
    return <GateAnimation onComplete={handleGateComplete} />;
  }

  if (chatData) {
    return (
      <ChatInterface
        avatar={chatData.avatar}
        preferences={chatData.preferences}
        onBackToHome={handleBackToHome}
      />
    );
  }

  return (
    <>
      <AvatarGrid onAvatarSelect={handleAvatarSelect} />
      
      <PreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        avatar={selectedAvatar}
        onStartChat={handleStartChat}
      />
    </>
  );
};

export default Index;
