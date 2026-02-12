import React, { useEffect, useState, useRef } from 'react';
import { Channel, User } from '../types';
import { Volume2, Mic, MicOff, PhoneOff, UserPlus, Link as LinkIcon, Users, ArrowRight } from 'lucide-react';
import { GeminiLiveClient } from '../services/liveClient';
// @ts-ignore
import Peer from 'peerjs';

interface VoiceStageProps {
  channel: Channel;
  currentUser: User;
  localStream: MediaStream | null;
}

const VoiceAvatar: React.FC<{ 
  user: User; 
  isSpeaking: boolean; 
  isMuted?: boolean;
  isBot?: boolean;
}> = ({ user, isSpeaking, isMuted, isBot }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-3xl w-48 h-48 relative group transition-all duration-300
        ${isSpeaking ? 'bg-gradient-to-br from-gamer-card to-gamer-primary/20 border-gamer-primary/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-white/5 hover:bg-white/10 border-transparent'}
        border backdrop-blur-sm
    `}>
      <div className={`relative rounded-full p-[4px] transition-all duration-300 ${isSpeaking ? 'bg-gradient-to-r from-gamer-primary to-gamer-accent animate-spin-slow' : 'bg-transparent'}`}>
        <div className="rounded-full overflow-hidden p-[2px] bg-[#1e202f]">
             <img 
                src={user.avatar} 
                alt={user.username} 
                className={`w-20 h-20 rounded-full object-cover bg-[#0F111A] transition-opacity ${isSpeaking ? 'opacity-100' : 'opacity-80'}`} 
            />
        </div>
        {isMuted && (
            <div className="absolute bottom-0 right-0 bg-red-500 rounded-full p-1.5 border-[3px] border-[#1e202f] shadow-md">
                <MicOff size={12} className="text-white" />
            </div>
        )}
      </div>
      <div className="mt-4 font-bold text-white truncate max-w-full px-2 flex items-center gap-2">
         {user.username}
         {isBot && <span className="bg-gamer-primary text-white text-[9px] px-1.5 rounded-full flex items-center h-[16px] shadow-lg">AI</span>}
      </div>
      <div className={`absolute top-3 right-3 transition-opacity duration-300 ${isSpeaking || isBot ? 'opacity-100' : 'opacity-0'}`}>
        {isSpeaking && <div className="w-2 h-2 bg-gamer-accent rounded-full shadow-[0_0_8px_#06b6d4]"></div>}
      </div>
    </div>
  );
};

