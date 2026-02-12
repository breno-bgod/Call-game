import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Server } from '../types';

interface InviteModalProps {
  server: Server;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ server, onClose }) => {
  const [copied, setCopied] = useState(false);
  // Mock invite link
  const inviteLink = `https://discord.gg/${server.name.toLowerCase().replace(/\s/g, '-')}-${Math.floor(Math.random() * 9999)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#313338] w-full max-w-md rounded-lg shadow-2xl flex flex-col relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-[#2B2D31] flex justify-between items-center">
            <h2 className="text-white font-bold text-lg uppercase truncate pr-4">
                Convidar amigos para {server.name}
            </h2>
            <button onClick={onClose} className="text-discord-text-muted hover:text-discord-text-normal transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Body */}
        <div className="p-4">
            <div className="mb-4">
                <label className="block text-xs font-bold text-discord-text-muted uppercase mb-2">
                    Enviar um link de convite para um amigo
                </label>
                <div className="flex bg-[#1E1F22] border border-[#1E1F22] rounded overflow-hidden items-center p-1 focus-within:border-blue-500 transition-colors">
                    <input 
                        type="text" 
                        readOnly 
                        value={inviteLink}
                        className="bg-transparent text-discord-text-normal text-sm w-full px-2 focus:outline-none"
                    />
                    <button 
                        onClick={handleCopy}
                        className={`px-4 py-1.5 rounded text-sm font-medium transition-all duration-200 min-w-[70px]
                        ${copied ? 'bg-discord-green text-white' : 'bg-discord-primary text-white hover:bg-indigo-600'}`}
                    >
                        {copied ? 'Copiado' : 'Copiar'}
                    </button>
                </div>
                <p className="text-xs text-discord-text-muted mt-2">
                    Seu link de convite expira em 7 dias. <span className="text-blue-400 cursor-pointer hover:underline">Editar link de convite.</span>
                </p>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-[#2B2D31] p-4 rounded-b-lg flex flex-col items-center">
             <div className="text-xs text-discord-text-muted mb-2">Ou compartilhe via</div>
             <div className="flex space-x-4">
                 <div className="w-8 h-8 bg-[#5865F2] rounded-full flex items-center justify-center cursor-pointer hover:opacity-80">
                    <span className="text-white font-bold text-xs">tw</span>
                 </div>
                 <div className="w-8 h-8 bg-[#23A559] rounded-full flex items-center justify-center cursor-pointer hover:opacity-80">
                    <span className="text-white font-bold text-xs">wa</span>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};