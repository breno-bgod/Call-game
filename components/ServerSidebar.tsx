import React from 'react';
import { Server } from '../types';
import { Plus, Compass, Download } from 'lucide-react';

interface ServerSidebarProps {
  servers: Server[];
  selectedServerId: string;
  onSelectServer: (id: string) => void;
}

const ServerIcon: React.FC<{ 
  icon?: string; 
  name?: string; 
  active?: boolean; 
  hasNotification?: boolean;
  onClick?: () => void;
  colorClass?: string;
  children?: React.ReactNode;
}> = ({ icon, name, active, hasNotification, onClick, colorClass, children }) => {
  return (
    <div className="relative group flex items-center justify-center w-[72px] mb-2 cursor-pointer" onClick={onClick}>
      {/* Active Indicator */}
      <div className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 
        ${active ? 'h-10' : 'h-2 group-hover:h-5 opacity-0 group-hover:opacity-100'}`} 
      />

      {/* Icon Container */}
      <div className={`w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-200 overflow-hidden flex items-center justify-center text-white
        ${active ? 'rounded-[16px] bg-discord-primary' : (colorClass || 'bg-discord-dark')} 
        ${active ? '' : 'group-hover:bg-discord-primary'}`}
      >
        {icon ? (
          <img src={icon} alt={name} className="w-full h-full object-cover" />
        ) : (
          children
        )}
      </div>

      {/* Tooltip (Simplified) */}
      <div className="absolute left-[80px] bg-black text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity duration-200 shadow-lg">
         {name}
         {/* Little triangle */}
         <div className="absolute top-1/2 -left-1 w-2 h-2 bg-black transform -translate-y-1/2 rotate-45" />
      </div>
    </div>
  );
};

export const ServerSidebar: React.FC<ServerSidebarProps> = ({ servers, selectedServerId, onSelectServer }) => {
  return (
    <nav className="w-[72px] bg-[#1E1F22] flex flex-col items-center py-3 overflow-y-auto h-full scrollbar-none z-20 shadow-md">
      {/* Direct Messages Placeholder */}
      <ServerIcon 
        name="Mensagens Diretas" 
        active={false} 
        colorClass="bg-[#313338] text-discord-text-normal"
        onClick={() => console.log("DM clicked")}
      >
        <img src="https://assets-global.website-files.com/6257adef93867e56f84d3092/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" className="w-7 h-7" alt="Discord" />
      </ServerIcon>

      <div className="w-8 h-[2px] bg-[#35363C] rounded-lg mb-2 mx-auto" />

      {servers.map((server) => (
        <ServerIcon
          key={server.id}
          icon={server.icon}
          name={server.name}
          active={server.id === selectedServerId}
          onClick={() => onSelectServer(server.id)}
        />
      ))}

      <ServerIcon name="Adicionar Servidor" colorClass="bg-[#313338] text-discord-green group-hover:text-white group-hover:bg-discord-green">
        <Plus size={24} />
      </ServerIcon>

      <ServerIcon name="Explorar Servidores" colorClass="bg-[#313338] text-discord-green group-hover:text-white group-hover:bg-discord-green">
        <Compass size={24} />
      </ServerIcon>
      
      <div className="w-8 h-[2px] bg-[#35363C] rounded-lg mb-2 mx-auto mt-auto" />
      
      <ServerIcon name="Baixar Aplicativo" colorClass="bg-[#313338] text-discord-green group-hover:text-white group-hover:bg-discord-green">
        <Download size={20} />
      </ServerIcon>
    </nav>
  );
};