export const VoiceStage: React.FC<VoiceStageProps> = ({ channel, currentUser, localStream }) => {
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  
  // P2P State
  const [myPeerId, setMyPeerId] = useState<string>('');
  const [connectId, setConnectId] = useState('');
  const [remotePeers, setRemotePeers] = useState<Map<string, { stream: MediaStream, user: User }>>(new Map());
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  
  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);
  const liveClientRef = useRef<GeminiLiveClient | null>(null);
  const peerRef = useRef<any>(null);

  // --- Gemini AI Setup ---
  useEffect(() => {
      if (!localStream) return;
      
      const client = new GeminiLiveClient();
      liveClientRef.current = client;

      client.onBotSpeakingChange = (speaking) => {
          setIsBotSpeaking(speaking);
      };

      client.connect(localStream).catch(err => {
          console.error("Failed to connect to Gemini Live:", err);
      });

      return () => {
          client.disconnect();
          liveClientRef.current = null;
      };
  }, [localStream]);

  // --- PeerJS P2P Setup ---
  useEffect(() => {
    if (!localStream) return;

    // Create a random ID for the current user
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id: string) => {
        console.log('My Peer ID is: ' + id);
        setMyPeerId(id);
    });

    // Answer incoming calls
    peer.on('call', (call: any) => {
        console.log("Receiving call from", call.peer);
        call.answer(localStream); // Answer with our stream
        
        call.on('stream', (remoteStream: MediaStream) => {
            handleRemoteStream(call.peer, remoteStream);
        });
    });

    peer.on('error', (err: any) => {
        console.error("PeerJS Error:", err);
        setConnectionStatus('idle');
    });

    return () => {
        peer.destroy();
    };
  }, [localStream]);

  const handleRemoteStream = (peerId: string, stream: MediaStream) => {
     // Create a mock user for the remote peer since we don't have a DB
     const mockUser: User = {
         id: peerId,
         username: `Amigo ${peerId.slice(0, 4)}`,
         discriminator: '0000',
         avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${peerId}`,
         status: 'online'
     };
     
     setRemotePeers(prev => {
         const newMap = new Map(prev);
         newMap.set(peerId, { stream, user: mockUser });
         return newMap;
     });
  };

  const connectToFriend = () => {
      if (!connectId || !peerRef.current || !localStream) return;
      
      setConnectionStatus('connecting');
      const call = peerRef.current.call(connectId, localStream);
      
      call.on('stream', (remoteStream: MediaStream) => {
          setConnectionStatus('connected');
          setConnectId(''); // Clear input
          handleRemoteStream(connectId, remoteStream);
      });
      
      call.on('error', (err: any) => {
          console.error("Call error", err);
          setConnectionStatus('idle');
          alert("Não foi possível conectar. Verifique o ID.");
      });
  };

  // --- Local Audio Visualization ---
  useEffect(() => {
    if (!localStream) return;

    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        
        const source = audioContext.createMediaStreamSource(localStream.clone());
        source.connect(analyser);

        audioContextRef.current = audioContext;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const average = sum / dataArray.length;
            setIsUserSpeaking(average > 10);
            animationRef.current = requestAnimationFrame(checkVolume);
        };
        checkVolume();
    } catch (e) {
        console.error("Audio visualization error:", e);
    }

    return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [localStream]);

  // Copy ID helper
  const copyId = () => {
      navigator.clipboard.writeText(myPeerId);
      alert("ID copiado! Envie para seu amigo.");
  };

  return (
    <div className="flex-1 glass-panel rounded-[30px] flex flex-col min-w-0 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none"></div>

        {/* Remote Audio Elements */}
        {Array.from(remotePeers.values()).map((peer: { stream: MediaStream; user: User }) => (
             <audio 
                key={peer.user.id} 
                autoPlay 
                ref={audio => { if(audio) audio.srcObject = peer.stream; }} 
             />
        ))}

        <header className="h-20 px-6 flex items-center justify-between z-10">
            <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gamer-accent/10 flex items-center justify-center mr-4 text-gamer-accent">
                    <Volume2 size={20} />
                </div>
                <div>
                     <span className="font-bold text-white text-lg block">{channel.name}</span>
                     <div className="flex gap-2">
                        <span className="text-[10px] bg-gamer-accent/20 text-gamer-accent px-2 py-0.5 rounded-full border border-gamer-accent/20 font-bold">Gemini Live</span>
                        {remotePeers.size > 0 && <span className="text-[10px] bg-gamer-primary/20 text-gamer-primary px-2 py-0.5 rounded-full border border-gamer-primary/20 font-bold">P2P</span>}
                     </div>
                </div>
            </div>

            {/* P2P Controls - Floating capsule */}
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-lg">
                <div className="flex items-center px-3 border-r border-white/10 pr-3 mr-1">
                    <span className="text-[10px] text-gamer-text-muted mr-2 font-bold uppercase tracking-wider">Seu ID</span>
                    <button onClick={copyId} className="flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-full transition-colors border border-white/5" title="Copiar seu ID para enviar a um amigo">
                         <span className="max-w-[80px] truncate font-mono">{myPeerId || '...'}</span>
                         <LinkIcon size={12} className="text-gamer-accent" />
                    </button>
                </div>
                
                <div className="flex items-center gap-2 pr-1">
                    <input 
                        type="text" 
                        placeholder="ID do Amigo" 
                        value={connectId}
                        onChange={(e) => setConnectId(e.target.value)}
                        className="bg-transparent text-xs text-white px-2 py-1 w-24 focus:outline-none placeholder-white/20"
                    />
                    <button 
                        onClick={connectToFriend}
                        disabled={connectionStatus === 'connecting' || !connectId}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${connectionStatus === 'connecting' ? 'bg-gray-500 cursor-not-allowed' : 'bg-gamer-accent hover:bg-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'}`}
                        title="Conectar"
                    >
                        <ArrowRight size={14} className="font-bold" />
                    </button>
                </div>
            </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center z-10 custom-scrollbar">
            <div className="flex flex-wrap items-center justify-center gap-6 w-full max-w-5xl">
                {/* Local User */}
                <VoiceAvatar user={currentUser} isSpeaking={isUserSpeaking} />

                {/* Gemini Bot */}
                 <VoiceAvatar 
                    user={{
                        id: 'gemini', 
                        username: 'Gemini AI', 
                        avatar: 'https://picsum.photos/id/20/200/200', 
                        status: 'online', 
                        discriminator: 'BOT',
                        isBot: true 
                    }} 
                    isSpeaking={isBotSpeaking} 
                    isBot={true}
                />

                {/* Remote Friends (P2P) */}
                {Array.from(remotePeers.values()).map((peer: { stream: MediaStream; user: User }) => (
                    <VoiceAvatar 
                        key={peer.user.id} 
                        user={peer.user} 
                        isSpeaking={false} 
                    />
                ))}
            </div>
        </div>

        <div className="h-24 flex items-center justify-center p-4 gap-6 shrink-0 z-10 pb-8">
             <div className="flex flex-col items-center group cursor-pointer">
                 <button className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    <Mic size={24} />
                 </button>
             </div>

             <div className="flex flex-col items-center group cursor-pointer mx-4">
                 <button className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:scale-110 hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] border-4 border-[#0F111A]">
                    <PhoneOff size={32} className="text-white" />
                 </button>
             </div>
             
             <div className="flex flex-col items-center group cursor-pointer">
                 <button onClick={() => alert("Compartilhe seu ID (no topo da tela) com um amigo para ele se conectar a você!")} className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 hover:border-white/30">
                    <UserPlus size={24} className="text-white" />
                 </button>
             </div>
        </div>
    </div>
  );
};