import { useState } from "react";
import GateAnimation from '@/components/GateAnimation';
import AvatarGrid from "@/components/AvatarGrid";
import PreferencesModal, { PreferenceValues } from '@/components/PreferencesModal';
import ChatInterface from '@/components/ChatInterface';

// Define Avatar type here to be shared across components
interface Avatar {
  id: string;
  name: string;
  description: string;
  video?: string;
  color: string;
  image?: string; // For the chat interface
}

// This will hold the data needed to start a chat session
interface ChatData {
  avatar: Avatar;
  preferences: PreferenceValues;
}

const Index = () => {
  const [showGate, setShowGate] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [chatData, setChatData] = useState<ChatData | null>(null);

  const handleGateComplete = () => {
    setShowGate(false);
  };

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setShowPreferences(true);
  };

  // Updated to accept the PreferenceValues object from the modal
  const handleStartChat = (preferences: PreferenceValues) => {
    if (selectedAvatar) {
      setChatData({
        avatar: selectedAvatar,
        preferences, // Store the entire preferences object
      });
      setShowPreferences(false);
    }
  };

  const handleBackToHome = () => {
    setChatData(null);
    setSelectedAvatar(null);
    setShowPreferences(false);
  };

  // 1. Show Gate Animation first
  if (showGate) {
    return <GateAnimation onComplete={handleGateComplete} />;
  }

  // 2. If chat data is set, show the Chat Interface
  console.log(chatData)
  if (chatData) {
    return (
      <ChatInterface
        avatar={chatData.avatar}
        preferences={chatData.preferences} // Pass the preferences object
        onBackToHome={handleBackToHome}
      />
    );
  }

  // 3. Otherwise, show the Avatar Grid and the (hidden) Preferences Modal
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
