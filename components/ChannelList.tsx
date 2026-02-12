import React from 'react';
import { Server, Channel, User } from '../types';
import { Hash, Volume2, Mic, Headphones, Settings, ChevronDown, Plus, PhoneOff, Signal, UserPlus } from 'lucide-react';

interface ChannelListProps {
  server: Server;
  selectedChannelId: string;
  connectedVoiceChannelId: string | null;
  onSelectChannel: (channel: Channel) => void;
  onDisconnectVoice: () => void;
  onOpenInvite: () => void;
  onOpenSettings: () => void;
  currentUser: User;
}

const ChannelItem: React.FC<{ 
  channel: Channel; 
  isActive: boolean; 
  isConnectedVoice: boolean;
  onClick: () => void; 
}> = ({ channel, isActive, isConnectedVoice, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`group flex items-center px-3 py-2 mx-2 rounded-xl mb-1 cursor-pointer transition-all duration-200
      ${isActive 
          ? 'bg-gradient-to-r from-gamer-primary/80 to-gamer-primary/40 text-white shadow-lg shadow-gamer-primary/20 border border-white/10' 
          : 'text-gamer-text-muted hover:bg-white/5 hover:text-white hover:pl-4'}`}
    >
      <span className={`mr-2 ${isActive ? 'text-white' : 'text-gamer-text-muted'}`}>
        {channel.type === 'text' ? <Hash size={18} /> : <Volume2 size={18} />}
      </span>
      <span className={`font-medium truncate flex-1 text-sm ${isActive ? 'text-white shadow-black drop-shadow-sm' : ''}`}>
        {channel.name}
      </span>
      {isConnectedVoice && channel.type === 'voice' && (
         <div className="flex items-center justify-center w-2 h-2 mr-1">
             <div className="w-2 h-2 bg-gamer-accent rounded-full animate-pulse shadow-[0_0_8px_#06b6d4]"></div>
         </div>
      )}
    </div>
  );
};

export const ChannelList: React.FC<ChannelListProps> = ({ 
  server, 
  selectedChannelId, 
  connectedVoiceChannelId,
  onSelectChannel, 
  onDisconnectVoice,
  onOpenInvite,
  onOpenSettings,
  currentUser 
}) => {
  
  const activeVoiceChannel = server.channels.find(c => c.id === connectedVoiceChannelId);

  return (
    <div className="w-64 glass-panel rounded-[30px] flex flex-col h-full shrink-0 overflow-hidden relative">
      {/* Glow Effect behind header */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-gamer-primary/10 to-transparent pointer-events-none" />

      {/* Server Header */}
      <header className="h-16 px-5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5" onClick={onOpenInvite}>
        <h1 className="font-bold text-white truncate flex-1 text-lg drop-shadow-md">{server.name}</h1>
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gamer-text-muted hover:text-white hover:bg-gamer-primary transition-all">
            <UserPlus size={16} />
        </div>
      </header>

      {/* Channels Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {server.categories.map((category) => {
           const categoryChannels = server.channels.filter(c => c.categoryId === category.id);
           if (categoryChannels.length === 0) return null;
           
           return (
             <div key={category.id} className="mb-6">
               <div className="flex items-center justify-between px-5 mb-2 text-[11px] font-bold text-gamer-text-muted uppercase tracking-wider">
                 <div className="flex items-center">
                    <ChevronDown size={10} className="mr-1" />
                    {category.name}
                 </div>
                 <Plus size={14} className="cursor-pointer hover:text-white" />
               </div>
               {categoryChannels.map(channel => (
                 <ChannelItem 
                    key={channel.id} 
                    channel={channel} 
                    isActive={channel.id === selectedChannelId}
                    isConnectedVoice={channel.id === connectedVoiceChannelId}
                    onClick={() => onSelectChannel(channel)}
                 />
               ))}
             </div>
           )
        })}
      </div>

      {/* Voice Connection Status Panel */}
      {connectedVoiceChannelId && activeVoiceChannel && (
        <div className="bg-gamer-card/80 backdrop-blur-md border-b border-white/5 px-3 py-3 mx-2 rounded-xl mb-2">
            <div className="flex items-center justify-between">
                <div className="flex flex-col text-gamer-accent px-1">
                    <div className="flex items-center gap-1">
                        <Signal size={14} />
                        <span className="text-xs font-bold">Voz Conectada</span>
                    </div>
                    <span className="text-xs text-gamer-text-muted truncate max-w-[120px]">
                        {activeVoiceChannel.name}
                    </span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDisconnectVoice(); }}
                    className="p-2 hover:bg-red-500/20 rounded-full text-white hover:text-red-400 transition-colors"
                >
                    <PhoneOff size={16} />
                </button>
            </div>
        </div>
      )}

      {/* User Controls Footer (Floating Look) */}
      <div className="bg-black/20 p-3 mx-2 mb-2 rounded-2xl border border-white/5 flex items-center backdrop-blur-md">
        <div className="group flex items-center p-1 rounded-lg hover:bg-white/5 cursor-pointer mr-auto max-w-[120px] transition-colors">
          <div className="relative mr-2">
            <img src={currentUser.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-gray-500 object-cover ring-2 ring-transparent group-hover:ring-gamer-primary transition-all" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gamer-accent rounded-full border-[2px] border-[#1e202f]" />
          </div>
          <div className="text-sm overflow-hidden">
            <div className="font-bold text-white truncate text-xs">{currentUser.username}</div>
            <div className="text-gamer-text-muted text-[10px] leading-tight truncate">#{currentUser.discriminator}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
           <button className="p-1.5 hover:bg-white/10 rounded-full text-gamer-text-muted hover:text-white transition-colors">
              <Mic size={16} />
           </button>
           <button className="p-1.5 hover:bg-white/10 rounded-full text-gamer-text-muted hover:text-white transition-colors">
              <Headphones size={16} />
           </button>
           <button 
                onClick={onOpenSettings}
                className="p-1.5 hover:bg-white/10 rounded-full text-gamer-text-muted hover:text-white transition-colors"
           >
              <Settings size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};