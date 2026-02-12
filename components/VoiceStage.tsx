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
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#2B2D31] w-48 h-40 relative group border border-transparent hover:bg-[#3F4147] transition-colors animate-in fade-in zoom-in duration-300">
      <div className={`relative rounded-full p-[3px] transition-all duration-100 ${isSpeaking ? 'bg-discord-green shadow-[0_0_0_2px_#23A559]' : ''}`}>
        <img 
            src={user.avatar} 
            alt={user.username} 
            className={`w-20 h-20 rounded-full object-cover bg-[#1E1F22] ${isSpeaking ? 'opacity-100' : 'opacity-80'}`} 
        />
        {isMuted && (
            <div className="absolute bottom-0 right-0 bg-[#F23F42] rounded-full p-1 border-[3px] border-[#2B2D31]">
                <MicOff size={12} className="text-white" />
            </div>
        )}
      </div>
      <div className="mt-3 font-semibold text-white truncate max-w-full px-2 flex items-center gap-2">
         {user.username}
         {isBot && <span className="bg-[#5865F2] text-white text-[10px] px-1.5 rounded-[3px] flex items-center h-[15px]">AI</span>}
      </div>
      <div className="absolute top-2 right-2 hidden group-hover:block bg-black/50 px-1.5 rounded text-xs text-white">
        {isBot ? 'Gemini Live' : 'Conectado'}
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
    <div className="flex-1 bg-[#1E1F22] flex flex-col min-w-0">
        {/* Remote Audio Elements */}
        {Array.from(remotePeers.values()).map((peer: { stream: MediaStream; user: User }) => (
             <audio 
                key={peer.user.id} 
                autoPlay 
                ref={audio => { if(audio) audio.srcObject = peer.stream; }} 
             />
        ))}

        <header className="h-12 px-4 flex items-center justify-between shadow-sm border-b border-[#26272D] shrink-0">
            <div className="flex items-center">
                <Volume2 className="text-discord-text-muted mr-2" size={24} />
                <span className="font-bold text-white mr-4">{channel.name}</span>
                <span className="text-xs bg-discord-green text-white px-1.5 rounded mr-2">Gemini Live On</span>
                {remotePeers.size > 0 && <span className="text-xs bg-discord-primary text-white px-1.5 rounded">P2P Ativo</span>}
            </div>

            {/* P2P Controls */}
            <div className="flex items-center gap-2 bg-[#111214] p-1 rounded-lg">
                <div className="flex items-center px-2 border-r border-[#3F4147] pr-3 mr-1">
                    <span className="text-xs text-discord-text-muted mr-2 font-bold uppercase">Seu ID</span>
                    <button onClick={copyId} className="flex items-center gap-1 text-xs bg-[#2B2D31] hover:bg-[#35373C] text-white px-2 py-1 rounded transition-colors" title="Copiar seu ID para enviar a um amigo">
                         <span className="max-w-[80px] truncate">{myPeerId || 'Gerando...'}</span>
                         <LinkIcon size={12} />
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        placeholder="ID do Amigo" 
                        value={connectId}
                        onChange={(e) => setConnectId(e.target.value)}
                        className="bg-[#2B2D31] text-xs text-white px-2 py-1 rounded w-28 focus:outline-none focus:ring-1 focus:ring-discord-primary"
                    />
                    <button 
                        onClick={connectToFriend}
                        disabled={connectionStatus === 'connecting' || !connectId}
                        className={`p-1.5 rounded transition-colors ${connectionStatus === 'connecting' ? 'bg-gray-500 cursor-not-allowed' : 'bg-discord-green hover:bg-green-600 text-white'}`}
                        title="Conectar ao ID"
                    >
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-5xl">
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
                        isSpeaking={false} // Would need audio analysis on remote stream for true value
                    />
                ))}
            </div>
        </div>

        <div className="h-20 bg-[#2B2D31] flex items-center justify-center p-4 gap-4 shrink-0">
             <div className="flex flex-col items-center">
                 <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Mic size={24} className="text-black" />
                 </button>
                 <span className="text-xs text-discord-text-muted mt-1">Microfone</span>
             </div>

             <div className="flex flex-col items-center">
                 <button className="w-14 h-14 rounded-full bg-discord-red flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg">
                    <PhoneOff size={28} className="text-white" />
                 </button>
                 <span className="text-xs text-discord-text-muted mt-1">Desconectar</span>
             </div>
             
             <div className="flex flex-col items-center ml-4">
                 <button onClick={() => alert("Compartilhe seu ID (no topo da tela) com um amigo para ele se conectar a você!")} className="w-12 h-12 rounded-full bg-[#2B2D31] flex items-center justify-center hover:bg-[#35373C] transition-colors">
                    <UserPlus size={24} className="text-discord-text-normal" />
                 </button>
                 <span className="text-xs text-discord-text-muted mt-1">Convidar</span>
             </div>
        </div>
    </div>
  );
};