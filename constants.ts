import { Server, User } from './types';

export const CURRENT_USER: User = {
  id: 'me',
  username: 'Visitante',
  discriminator: '0000',
  avatar: 'https://picsum.photos/id/64/200/200',
  status: 'online'
};

export const GEMINI_BOT_USER: User = {
  id: 'gemini',
  username: 'Gemini AI',
  discriminator: 'BOT',
  avatar: 'https://picsum.photos/id/20/200/200', // Robot-ish placeholder
  status: 'online',
  isBot: true
};

const MEMBERS: User[] = [
  CURRENT_USER,
  GEMINI_BOT_USER,
  { id: 'u1', username: 'Darth Vader', discriminator: '6666', avatar: 'https://picsum.photos/id/237/200/200', status: 'dnd' },
  { id: 'u2', username: 'Luke S.', discriminator: '1977', avatar: 'https://picsum.photos/id/1025/200/200', status: 'idle' },
  { id: 'u3', username: 'Leia O.', discriminator: '1234', avatar: 'https://picsum.photos/id/1011/200/200', status: 'offline' },
];

export const MOCK_SERVERS: Server[] = [
  {
    id: 's1',
    name: 'Comunidade React',
    icon: 'https://picsum.photos/id/1084/200/200',
    categories: [
      { id: 'c1', name: 'Informações' },
      { id: 'c2', name: 'Canais de Texto' },
      { id: 'c3', name: 'Canais de Voz' }
    ],
    channels: [
      { id: 'ch1', name: 'boas-vindas', type: 'text', categoryId: 'c1' },
      { id: 'ch2', name: 'regras', type: 'text', categoryId: 'c1' },
      { id: 'ch3', name: 'geral', type: 'text', categoryId: 'c2' },
      { id: 'ch4', name: 'ajuda-react', type: 'text', categoryId: 'c2' },
      { id: 'ch5', name: 'gemini-chat', type: 'text', categoryId: 'c2' }, // AI Channel
      { id: 'ch6', name: 'Geral Voz', type: 'voice', categoryId: 'c3' },
      { id: 'ch7', name: 'Jogos', type: 'voice', categoryId: 'c3' },
    ],
    members: MEMBERS
  },
  {
    id: 's2',
    name: 'Jogos RPG',
    icon: 'https://picsum.photos/id/1040/200/200',
    categories: [{ id: 'cat_rpg', name: 'Geral' }],
    channels: [
      { id: 'ch_rpg1', name: 'taverna', type: 'text', categoryId: 'cat_rpg' }
    ],
    members: MEMBERS
  },
  {
    id: 's3',
    name: 'Midjourney & AI',
    icon: 'https://picsum.photos/id/106/200/200',
    categories: [{ id: 'cat_ai', name: 'Geral' }],
    channels: [
        { id: 'ch_ai1', name: 'showcase', type: 'text', categoryId: 'cat_ai' }
    ],
    members: MEMBERS
  }
];