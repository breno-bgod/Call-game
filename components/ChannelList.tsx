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
      className={`group flex items-center px-2 py-1 mx-2 rounded mb-[2px] cursor-pointer transition-colors
      ${isActive ? 'bg-[#404249] text-white' : 'text-discord-text-muted hover:bg-[#35373C] hover:text-discord-text-normal'}`}
    >
      <span className="mr-1.5 text-discord-text-muted">
        {channel.type === 'text' ? <Hash size={20} /> : <Volume2 size={20} />}
      </span>
      <span className={`font-medium truncate flex-1 ${isActive ? 'text-white' : ''}`}>
        {channel.name}
      </span>
      {isConnectedVoice && channel.type === 'voice' && (
         <div className="flex items-center justify-center w-4 h-4 mr-1">
             <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
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
    <div className="w-60 bg-[#2B2D31] flex flex-col h-full shrink-0">
      {/* Server Header */}
      <header className="h-12 px-4 flex items-center justify-between shadow-sm hover:bg-[#35373C] transition-colors border-b border-[#1F2023] group cursor-pointer" onClick={onOpenInvite}>
        <h1 className="font-bold text-discord-text-header truncate flex-1">{server.name}</h1>
        {/* Simulating a dropdown trigger, but acting as invite trigger for demo */}
        <div className="text-discord-text-header group-hover:text-discord-text-header" title="Convidar Pessoas">
            <UserPlus size={18} />
        </div>
      </header>

      {/* Channels Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
        {server.categories.map((category) => {
           const categoryChannels = server.channels.filter(c => c.categoryId === category.id);
           if (categoryChannels.length === 0) return null;
           
           return (
             <div key={category.id} className="mb-4">
               <div className="flex items-center justify-between px-4 mb-1 text-xs font-bold text-discord-text-muted uppercase hover:text-discord-text-normal cursor-pointer">
                 <div className="flex items-center">
                    <ChevronDown size={10} className="mr-0.5" />
                    {category.name}
                 </div>
                 <Plus size={14} className="cursor-pointer" />
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
        <div className="bg-[#232428] border-b border-[#3F4147] px-2 py-2">
            <div className="flex items-center justify-between">
                <div className="flex flex-col text-discord-green px-1">
                    <div className="flex items-center gap-1">
                        <Signal size={14} />
                        <span className="text-xs font-bold">Voz Conectada</span>
                    </div>
                    <span className="text-xs text-discord-text-muted truncate max-w-[120px]">
                        {activeVoiceChannel.name} / {server.name}
                    </span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDisconnectVoice(); }}
                    className="p-1.5 hover:bg-[#3F4147] rounded text-discord-text-header"
                >
                    <PhoneOff size={18} />
                </button>
            </div>
        </div>
      )}

      {/* User Controls Footer */}
      <div className="bg-[#232428] px-2 py-1.5 flex items-center">
        <div className="group flex items-center p-1 rounded-md hover:bg-[#3F4147] cursor-pointer mr-auto max-w-[120px]">
          <div className="relative mr-2">
            <img src={currentUser.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-gray-500 object-cover" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-discord-green rounded-full border-[2px] border-[#232428]" />
          </div>
          <div className="text-sm overflow-hidden">
            <div className="font-semibold text-white truncate text-xs">{currentUser.username}</div>
            <div className="text-discord-text-muted text-[10px] leading-tight truncate">#{currentUser.discriminator}</div>
          </div>
        </div>
        
        <div className="flex items-center">
           <button className="p-1.5 hover:bg-[#3F4147] rounded text-discord-text-header transition-colors">
              <Mic size={19} />
           </button>
           <button className="p-1.5 hover:bg-[#3F4147] rounded text-discord-text-header transition-colors">
              <Headphones size={19} />
           </button>
           <button 
                onClick={onOpenSettings}
                className="p-1.5 hover:bg-[#3F4147] rounded text-discord-text-header transition-colors"
           >
              <Settings size={19} />
           </button>
        </div>
      </div>
    </div>
  );
};