import React, { useState, useEffect } from 'react';
import { ServerSidebar } from './components/ServerSidebar';
import { ChannelList } from './components/ChannelList';
import { ChatArea } from './components/ChatArea';
import { VoiceStage } from './components/VoiceStage';
import { MemberSidebar } from './components/MemberSidebar';
import { InviteModal } from './components/InviteModal';
import { UserSettingsModal } from './components/UserSettingsModal';
import { MOCK_SERVERS, CURRENT_USER, GEMINI_BOT_USER } from './constants';
import { Server, Channel, Message } from './types';
import { generateAIResponse } from './services/geminiService';

export default function App() {
  const [servers, setServers] = useState<Server[]>(MOCK_SERVERS);
  const [selectedServerId, setSelectedServerId] = useState<string>(MOCK_SERVERS[0].id);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(MOCK_SERVERS[0].channels[2].id); // Default to 'geral'
  
  // Voice State
  const [connectedVoiceChannelId, setConnectedVoiceChannelId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [inputDeviceId, setInputDeviceId] = useState<string>('default');

  // UI State
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [showMembers, setShowMembers] = useState(true);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeServer = servers.find(s => s.id === selectedServerId) || servers[0];
  const activeChannel = activeServer.channels.find(c => c.id === selectedChannelId) || activeServer.channels[0];
  
  // Initialize some fake messages for demo
  useEffect(() => {
    if (!messages['ch3']) {
      const initialMessages: Message[] = [
        { id: 'm1', content: 'E aí pessoal, alguém viu o novo hook do React?', senderId: 'u1', timestamp: new Date(Date.now() - 1000000), channelId: 'ch3' },
        { id: 'm2', content: 'Sim! O useActionState parece promissor.', senderId: 'u2', timestamp: new Date(Date.now() - 500000), channelId: 'ch3' }
      ];
      setMessages(prev => ({ ...prev, 'ch3': initialMessages }));
    }
    
    // Initial msg for AI Chat
    if (!messages['ch5']) {
        setMessages(prev => ({ 
            ...prev, 
            'ch5': [{ 
                id: 'ai-welcome', 
                content: 'Olá! Eu sou o Gemini Bot. Pergunte-me qualquer coisa sobre código, vida ou universo.', 
                senderId: 'gemini', 
                timestamp: new Date(), 
                channelId: 'ch5' 
            }] 
        }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleServerSelect = (id: string) => {
    setSelectedServerId(id);
    const server = servers.find(s => s.id === id);
    if (server && server.channels.length > 0) {
      // Prefer 'geral' or first text channel
      const general = server.channels.find(c => c.name === 'geral' && c.type === 'text');
      setSelectedChannelId(general ? general.id : server.channels[0].id);
    }
  };

  const handleChannelSelect = async (channel: Channel) => {
    if (channel.type === 'voice') {
        if (connectedVoiceChannelId !== channel.id) {
             try {
                const constraints = {
                    audio: inputDeviceId && inputDeviceId !== 'default' 
                        ? { deviceId: { exact: inputDeviceId } } 
                        : true,
                    video: false 
                };
                
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                setLocalStream(stream);
                setConnectedVoiceChannelId(channel.id);
             } catch (err) {
                 console.error("Failed to join voice:", err);
                 alert("Não foi possível acessar o microfone. Verifique as permissões.");
                 return;
             }
        }
    }
    setSelectedChannelId(channel.id);
  };

  const handleDisconnectVoice = () => {
      if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
      }
      setConnectedVoiceChannelId(null);
      if (activeChannel.type === 'voice') {
          const firstText = activeServer.channels.find(c => c.type === 'text');
          if (firstText) setSelectedChannelId(firstText.id);
      }
  };

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: CURRENT_USER.id,
      timestamp: new Date(),
      channelId: selectedChannelId
    };

    setMessages(prev => ({
      ...prev,
      [selectedChannelId]: [...(prev[selectedChannelId] || []), newMessage]
    }));

    if (activeChannel.name === 'gemini-chat' || content.toLowerCase().startsWith('@gemini')) {
        setIsLoadingAi(true);
        const history = (messages[selectedChannelId] || []).slice(-10).map(m => ({
            role: m.senderId === 'gemini' ? 'model' : 'user',
            content: m.content
        }));

        const responseText = await generateAIResponse(content, history);
        
        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: responseText,
            senderId: GEMINI_BOT_USER.id,
            timestamp: new Date(),
            channelId: selectedChannelId
        };

        setMessages(prev => ({
            ...prev,
            [selectedChannelId]: [...(prev[selectedChannelId] || []), aiMessage]
        }));
        setIsLoadingAi(false);
    }
  };

  return (
    // Background Gradient and Padding for Floating Effect
    <div className="flex h-screen w-screen bg-app-gradient font-sans overflow-hidden p-4 gap-4 text-gamer-text-main relative">
      
      {/* Decorative Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gamer-primary opacity-20 blur-[100px] pointer-events-none rounded-full translate-x-[-50%] translate-y-[-50%]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gamer-accent opacity-10 blur-[100px] pointer-events-none rounded-full translate-x-[50%] translate-y-[50%]"></div>

      <ServerSidebar 
        servers={servers} 
        selectedServerId={selectedServerId} 
        onSelectServer={handleServerSelect} 
      />
      
      <ChannelList 
        server={activeServer} 
        selectedChannelId={selectedChannelId} 
        connectedVoiceChannelId={connectedVoiceChannelId}
        onSelectChannel={handleChannelSelect} 
        onDisconnectVoice={handleDisconnectVoice}
        onOpenInvite={() => setIsInviteModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentUser={CURRENT_USER}
      />
      
      <div className="flex-1 flex min-w-0 relative gap-4">
        {activeChannel.type === 'voice' ? (
            <VoiceStage 
                channel={activeChannel}
                currentUser={CURRENT_USER}
                localStream={localStream}
            />
        ) : (
            <ChatArea 
                channel={activeChannel}
                server={activeServer}
                messages={messages[selectedChannelId] || []}
                onSendMessage={handleSendMessage}
                members={activeServer.members}
                isMobileShowMembers={false}
                toggleMembers={() => setShowMembers(!showMembers)}
                isLoadingAi={isLoadingAi}
            />
        )}
        
        {showMembers && activeChannel.type === 'text' && (
            <MemberSidebar members={activeServer.members} />
        )}

        {isInviteModalOpen && (
            <InviteModal 
                server={activeServer} 
                onClose={() => setIsInviteModalOpen(false)} 
            />
        )}

        {isSettingsOpen && (
            <UserSettingsModal 
                user={CURRENT_USER}
                onClose={() => setIsSettingsOpen(false)}
                inputDeviceId={inputDeviceId}
                setInputDeviceId={setInputDeviceId}
            />
        )}
      </div>
    </div>
  );
}