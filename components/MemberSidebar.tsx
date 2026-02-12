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
    <div className="flex items-center px-2 py-1.5 hover:bg-[#35373C] rounded cursor-pointer opacity-90 hover:opacity-100 group">
      <div className="relative mr-3">
        <img src={member.avatar} alt={member.username} className="w-8 h-8 rounded-full object-cover" />
        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-[3px] border-[#2B2D31] rounded-full 
          ${member.status === 'online' ? 'bg-discord-green' : 
            member.status === 'idle' ? 'bg-discord-yellow' : 
            member.status === 'dnd' ? 'bg-discord-red' : 'bg-gray-500'}`} 
        />
      </div>
      <div>
        <div className={`font-medium text-sm ${member.isBot ? 'text-blue-400' : 
          (member.status === 'offline' ? 'text-[#949BA4]' : 'text-[#DBDEE1]')}`}>
          {member.username}
          {member.isBot && <span className="ml-1.5 bg-[#5865F2] text-white text-[10px] px-1 rounded-[3px] py-[1px]">BOT</span>}
        </div>
        <div className="text-xs text-[#949BA4] hidden group-hover:block">{member.status === 'dnd' ? 'Não perturbe' : ''}</div>
      </div>
    </div>
  );

  return (
    <div className="w-60 bg-[#2B2D31] flex flex-col overflow-y-auto custom-scrollbar p-3 hidden md:flex">
      {bots.length > 0 && (
        <div className="mb-4">
           <h3 className="text-[#949BA4] text-xs font-bold uppercase mb-2 px-2">Bots — {bots.length}</h3>
           {bots.map(m => <MemberItem key={m.id} member={m} />)}
        </div>
      )}

      {online.length > 0 && (
        <div className="mb-4">
           <h3 className="text-[#949BA4] text-xs font-bold uppercase mb-2 px-2">Disponível — {online.length}</h3>
           {online.map(m => <MemberItem key={m.id} member={m} />)}
        </div>
      )}

      {offline.length > 0 && (
        <div className="mb-4">
           <h3 className="text-[#949BA4] text-xs font-bold uppercase mb-2 px-2">Offline — {offline.length}</h3>
           {offline.map(m => <MemberItem key={m.id} member={m} />)}
        </div>
      )}
    </div>
  );
};