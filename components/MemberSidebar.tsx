import React from 'react';
import { User } from '../types';

interface MemberSidebarProps {
  members: User[];
}

export const MemberSidebar: React.FC<MemberSidebarProps> = ({ members }) => {
  // Group members by role/status mock logic
  const bots = members.filter(m => m.isBot);
  const online = members.filter(m => !m.isBot && m.status !== 'offline');
  const offline = members.filter(m => !m.isBot && m.status === 'offline');

  const MemberItem: React.FC<{ member: User }> = ({ member }) => (
    <div className="flex items-center px-3 py-2 hover:bg-white/5 rounded-xl cursor-pointer opacity-90 hover:opacity-100 group transition-all duration-200 mb-1">
      <div className="relative mr-3">
        <img src={member.avatar} alt={member.username} className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-white/20 transition-all" />
        <div className={`absolute bottom-0 right-0 w-3 h-3 border-[2px] border-[#1e202f] rounded-full 
          ${member.status === 'online' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 
            member.status === 'idle' ? 'bg-yellow-500' : 
            member.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'}`} 
        />
      </div>
      <div>
        <div className={`font-bold text-sm ${member.isBot ? 'text-gamer-accent drop-shadow-sm' : 
          (member.status === 'offline' ? 'text-gray-500' : 'text-gray-200 group-hover:text-white')}`}>
          {member.username}
          {member.isBot && <span className="ml-1.5 bg-gamer-primary text-white text-[9px] px-1.5 rounded-[3px] py-[1px]">AI</span>}
        </div>
        <div className="text-[10px] text-gray-500 hidden group-hover:block transition-all">{member.status === 'dnd' ? 'Não perturbe' : ''}</div>
      </div>
    </div>
  );

  return (
    <div className="w-64 glass-panel rounded-[30px] flex flex-col overflow-y-auto custom-scrollbar p-4 hidden md:flex shrink-0">
      {bots.length > 0 && (
        <div className="mb-6">
           <h3 className="text-gamer-text-muted text-[11px] font-bold uppercase mb-3 px-2 tracking-wider">Bots — {bots.length}</h3>
           {bots.map(m => <MemberItem key={m.id} member={m} />)}
        </div>
      )}

      {online.length > 0 && (
        <div className="mb-6">
           <h3 className="text-gamer-text-muted text-[11px] font-bold uppercase mb-3 px-2 tracking-wider">Disponível — {online.length}</h3>
           {online.map(m => <MemberItem key={m.id} member={m} />)}
        </div>
      )}

      {offline.length > 0 && (
        <div className="mb-6">
           <h3 className="text-gamer-text-muted text-[11px] font-bold uppercase mb-3 px-2 tracking-wider">Offline — {offline.length}</h3>
           {offline.map(m => <MemberItem key={m.id} member={m} />)}
        </div>
      )}
    </div>
  );
};