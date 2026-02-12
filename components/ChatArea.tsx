import React, { useRef, useEffect, useState } from 'react';
import { Channel, Message, User, Server } from '../types';
import { Hash, Bell, Pin, Users, Search, PlusCircle, Gift, Sticker, Smile, SendHorizontal } from 'lucide-react';

interface ChatAreaProps {
  channel: Channel;
  server: Server;
  messages: Message[];
  onSendMessage: (content: string) => void;
  members: User[];
  isMobileShowMembers: boolean;
  toggleMembers: () => void;
  isLoadingAi?: boolean;
}

const MessageItem: React.FC<{ message: Message; user?: User; isConsecutive?: boolean }> = ({ message, user, isConsecutive }) => {
  const dateStr = message.timestamp.toLocaleDateString() === new Date().toLocaleDateString()
    ? `Hoje às ${message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : message.timestamp.toLocaleDateString();

  return (
    <div className={`group flex px-6 hover:bg-white/5 transition-colors ${isConsecutive ? 'py-1 mt-0' : 'py-1 mt-4'}`}>
      {!isConsecutive ? (
        <div className="mt-1 mr-4 cursor-pointer hover:scale-105 transition-transform">
           <img src={user?.avatar || "https://picsum.photos/200"} alt="avatar" className="w-10 h-10 rounded-full object-cover shadow-lg" />
        </div>
      ) : (
        <div className="w-10 mr-4 text-[10px] text-gamer-text-muted opacity-0 group-hover:opacity-100 flex items-center justify-end select-none">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        {!isConsecutive && (
          <div className="flex items-center mb-1">
            <span className={`font-bold mr-2 hover:underline cursor-pointer text-sm ${user?.isBot ? 'text-gamer-accent drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'text-white'}`}>
              {user?.username || "Desconhecido"}
            </span>
            {user?.isBot && (
              <span className="bg-gamer-primary/80 text-white text-[9px] px-1.5 rounded-[4px] flex items-center h-[16px] mr-2 font-bold border border-white/20">
                AI
              </span>
            )}
            <span className="text-[10px] text-gamer-text-muted ml-0.5">{dateStr}</span>
          </div>
        )}
        <div className={`text-gamer-text-main/90 whitespace-pre-wrap break-words leading-relaxed text-[15px] font-light ${isConsecutive ? '' : ''}`}>
           {/* Simple Markdown-ish Rendering for Code Blocks */}
           {message.content.split('```').map((part, index) => {
             if (index % 2 === 1) {
               return (
                 <pre key={index} className="bg-black/30 p-3 rounded-xl border border-white/10 my-2 overflow-x-auto font-mono text-sm text-gamer-accent">
                   <code>{part}</code>
                 </pre>
               );
             }
             return <span key={index}>{part}</span>;
           })}
        </div>
      </div>
    </div>
  );
};

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  channel, 
  messages, 
  onSendMessage, 
  members, 
  toggleMembers,
  isLoadingAi
}) => {
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAi]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSendMessage(inputValue);
        setInputValue('');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col glass-panel rounded-[30px] min-w-0 overflow-hidden relative">
      {/* Decorative top sheen */}
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      {/* Chat Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center text-white font-bold text-lg">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 text-gamer-text-muted">
             <Hash size={18} />
          </div>
          <span className="mr-3 drop-shadow-md">{channel.name}</span>
          {channel.name === 'gemini-chat' && (
             <span className="text-[10px] font-bold text-gamer-secondary bg-gamer-secondary/10 px-2 py-0.5 rounded-full border border-gamer-secondary/30">AI Powered</span>
          )}
        </div>
        
        <div className="flex items-center text-gamer-text-muted space-x-4">
          <Bell size={20} className="hover:text-white cursor-pointer transition-colors hidden md:block" />
          <Pin size={20} className="hover:text-white cursor-pointer transition-colors hidden md:block" />
          <Users size={20} className={`hover:text-white cursor-pointer transition-colors md:text-gamer-text-muted`} onClick={toggleMembers} />
          
          <div className="relative hidden md:block">
             <input 
               type="text" 
               placeholder="Buscar..." 
               className="bg-black/20 border border-white/5 text-sm px-3 pl-8 py-1.5 rounded-full w-40 transition-all focus:w-60 focus:outline-none focus:border-gamer-primary/50 text-white placeholder-white/30" 
             />
             <Search size={14} className="absolute left-2.5 top-2.5 text-white/30" />
          </div>
        </div>
      </header>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Channel Welcome Message */}
        <div className="mt-auto px-6 pb-6 pt-10">
          <div className="w-16 h-16 bg-gradient-to-br from-gamer-card to-black/40 rounded-3xl flex items-center justify-center mb-4 shadow-lg border border-white/10">
             <Hash size={40} className="text-white opacity-80" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gamer-text-muted mb-2">
            Bem-vindo(a) a #{channel.name}!
          </h1>
          <p className="text-gamer-text-muted">Este é o começo da lendária jornada em #{channel.name}.</p>
          {channel.name === 'gemini-chat' && (
            <p className="text-gamer-accent mt-2 text-sm font-medium flex items-center gap-2">
               <span className="inline-block w-2 h-2 rounded-full bg-gamer-accent animate-pulse"></span>
               Converse com o Gemini Bot aqui! Ele é super inteligente.
            </p>
          )}
        </div>

        <div className="flex flex-col pb-4">
          {messages.map((msg, index) => {
            const prevMsg = messages[index - 1];
            const isConsecutive = prevMsg && prevMsg.senderId === msg.senderId && (msg.timestamp.getTime() - prevMsg.timestamp.getTime() < 5 * 60 * 1000);
            const user = members.find(m => m.id === msg.senderId);
            return (
              <MessageItem 
                key={msg.id} 
                message={msg} 
                user={user} 
                isConsecutive={!!isConsecutive} 
              />
            );
          })}
          
          {isLoadingAi && (
             <div className="flex px-6 py-2 mt-2">
                <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full rounded-tl-none">
                   <div className="w-2 h-2 bg-gamer-accent rounded-full animate-bounce" style={{ animationDelay: '0ms'}} />
                   <div className="w-2 h-2 bg-gamer-accent rounded-full animate-bounce" style={{ animationDelay: '150ms'}} />
                   <div className="w-2 h-2 bg-gamer-accent rounded-full animate-bounce" style={{ animationDelay: '300ms'}} />
                   <span className="text-xs text-gamer-text-muted ml-2">Pensando...</span>
                </div>
             </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="px-6 pb-6 pt-2">
        <div className="bg-black/30 backdrop-blur-md rounded-full px-2 py-2 flex items-center border border-white/10 focus-within:border-gamer-primary/50 focus-within:ring-1 focus-within:ring-gamer-primary/50 transition-all shadow-lg">
          <button className="p-2 rounded-full hover:bg-white/10 text-gamer-text-muted hover:text-white transition-colors">
            <PlusCircle size={22} />
          </button>
          
          <input 
            ref={inputRef}
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Conversar em #${channel.name}`}
            className="bg-transparent flex-1 focus:outline-none text-white placeholder-white/30 px-2"
            autoFocus
          />
          
          <div className="flex items-center space-x-1 mr-2 text-gamer-text-muted">
            <button className="p-2 hover:bg-white/10 rounded-full hover:text-white transition-colors"><Gift size={20} /></button>
            <button className="p-2 hover:bg-white/10 rounded-full hover:text-white transition-colors"><Sticker size={20} /></button>
            <button className="p-2 hover:bg-white/10 rounded-full hover:text-white transition-colors"><Smile size={20} /></button>
            {inputValue.length > 0 && (
                 <button 
                    onClick={() => {
                        if (inputValue.trim()) {
                            onSendMessage(inputValue);
                            setInputValue('');
                        }
                    }}
                    className="p-2 bg-gamer-primary text-white rounded-full hover:bg-gamer-primary/80 transition-all ml-2 shadow-[0_0_10px_#6366f1]" 
                 >
                    <SendHorizontal size={18} />
                 </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};