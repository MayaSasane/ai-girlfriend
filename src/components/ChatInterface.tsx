import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Clock, ArrowLeft, Volume2, VolumeX, Phone, Video, Settings, MoreHorizontal, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SubscriptionModal from './SubscriptionModal';
import { PreferenceValues } from './PreferencesModal';

// --- INTERFACES & SUB-COMPONENTS ---
interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

interface Avatar {
  id: string;
  name: string;
  video?: string;
  image?: string;
  color: string;
  description: string;
}

interface ChatInterfaceProps {
  avatar: Avatar;
  preferences: PreferenceValues;
  onBackToHome: () => void;
}

const TypingIndicator = ({ avatar }: { avatar: Avatar }) => (
  <div className="flex items-end gap-3 justify-start">
    <video src={avatar.video} poster={avatar.image} className="w-8 h-8 rounded-full object-cover self-start" preload="metadata" muted />
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
  const [timeLeft, setTimeLeft] = useState(180);
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [timerStarted, setTimerStarted] = useState(true); 
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Pre-load voices when the component mounts
  useEffect(() => {
    const loadVoices = () => {
      setVoices(speechSynthesis.getVoices());
    };
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }, []);

  // --- LOGIC ---
  const getDominantPreference = (prefs: PreferenceValues): keyof PreferenceValues => {
    return Object.keys(prefs).reduce((a, b) => prefs[a as keyof PreferenceValues] > prefs[b as keyof PreferenceValues] ? a : b) as keyof PreferenceValues;
  };

  const handleTextToSpeech = (messageId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({ title: "Sorry, your browser doesn't support text-to-speech.", variant: "destructive" });
      return;
    }
    if (currentlyPlayingId === messageId) {
      speechSynthesis.cancel();
      setCurrentlyPlayingId(null);
      return;
    }
    speechSynthesis.cancel();
    const cleanText = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
    if (!cleanText) return;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const femaleVoice = 
      voices.find(voice => voice.name === 'Samantha' && voice.lang.startsWith('en')) ||
      voices.find(voice => voice.name.toLowerCase().includes('female') && voice.lang.startsWith('en')) ||
      voices.find(voice => voice.name === 'Google US English' && !voice.name.toLowerCase().includes('male')) ||
      voices.find(voice => voice.lang.startsWith('en-US') && voice.gender === 'female') ||
      voices.find(voice => voice.lang.startsWith('en-US') && !voice.name.toLowerCase().includes('male'));
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    } else {
      console.warn("No preferred female voice found, using system default.");
    }
    utterance.pitch = 1.1;
    utterance.rate = 0.9;
    utterance.onstart = () => setCurrentlyPlayingId(messageId);
    utterance.onend = () => setCurrentlyPlayingId(null);
    utterance.onerror = () => setCurrentlyPlayingId(null);
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const dominantPref = getDominantPreference(preferences);
    const welcomeMessages = {
      soft: `Hi there, sweetie! I'm ${avatar.name}. I'm so happy to meet you. What's on your mind today? 💕`,
      emotionalSupportive: `Hello beautiful soul, I'm ${avatar.name}. I'm here for you completely. Tell me what's in your heart. 🤗`,
      flirt: `Well hello there... I'm ${avatar.name}, and I've been waiting for someone like you. What brings you to me tonight? 😘`,
      dirty: `Mmm, hello there... I'm ${avatar.name}. I can already tell this is going to be fun... 🔥`,
    };
    const welcomeMessage: Message = {
      id: '1',
      content: welcomeMessages[dominantPref] || welcomeMessages.soft,
      isUser: false,
    };
    setMessages([welcomeMessage]);
  }, [avatar.name, preferences]);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isTrialActive) return;

    const userMessage: Message = { id: Date.now().toString(), content: inputMessage, isUser: true };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsAiTyping(true);

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

      if (!response.ok || !response.body) {
        throw new Error('Failed to get a response from the AI.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseContent = '';
      const aiMessageId = (Date.now() + 1).toString();

      // Add a placeholder for the AI's message
      setMessages(prev => [...prev, { id: aiMessageId, content: '', isUser: false }]);

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiResponseContent += decoder.decode(value, { stream: true });
        
        // Update the last message in the array with the new content
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, content: aiResponseContent } : msg
        ));
      }

    } catch (error) {
      console.error("Chat API error:", error);
      toast({ title: "Error", description: "Could not connect to the AI.", variant: "destructive" });
      // Optionally remove the user's message if the API fails
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsAiTyping(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSidebarVideoEnter = () => { if (sidebarVideoRef.current) sidebarVideoRef.current.play(); };
  const handleSidebarVideoLeave = () => { if (sidebarVideoRef.current) sidebarVideoRef.current.pause(); };

  return (
    <div className="h-screen bg-[#111113] text-white grid md:grid-cols-[350px_1fr] overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="hidden md:flex flex-col border-r border-white/10 p-6 space-y-6 overflow-y-auto">
        <div className="flex justify-between items-center">
          <Button onClick={onBackToHome} variant="ghost" size="icon" className="hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {isTrialActive && timerStarted && (
            <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-full text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-mono text-primary">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <div 
          className="relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
          onMouseEnter={handleSidebarVideoEnter}
          onMouseLeave={handleSidebarVideoLeave}
        >
          <video 
            ref={sidebarVideoRef}
            src={avatar.video} 
            poster={avatar.image}
            className="w-full h-full object-cover" 
            preload="metadata"
            muted
            loop
            playsInline
          />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold">{avatar.name}</h1>
          <p className="text-sm text-zinc-400">{avatar.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 flex flex-col h-auto py-2 space-y-1"><Phone className="w-5 h-5"/> <span className="text-xs">Call</span></Button>
          <Button variant="outline" className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 flex flex-col h-auto py-2 space-y-1"><Video className="w-5 h-5"/> <span className="text-xs">Video</span></Button>
          <Button variant="outline" className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 flex flex-col h-auto py-2 space-y-1"><Settings className="w-5 h-5"/> <span className="text-xs">Settings</span></Button>
        </div>
        
        <div className="flex-1"></div> {/* Spacer */}

        <div className="flex justify-around items-center border-t border-white/10 pt-4">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white"><User className="w-6 h-6"/></Button>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white"><MoreHorizontal className="w-6 h-6"/></Button>
        </div>
      </aside>

      {/* --- CHAT AREA --- */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* --- Mobile Header --- */}
        <header className="md:hidden flex justify-between items-center p-4 border-b border-white/10 bg-[#111113]/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3">
                <video src={avatar.video} poster={avatar.image} className="w-10 h-10 rounded-full object-cover border-2 border-primary/50" preload="metadata" muted />
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

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col space-y-4 max-w-4xl mx-auto">
            {messages.map((m) => (
              <div key={m.id} className={`flex items-end gap-3 ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                {!m.isUser && (
                  <video src={avatar.video} poster={avatar.image} className="w-8 h-8 rounded-full object-cover self-start" preload="metadata" muted />
                )}
                <div className={`max-w-xs md:max-w-md lg:max-w-xl px-4 py-2.5 rounded-2xl text-white/90 ${m.isUser ? 'bg-primary rounded-br-none' : 'bg-[#28282B] rounded-bl-none'}`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                {!m.isUser && (
                  <Button onClick={() => handleTextToSpeech(m.id, m.content)} variant="ghost" size="icon" className="w-8 h-8 shrink-0 rounded-full text-white/50 hover:bg-white/10 hover:text-white">
                    {currentlyPlayingId === m.id ? <VolumeX className="w-4 h-4"/> : <Volume2 className="w-4 h-4"/>}
                  </Button>
                )}
              </div>
            ))}
            {isAiTyping && <TypingIndicator avatar={avatar} />}
            <div ref={messagesEndRef} />
          </div>
        </main>
        {/* Input Area */}
        <footer className="z-20 p-4 border-t border-white/10 bg-[#111113]/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
