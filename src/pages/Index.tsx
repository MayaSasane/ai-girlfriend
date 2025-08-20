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
  video?: string;
  color: string;
  image?: string;
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

      {/* --- Added: Test section for the API --- */}
      <div className="fixed bottom-4 left-4 bg-zinc-800 p-4 rounded-lg shadow-lg text-white z-50 max-w-sm">
        <h3 className="font-bold mb-2">API Test Panel</h3>
        <p className="text-xs text-zinc-400 mb-2">Click to test the Vercel serverless function.</p>
        <Button onClick={testApi}>Call /api/hello</Button>
        {apiResponse && (
          <pre className="mt-2 text-xs bg-black/50 p-2 rounded whitespace-pre-wrap break-all">{apiResponse}</pre>
        )}
      </div>
    </>
  );
};

export default Index;
