import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Clock, ArrowLeft, Volume2, Loader2, X, Phone, Video, Settings, MoreHorizontal, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SubscriptionModal from './SubscriptionModal';
import { PreferenceValues } from './PreferencesModal';
import { Room, RoomEvent, Track } from 'livekit-client';

// --- INTERFACES & SUB-COMPONENTS ---
interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

interface AvatarData {
  id: string;
  name: string;
  image?: string;
  color: string;
  description: string;
  avatarId: string;
}

interface ChatInterfaceProps {
  avatar: AvatarData;
  preferences: PreferenceValues;
  onBackToHome: () => void;
}

const TypingIndicator = ({ avatar }: { avatar: AvatarData }) => (
  <div className="flex items-end gap-3 justify-start">
    <img src={avatar.image} className="w-8 h-8 rounded-full object-cover self-start" alt="avatar" />
    <div className="px-4 py-2.5 rounded-2xl text-white/90 bg-[#28282B] rounded-bl-none">
      <div className="flex items-center justify-center space-x-1.5 h-5">
        <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></span>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const ChatInterface = ({ avatar, preferences, onBackToHome }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamState, setStreamState] = useState<'initial' | 'connecting' | 'connected' | 'error'>('initial');

  const [timeLeft, setTimeLeft] = useState(180);
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [timerStarted, setTimerStarted] = useState(true);

  // This function ONLY makes the avatar speak the provided text.
  const handleTextToSpeech = async (text: string) => {
    if (streamState !== 'connected' || !sessionId) {
      console.warn("TTS called but session is not ready.");
      toast({ title: "Avatar Not Ready", description: "The connection isn't active yet.", variant: "destructive" });
      return;
    }
    try {
      await fetch('/api/heygen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SPEAK', payload: { sessionId, text } }),
      });
    } catch (error) {
      console.error("Heygen speak error:", error);
      toast({ title: "Avatar Error", description: "The avatar could not speak.", variant: "destructive" });
    }
  };
  
  // This function handles the full chat flow: gets a new AI response, then speaks it.
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isTrialActive) return;

    const userMessage: Message = { id: Date.now().toString(), content: inputMessage, isUser: true };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsAiTyping(true);

    let aiResponseContent = '';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(({ isUser, content }) => ({ role: isUser ? 'user' : 'assistant', content })),
          avatar,
          preferences
        }),
      });

      if (!response.ok || !response.body) throw new Error('Failed to get a response from the AI.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const aiMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiMessageId, content: '', isUser: false }]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        aiResponseContent += chunk;
        setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, content: aiResponseContent } : msg));
      }
    } catch (error) {
      console.error("Chat API error:", error);
      toast({ title: "Error", description: "Could not connect to the AI.", variant: "destructive" });
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsAiTyping(false);
      if (aiResponseContent) {
        await handleTextToSpeech(aiResponseContent);
      }
    }
  };

  useEffect(() => {
    let peerConnection: RTCPeerConnection | null = null;
    let newSessionId: string | null = null;

    const initialize = async () => {
      setStreamState('connecting');
      try {
        const sessionResponse = await fetch('/api/heygen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'CREATE_SESSION', payload: { avatarId: avatar.avatarId } }),
        });

        if (!sessionResponse.ok) {
          const errorData = await sessionResponse.json();
          throw new Error(errorData.error || "Failed to create Heygen session.");
        }
        
        const sessionInfo = await sessionResponse.json();
        newSessionId = sessionInfo.session_id;
        setSessionId(newSessionId);

        peerConnection = new RTCPeerConnection({ iceServers: sessionInfo.ice_servers2 });

        const mediaStream = new MediaStream();
        if (videoRef.current) videoRef.current.srcObject = mediaStream;

        peerConnection.ontrack = (event: RTCTrackEvent) => {
          mediaStream.addTrack(event.track);
        };

        await peerConnection.setRemoteDescription(new RTCSessionDescription(sessionInfo.sdp));
        const sdpAnswer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(sdpAnswer);
        
        await fetch('/api/heygen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'START_SESSION', payload: { sessionId: newSessionId, sdpAnswer } }),
        });

        setStreamState('connected');

      } catch (error: any) {
        console.error("Heygen Initialization Error:", error);
        setStreamState('error');
        toast({ title: "Avatar Connection Failed", description: error.message, variant: "destructive" });
      }
    };

    initialize();

    return () => {
      const stopSession = async () => {
        peerConnection?.close();
        if (newSessionId) {
          await fetch('/api/heygen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'CLOSE_SESSION', payload: { sessionId: newSessionId } }),
          }).catch(err => console.error("Failed to close session:", err));
        }
      };
      stopSession();
    };
  }, [avatar.avatarId, toast]);

  const getDominantPreference = (prefs: PreferenceValues): keyof PreferenceValues => {
    return Object.keys(prefs).reduce((a, b) => prefs[a as keyof PreferenceValues] > prefs[b as keyof PreferenceValues] ? a : b) as keyof PreferenceValues;
  };

  useEffect(() => {
    if (streamState === 'connected') {
      const dominantPref = getDominantPreference(preferences);
      const welcomeMessages = {
        soft: `Hi there, sweetie! I'm ${avatar.name}. I'm so happy to meet you. What's on your mind today?`,
        emotionalSupportive: `Hello beautiful soul, I'm ${avatar.name}. I'm here for you completely. Tell me what's in your heart.`,
        flirt: `Well hello there... I'm ${avatar.name}, and I've been waiting for someone like you. What brings you to me tonight?`,
        dirty: `Mmm, hello there... I'm ${avatar.name}. I can already tell this is going to be fun...`,
      };
      const welcomeText = welcomeMessages[dominantPref] || welcomeMessages.soft;
      const welcomeMessage: Message = { id: '1', content: welcomeText, isUser: false };
      setMessages([welcomeMessage]);
      
      const timeoutId = setTimeout(() => handleTextToSpeech(welcomeText), 500);
      return () => clearTimeout(timeoutId);
    }
  }, [streamState, avatar.name, preferences]);

  useEffect(() => {
    if (!timerStarted || !isTrialActive) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTrialActive(false);
          setShowSubscriptionModal(true);
          toast({ title: "Trial Ended", description: "Please subscribe to continue.", variant: "destructive" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerStarted, isTrialActive, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-[#111113] text-white grid md:grid-cols-[350px_1fr] overflow-hidden">
      <aside className="hidden md:flex flex-col border-r border-white/10 p-6 space-y-6 overflow-y-auto">
        <div className="flex justify-between items-center">
          <Button onClick={onBackToHome} variant="ghost" size="icon" className="hover:bg-white/10"><ArrowLeft className="w-5 h-5" /></Button>
          {isTrialActive && timerStarted && (<div className="flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-full text-sm"><Clock className="w-4 h-4 text-primary" /><span className="font-mono text-primary">{formatTime(timeLeft)}</span></div>)}
        </div>
        
        <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-zinc-900 flex items-center justify-center text-zinc-400">
            {streamState === 'connecting' && (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
    <p className="mt-2 text-sm">Connecting Avatar...</p>
  </div>
)}
            {streamState === 'error' && (<div className="text-center p-4"><X className="w-8 h-8 text-destructive mx-auto" /><p className="mt-2 text-sm">Connection Failed</p></div>)}
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline style={{ opacity: streamState === 'connected' ? 1 : 0 }} />
            {streamState === 'initial' && (<img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover absolute inset-0" />)}
        </div>

        <div className="text-center"><h1 className="text-2xl font-bold">{avatar.name}</h1><p className="text-sm text-zinc-400">{avatar.description}</p></div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 flex flex-col h-auto py-2 space-y-1"><Phone className="w-5 h-5"/> <span className="text-xs">Call</span></Button>
          <Button variant="outline" className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 flex flex-col h-auto py-2 space-y-1"><Video className="w-5 h-5"/> <span className="text-xs">Video</span></Button>
          <Button variant="outline" className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 flex flex-col h-auto py-2 space-y-1"><Settings className="w-5 h-5"/> <span className="text-xs">Settings</span></Button>
        </div>
        <div className="flex-1"></div>
        <div className="flex justify-around items-center border-t border-white/10 pt-4">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white"><User className="w-6 h-6"/></Button>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white"><MoreHorizontal className="w-6 h-6"/></Button>
        </div>
      </aside>
      
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <header className="md:hidden flex justify-between items-center p-4 border-b border-white/10 bg-[#111113]/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <img src={avatar.image} className="w-10 h-10 rounded-full object-cover border-2 border-primary/50" alt="avatar" />
            <h1 className="text-lg font-bold">{avatar.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            {isTrialActive && timerStarted && (
              <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-full text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-mono text-primary">{formatTime(timeLeft)}</span>
              </div>
            )}
            <Button onClick={onBackToHome} variant="ghost" size="icon" className="hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col space-y-4 max-w-4xl mx-auto">
            {messages.map((m) => (
              <div key={m.id} className={`flex items-end gap-3 ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                {!m.isUser && (<img src={avatar.image} className="w-8 h-8 rounded-full object-cover self-start" alt="avatar"/>)}
                <div className={`max-w-xs md:max-w-md lg:max-w-xl px-4 py-2.5 rounded-2xl text-white/90 ${m.isUser ? 'bg-primary rounded-br-none' : 'bg-[#28282B] rounded-bl-none'}`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                {!m.isUser && m.content && (
                  <Button onClick={() => handleTextToSpeech(m.content)} variant="ghost" size="icon" className="w-8 h-8 shrink-0 rounded-full text-white/50 hover:bg-white/10 hover:text-white" title="Play audio">
                    <Volume2 className="w-4 h-4"/>
                  </Button>
                )}
              </div>
            ))}
            {isAiTyping && <TypingIndicator avatar={avatar} />}
            <div ref={messagesEndRef} />
          </div>
        </main>
        <footer className="z-20 p-4 border-t border-white/10 bg-[#111113]/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <Input 
              value={inputMessage} 
              onChange={(e) => setInputMessage(e.target.value)} 
              onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              placeholder={isAiTyping ? "..." : (isTrialActive ? "Type a message..." : "Your trial has ended")} 
              disabled={!isTrialActive || isAiTyping} 
              className="flex-1 bg-zinc-800/50 border-zinc-700 rounded-full h-12 px-5 focus-visible:ring-primary focus-visible:ring-1 text-white placeholder:text-white/40" 
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || !isTrialActive || isAiTyping} className="bg-primary hover:bg-primary/90 rounded-full w-12 h-12 p-3 shrink-0">
              <Send className="w-6 h-6" />
            </Button>
          </div>
        </footer>
      </div>
      
      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} avatarName={avatar.name} />
    </div>
  );
};

export default ChatInterface;