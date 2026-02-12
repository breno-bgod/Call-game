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
    <div className={`group flex px-4 hover:bg-[#2e3035] ${isConsecutive ? 'py-0.5 mt-0' : 'py-0.5 mt-[17px]'}`}>
      {!isConsecutive ? (
        <div className="mt-0.5 mr-4 cursor-pointer hover:drop-shadow-md">
           <img src={user?.avatar || "https://picsum.photos/200"} alt="avatar" className="w-10 h-10 rounded-full object-cover hover:opacity-80" />
        </div>
      ) : (
        <div className="w-10 mr-4 text-[10px] text-discord-text-muted opacity-0 group-hover:opacity-100 flex items-center justify-end select-none">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        {!isConsecutive && (
          <div className="flex items-center">
            <span className={`font-medium mr-2 hover:underline cursor-pointer ${user?.isBot ? 'text-blue-400' : 'text-white'}`}>
              {user?.username || "Desconhecido"}
            </span>
            {user?.isBot && (
              <span className="bg-[#5865F2] text-white text-[10px] px-1.5 rounded-[3px] flex items-center h-[15px] mr-2">
                BOT
              </span>
            )}
            <span className="text-xs text-discord-text-muted ml-0.5">{dateStr}</span>
          </div>
        )}
        <div className={`text-discord-text-normal whitespace-pre-wrap break-words leading-[1.375rem] ${isConsecutive ? '' : ''}`}>
           {/* Simple Markdown-ish Rendering for Code Blocks */}
           {message.content.split('```').map((part, index) => {
             if (index % 2 === 1) {
               return (
                 <pre key={index} className="bg-[#2B2D31] p-2 rounded border border-[#1E1F22] my-1 overflow-x-auto font-mono text-sm">
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
    <div className="flex-1 flex flex-col bg-[#313338] min-w-0">
      {/* Chat Header */}
      <header className="h-12 px-4 flex items-center justify-between shadow-sm border-b border-[#26272D]">
        <div className="flex items-center text-discord-text-header font-bold">
          <Hash className="text-discord-text-muted mr-2" size={24} />
          <span className="mr-4">{channel.name}</span>
          {channel.name === 'gemini-chat' && (
             <span className="text-xs font-normal text-discord-text-muted bg-[#2B2D31] px-2 py-0.5 rounded">Chat com IA</span>
          )}
        </div>
        
        <div className="flex items-center text-discord-text-muted space-x-4">
          <Bell size={24} className="hover:text-discord-text-normal cursor-pointer hidden md:block" />
          <Pin size={24} className="hover:text-discord-text-normal cursor-pointer hidden md:block" />
          <Users size={24} className={`hover:text-discord-text-normal cursor-pointer md:text-white`} onClick={toggleMembers} />
          
          <div className="relative hidden md:block">
             <input 
               type="text" 
               placeholder="Buscar" 
               className="bg-[#1E1F22] text-sm px-2 py-1 rounded w-36 transition-all focus:w-60 focus:outline-none text-discord-text-normal" 
             />
             <Search size={16} className="absolute right-2 top-1.5" />
          </div>
        </div>
      </header>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Channel Welcome Message */}
        <div className="mt-auto px-4 pb-4 pt-10">
          <div className="w-[68px] h-[68px] bg-[#41434A] rounded-full flex items-center justify-center mb-4">
             <Hash size={42} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo(a) a #{channel.name}!</h1>
          <p className="text-discord-text-muted">Este é o começo do canal #{channel.name}.</p>
          {channel.name === 'gemini-chat' && (
            <p className="text-blue-400 mt-2 text-sm font-medium">✨ Converse com o Gemini Bot aqui! Ele responde a qualquer coisa.</p>
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
             <div className="flex px-4 py-2 mt-2">
                <div className="flex items-center space-x-2">
                   <div className="w-2 h-2 bg-discord-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms'}} />
                   <div className="w-2 h-2 bg-discord-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms'}} />
                   <div className="w-2 h-2 bg-discord-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms'}} />
                   <span className="text-xs text-discord-text-muted ml-2">Gemini está pensando...</span>
                </div>
             </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 pb-6">
        <div className="bg-[#383A40] rounded-lg px-4 py-2.5 flex items-center">
          <PlusCircle className="text-discord-text-muted hover:text-discord-text-normal cursor-pointer mr-4" size={24} />
          
          <input 
            ref={inputRef}
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Conversar em #${channel.name}`}
            className="bg-transparent flex-1 focus:outline-none text-discord-text-normal placeholder-[#949BA4]"
            autoFocus
          />
          
          <div className="flex items-center space-x-3 ml-2 text-discord-text-muted">
            <Gift className="hover:text-discord-text-normal cursor-pointer" size={24} />
            <Sticker className="hover:text-discord-text-normal cursor-pointer" size={24} />
            <Smile className="hover:text-discord-text-normal cursor-pointer" size={24} />
            {inputValue.length > 0 && (
                 <SendHorizontal 
                    onClick={() => {
                        if (inputValue.trim()) {
                            onSendMessage(inputValue);
                            setInputValue('');
                        }
                    }}
                    className="text-discord-primary hover:text-white cursor-pointer transition-colors" 
                    size={24} 
                 />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};