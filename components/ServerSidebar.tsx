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
    <div className="relative group flex items-center justify-center w-[60px] mb-4 cursor-pointer" onClick={onClick}>
      {/* Active Indicator (Glowing Dot) */}
      <div className={`absolute -left-2 w-1.5 bg-gamer-accent rounded-full transition-all duration-300 shadow-[0_0_10px_#06b6d4]
        ${active ? 'h-8 opacity-100' : 'h-2 opacity-0 group-hover:opacity-50'}`} 
      />

      {/* Icon Container - Floating & Glassy */}
      <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white transition-all duration-300 transform group-hover:scale-110 shadow-lg border border-white/10
        ${active ? 'ring-2 ring-gamer-primary ring-offset-2 ring-offset-[#0F111A] bg-gamer-primary' : (colorClass || 'bg-gamer-card backdrop-blur-sm')} 
        ${active ? '' : 'group-hover:border-gamer-accent/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]'}`}
      >
        {icon ? (
          <img src={icon} alt={name} className="w-full h-full object-cover" />
        ) : (
          children
        )}
      </div>

      {/* Tooltip (Neumorphic) */}
      <div className="absolute left-[70px] bg-[#1e202f] text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0 shadow-xl border border-white/10">
         {name}
      </div>
    </div>
  );
};

export const ServerSidebar: React.FC<ServerSidebarProps> = ({ servers, selectedServerId, onSelectServer }) => {
  return (
    // Floating Glass Sidebar
    <nav className="w-[80px] glass-panel rounded-[30px] flex flex-col items-center py-6 overflow-y-auto h-full scrollbar-none z-20">
      
      {/* DM Icon */}
      <ServerIcon 
        name="Mensagens Diretas" 
        active={false} 
        colorClass="glass-button text-gamer-text-main hover:bg-gamer-primary"
        onClick={() => console.log("DM clicked")}
      >
        <img src="https://assets-global.website-files.com/6257adef93867e56f84d3092/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" className="w-7 h-7 brightness-150" alt="Discord" />
      </ServerIcon>

      <div className="w-8 h-[2px] bg-white/10 rounded-lg mb-4 mx-auto" />

      {servers.map((server) => (
        <ServerIcon
          key={server.id}
          icon={server.icon}
          name={server.name}
          active={server.id === selectedServerId}
          onClick={() => onSelectServer(server.id)}
        />
      ))}

      <ServerIcon name="Adicionar Servidor" colorClass="glass-button text-gamer-accent hover:bg-gamer-accent hover:text-white">
        <Plus size={24} />
      </ServerIcon>

      <ServerIcon name="Explorar" colorClass="glass-button text-gamer-secondary hover:bg-gamer-secondary hover:text-white">
        <Compass size={24} />
      </ServerIcon>
      
      <div className="w-8 h-[2px] bg-white/10 rounded-lg mb-4 mx-auto mt-auto" />
      
    </nav>
  );
};