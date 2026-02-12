export interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  discriminator: string;
  isBot?: boolean;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  channelId: string;
  attachments?: string[];
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Server {
  id: string;
  name: string;
  icon: string;
  channels: Channel[];
  categories: Category[];
  members: User[];
}

export interface VoiceParticipant {
  userId: string;
  speaking: boolean;
  muted: boolean;
  deafened: boolean;
}