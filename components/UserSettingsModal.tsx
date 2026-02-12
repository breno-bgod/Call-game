import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { X, LogOut, Edit2, Shield, Monitor, Check, Mic, Speaker, Bell, Key, Eye, Image as ImageIcon, Cpu, Globe, Activity } from 'lucide-react';

interface UserSettingsModalProps {
  user: User;
  onClose: () => void;
  inputDeviceId: string;
  setInputDeviceId: (id: string) => void;
}

// --- Reusable UI Components for Settings ---

const ToggleItem = ({ label, description, checked, onChange }: { label: string, description?: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="mr-4">
      <div className="text-discord-text-header font-medium mb-1">{label}</div>
      {description && <div className="text-discord-text-muted text-xs">{description}</div>}
    </div>
    <div 
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors shrink-0 flex items-center ${checked ? 'bg-discord-green' : 'bg-[#80848E]'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <h2 className="text-xs font-bold text-discord-text-muted uppercase mb-4 mt-8">{title}</h2>
);

const RadioItem = ({ label, value, selected, onSelect, colorClass }: { label: string, value: string, selected: boolean, onSelect: (v: string) => void, colorClass?: string }) => (
    <div 
        onClick={() => onSelect(value)}
        className={`flex items-center p-3 rounded cursor-pointer mb-2 bg-[#2B2D31] hover:bg-[#404249] transition-colors`}
    >
        <div className="relative flex items-center justify-center w-5 h-5 border-2 border-discord-text-muted rounded-full mr-3">
             {selected && <div className="w-2.5 h-2.5 bg-discord-text-header rounded-full" />}
        </div>
        <div className="flex-1">
            <span className="text-discord-text-header font-medium">{label}</span>
        </div>
        {colorClass && <div className={`w-6 h-6 rounded-full ${colorClass} ml-2`} />}
    </div>
);

const SliderItem = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="mb-6">
        <div className="flex justify-between mb-2">
            <span className="text-discord-text-header font-medium text-xs uppercase">{label}</span>
            <span className="text-discord-text-header font-medium text-xs">{value}%</span>
        </div>
        <input 
            type="range" 
            min="0" 
            max="100" 
            value={value} 
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-2 bg-[#4E5058] rounded-lg appearance-none cursor-pointer accent-discord-primary"
        />
    </div>
);

// --- Content Components ---

const MyAccountContent = ({ user }: { user: User }) => (
    <div className="animate-in slide-in-from-right-4 duration-300">
        <h1 className="text-xl font-bold text-white mb-6">Minha Conta</h1>
        
        <div className="bg-[#1E1F22] rounded-lg overflow-hidden mb-8">
            <div className="h-[100px] bg-discord-primary w-full"></div>
            <div className="px-4 pb-4 relative">
                <div className="absolute -top-[40px] left-4 p-1.5 bg-[#1E1F22] rounded-full">
                    <img src={user.avatar} alt="avatar" className="w-20 h-20 rounded-full" />
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-discord-green rounded-full border-[4px] border-[#1E1F22]"></div>
                </div>

                <div className="flex justify-between items-end mt-3 ml-[90px] mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">{user.username}</h2>
                        <span className="text-discord-text-muted">#{user.discriminator}</span>
                    </div>
                    <button className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">
                        Editar Perfil
                    </button>
                </div>

                <div className="bg-[#2B2D31] rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <label className="text-xs font-bold text-discord-text-muted uppercase block mb-1">Nome de Exibição</label>
                            <span className="text-discord-text-normal text-sm">{user.username}</span>
                        </div>
                        <button className="bg-[#383A40] hover:bg-[#404249] text-discord-text-normal p-1.5 rounded"><Edit2 size={16} /></button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <div>
                            <label className="text-xs font-bold text-discord-text-muted uppercase block mb-1">E-mail</label>
                            <span className="text-discord-text-normal text-sm flex items-center">
                                {user.username.toLowerCase()}@exemplo.com <span className="text-discord-green ml-2 text-[10px] hidden md:inline">(Verificado)</span>
                            </span>
                        </div>
                        <button className="bg-[#383A40] hover:bg-[#404249] text-discord-text-normal p-1.5 rounded"><Edit2 size={16} /></button>
                    </div>
                </div>
            </div>
        </div>

        <div className="h-[1px] bg-[#3F4147] mb-8" />
        <h2 className="text-xl font-bold text-white mb-4">Autenticação e Senha</h2>
        <div className="flex flex-col gap-4">
            <button className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded w-fit text-sm font-medium transition-colors">Alterar Senha</button>
            <div className="flex items-center justify-between bg-[#2B2D31] p-4 rounded-lg border border-[#1E1F22]">
                <div className="flex items-center gap-4">
                    <Shield className="text-discord-text-muted" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-discord-text-muted uppercase">Autenticação em Dois Fatores</span>
                        <span className="text-sm text-discord-text-normal">Proteja sua conta com 2FA.</span>
                    </div>
                </div>
                <button className="bg-[#2B2D31] hover:bg-[#35373C] text-discord-text-normal px-4 py-1.5 rounded text-sm font-medium transition-colors border border-gray-600">Habilitar Autenticação</button>
            </div>
        </div>
    </div>
);

const ProfilesContent = ({ user }: { user: User }) => (
    <div className="animate-in slide-in-from-right-4 duration-300">
        <h1 className="text-xl font-bold text-white mb-6">Perfis</h1>
        <div className="flex gap-6">
            <div className="flex-1">
                <SectionHeader title="Aparência do Perfil" />
                <div className="bg-[#2B2D31] p-4 rounded-lg mb-4">
                    <label className="text-xs font-bold text-discord-text-muted uppercase block mb-2">Sobre Mim</label>
                    <textarea 
                        className="w-full bg-[#1E1F22] text-discord-text-normal p-2 rounded text-sm focus:outline-none resize-none h-24"
                        placeholder="Conte um pouco sobre você..."
                        defaultValue="Entusiasta de React e UI Design."
                    />
                </div>
                <div className="h-[1px] bg-[#3F4147] my-6" />
                <SectionHeader title="Cor do Banner" />
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-discord-primary rounded cursor-pointer ring-2 ring-white"></div>
                    <div className="w-12 h-12 bg-[#F23F42] rounded cursor-pointer"></div>
                    <div className="w-12 h-12 bg-[#23A559] rounded cursor-pointer"></div>
                    <div className="w-12 h-12 bg-[#F0B232] rounded cursor-pointer"></div>
                </div>
            </div>
            {/* Preview Card */}
            <div className="w-[300px] shrink-0">
                <SectionHeader title="Pré-visualização" />
                <div className="w-[300px] bg-[#111214] rounded-lg shadow-xl overflow-hidden border border-[#2B2D31]">
                    <div className="h-[105px] bg-discord-primary"></div>
                    <div className="px-4 pb-4 relative">
                        <div className="absolute -top-[50px] left-4 p-[6px] bg-[#111214] rounded-full">
                            <img src={user.avatar} className="w-20 h-20 rounded-full" alt="avatar" />
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-discord-green rounded-full border-[4px] border-[#111214]"></div>
                        </div>
                        <div className="mt-14 bg-[#2B2D31] rounded-lg p-3">
                            <div className="font-bold text-white text-lg">{user.username}</div>
                            <div className="text-discord-text-muted text-sm border-b border-[#3F4147] pb-3 mb-3">#{user.discriminator}</div>
                            <div className="text-xs font-bold text-discord-text-muted uppercase mb-1">Sobre mim</div>
                            <div className="text-sm text-discord-text-normal">Entusiasta de React e UI Design.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const PrivacyContent = () => {
    const [scan, setScan] = useState(true);
    return (
        <div className="animate-in slide-in-from-right-4 duration-300">
            <h1 className="text-xl font-bold text-white mb-6">Privacidade e Segurança</h1>
            <SectionHeader title="Segurança de Mensagem Direta" />
            <div className="bg-[#2B2D31] p-4 rounded-lg mb-6">
                <div className="text-discord-text-normal mb-2">Analisar mensagens diretas de todos</div>
                <div className="text-xs text-discord-text-muted mb-4">A gente analisa suas mensagens diretas em busca de conteúdo explícito.</div>
                
                <RadioItem label="Mantenha-me em segurança" value="safe" selected={scan} onSelect={() => setScan(true)} />
                <RadioItem label="Não analisar nada" value="unsafe" selected={!scan} onSelect={() => setScan(false)} />
            </div>

            <SectionHeader title="Privacidade do Servidor" />
            <ToggleItem label="Permitir mensagens diretas de membros do servidor" checked={true} onChange={() => {}} description="Essa configuração é aplicada quando você entra em um novo servidor." />
            
            <SectionHeader title="Como usamos seus dados" />
            <ToggleItem label="Usar dados para melhorar o Discord" checked={true} onChange={() => {}} />
            <ToggleItem label="Usar dados para personalizar minha experiência" checked={true} onChange={() => {}} />
        </div>
    )
};

const VoiceVideoContent = ({ 
    inputDeviceId, 
    setInputDeviceId 
}: { 
    inputDeviceId: string, 
    setInputDeviceId: (id: string) => void 
}) => {
    const [inputVol, setInputVol] = useState(50);
    const [outputVol, setOutputVol] = useState(80);
    const [echo, setEcho] = useState(true);
    const [noise, setNoise] = useState(true);
    
    // Devices
    const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
    const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
    
    // Mic Test
    const [isTestingMic, setIsTestingMic] = useState(false);
    const [testVolume, setTestVolume] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const testStreamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        // Enumerate devices on mount
        const fetchDevices = async () => {
            try {
                // Ensure permission is granted to list labels by asking briefly
                // We don't keep this stream, just to unlock labels
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(t => t.stop());
                
                const devices = await navigator.mediaDevices.enumerateDevices();
                setInputDevices(devices.filter(d => d.kind === 'audioinput'));
                setOutputDevices(devices.filter(d => d.kind === 'audiooutput'));
            } catch (e) {
                console.error("Error enumerating devices", e);
            }
        };
        fetchDevices();
        
        navigator.mediaDevices.addEventListener('devicechange', fetchDevices);
        return () => navigator.mediaDevices.removeEventListener('devicechange', fetchDevices);
    }, []);

    // Cleanup when component unmounts if testing
    useEffect(() => {
        return () => {
            stopMicTest();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startMicTest = async () => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: inputDeviceId && inputDeviceId !== 'default' 
                    ? { deviceId: { exact: inputDeviceId } } 
                    : true
            });
            testStreamRef.current = stream;

            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            
            // Connect to destination to hear yourself (Loopback)
            source.connect(analyser);
            analyser.connect(ctx.destination);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            const updateVolume = () => {
                if (!analyser) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for(let i=0; i<dataArray.length; i++) sum += dataArray[i];
                const avg = sum / dataArray.length;
                
                // Scale somewhat visually pleasing (0-100)
                setTestVolume(Math.min(100, (avg / 128) * 100));
                
                animationFrameRef.current = requestAnimationFrame(updateVolume);
            };
            
            updateVolume();
            setIsTestingMic(true);
        } catch (e) {
            console.error("Failed to start mic test", e);
            alert("Erro ao iniciar teste: " + (e as any).message);
        }
    };

    const stopMicTest = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (testStreamRef.current) {
            testStreamRef.current.getTracks().forEach(t => t.stop());
            testStreamRef.current = null;
        }
        if (audioContextRef.current) {
            if (audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            audioContextRef.current = null;
        }
        setIsTestingMic(false);
        setTestVolume(0);
    };

    return (
        <div className="animate-in slide-in-from-right-4 duration-300">
            <h1 className="text-xl font-bold text-white mb-6">Voz e Vídeo</h1>
            
            <div className="flex gap-4 mb-6">
                <div className="flex-1">
                    <label className="text-xs font-bold text-discord-text-muted uppercase block mb-2">Dispositivo de Entrada</label>
                    <div className="relative">
                        <select 
                            value={inputDeviceId}
                            onChange={(e) => {
                                setInputDeviceId(e.target.value);
                                // If testing, restart test with new device
                                if (isTestingMic) {
                                    stopMicTest();
                                    setTimeout(() => startMicTest(), 200);
                                }
                            }}
                            className="bg-[#1E1F22] p-2.5 rounded w-full appearance-none text-discord-text-normal focus:outline-none border border-[#1E1F22] focus:border-black cursor-pointer"
                        >
                            <option value="default">Default</option>
                            {inputDevices.map(device => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Microphone ${device.deviceId.slice(0,5)}...`}
                                </option>
                            ))}
                        </select>
                         <Mic size={16} className="absolute right-3 top-3 text-discord-text-muted pointer-events-none" />
                    </div>
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-discord-text-muted uppercase block mb-2">Dispositivo de Saída</label>
                    <div className="relative">
                        <select 
                            className="bg-[#1E1F22] p-2.5 rounded w-full appearance-none text-discord-text-normal focus:outline-none border border-[#1E1F22] focus:border-black cursor-pointer"
                        >
                            <option value="default">Default</option>
                            {outputDevices.map(device => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Speaker ${device.deviceId.slice(0,5)}...`}
                                </option>
                            ))}
                        </select>
                        <Speaker size={16} className="absolute right-3 top-3 text-discord-text-muted pointer-events-none" />
                    </div>
                </div>
            </div>

            <SliderItem label="Volume de Entrada" value={inputVol} onChange={setInputVol} />
            <SliderItem label="Volume de Saída" value={outputVol} onChange={setOutputVol} />

            <div className="h-[1px] bg-[#3F4147] my-6" />
            
            <SectionHeader title="Teste de Microfone" />
            <div className="mb-6">
                <div className="text-xs text-discord-text-muted mb-2">Está com problemas? Vamos verificar seu microfone.</div>
                <div className="bg-[#1E1F22] p-3 rounded-lg flex items-center">
                    <button 
                        onClick={isTestingMic ? stopMicTest : startMicTest}
                        className={`px-6 py-2 rounded text-sm font-medium mr-4 shrink-0 transition-colors w-28
                        ${isTestingMic ? 'bg-discord-red hover:bg-red-600 text-white' : 'bg-[#5865F2] hover:bg-[#4752C4] text-white'}`}
                    >
                        {isTestingMic ? 'Parar' : 'Vamos lá'}
                    </button>
                    <div className="flex-1 h-2 bg-[#2B2D31] rounded-full overflow-hidden relative">
                        {isTestingMic ? (
                             <div 
                                className="h-full bg-discord-green rounded-full transition-all duration-75"
                                style={{ width: `${testVolume}%` }} 
                             />
                        ) : (
                             <div className="h-full w-0 bg-discord-green rounded-full" />
                        )}
                    </div>
                </div>
                {isTestingMic && <div className="text-xs text-discord-green mt-2">Você deve estar se ouvindo agora (Loopback ativo).</div>}
            </div>

            <div className="h-[1px] bg-[#3F4147] my-6" />

            <SectionHeader title="Avançado" />
            <ToggleItem label="Cancelamento de Eco" checked={echo} onChange={setEcho} />
            <ToggleItem label="Supressão de Ruído" checked={noise} onChange={setNoise} description="Suprime o ruído de fundo do seu microfone." />
            <ToggleItem label="Controle Automático de Ganho" checked={true} onChange={() => {}} />
        </div>
    );
};

const AppearanceContent = () => {
    const [theme, setTheme] = useState('dark');
    const [fontSize, setFontSize] = useState(16);

    return (
        <div className="animate-in slide-in-from-right-4 duration-300">
             <h1 className="text-xl font-bold text-white mb-6">Aparência</h1>
             
             <SectionHeader title="Tema" />
             <div className="flex gap-4 mb-8">
                 <div onClick={() => setTheme('dark')} className="cursor-pointer">
                     <div className={`w-32 h-20 rounded-lg bg-[#2B2D31] border-2 mb-2 relative ${theme === 'dark' ? 'border-discord-green' : 'border-transparent'}`}>
                        {theme === 'dark' && <div className="absolute top-1 right-1 bg-discord-green rounded-full p-0.5"><Check size={12} className="text-white" /></div>}
                        <div className="p-2 space-y-1">
                            <div className="h-2 w-16 bg-[#404249] rounded"></div>
                            <div className="h-2 w-10 bg-[#404249] rounded"></div>
                        </div>
                     </div>
                     <div className="text-center text-xs font-medium text-discord-text-normal">Escuro</div>
                 </div>
                 <div onClick={() => setTheme('light')} className="cursor-pointer">
                     <div className={`w-32 h-20 rounded-lg bg-white border-2 mb-2 relative ${theme === 'light' ? 'border-discord-green' : 'border-transparent'}`}>
                        {theme === 'light' && <div className="absolute top-1 right-1 bg-discord-green rounded-full p-0.5"><Check size={12} className="text-white" /></div>}
                        <div className="p-2 space-y-1">
                            <div className="h-2 w-16 bg-gray-200 rounded"></div>
                            <div className="h-2 w-10 bg-gray-200 rounded"></div>
                        </div>
                     </div>
                     <div className="text-center text-xs font-medium text-discord-text-normal">Claro</div>
                 </div>
             </div>

             <div className="h-[1px] bg-[#3F4147] my-6" />

             <SectionHeader title="Exibição da Mensagem" />
             <div className="mb-4">
                 <RadioItem label="Aconchegante" value="cozy" selected={true} onSelect={() => {}} />
                 <RadioItem label="Compacto" value="compact" selected={false} onSelect={() => {}} />
             </div>

             <SectionHeader title="Escala da Fonte" />
             <div className="flex items-center gap-4">
                 <span className="text-xs text-discord-text-muted">12px</span>
                 <input type="range" min="12" max="24" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="flex-1 h-2 bg-[#4E5058] rounded-lg appearance-none cursor-pointer accent-discord-primary" />
                 <span className="text-xl text-discord-text-header font-bold">{fontSize}px</span>
             </div>
        </div>
    );
};

const AuthorizedAppsContent = () => (
    <div className="animate-in slide-in-from-right-4 duration-300">
        <h1 className="text-xl font-bold text-white mb-6">Aplicativos Autorizados</h1>
        <div className="text-discord-text-muted text-sm mb-6">Estes são os aplicativos que você conectou à sua conta. Eles podem acessar informações limitadas.</div>
        
        <div className="bg-[#2B2D31] rounded p-4 flex justify-between items-center mb-2 border-b border-[#1E1F22]">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1DB954] rounded flex items-center justify-center font-bold text-white text-xl">S</div>
                <div>
                    <div className="font-bold text-white">Spotify</div>
                    <div className="text-xs text-discord-text-muted">Adicionado em 12/05/2023</div>
                </div>
            </div>
            <button className="bg-[#2B2D31] border border-red-500 text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded text-xs font-medium">Desautorizar</button>
        </div>
        
        <div className="bg-[#2B2D31] rounded p-4 flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded flex items-center justify-center overflow-hidden">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" className="w-8" alt="G" />
                 </div>
                <div>
                    <div className="font-bold text-white">Google Gemini</div>
                    <div className="text-xs text-discord-text-muted">Adicionado hoje</div>
                </div>
            </div>
            <button className="bg-[#2B2D31] border border-red-500 text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded text-xs font-medium">Desautorizar</button>
        </div>
    </div>
);

const PlaceholderContent = ({ title, icon: Icon, text }: { title: string, icon: any, text: string }) => (
     <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in zoom-in-95 duration-200">
        <div className="w-24 h-24 bg-[#2B2D31] rounded-full flex items-center justify-center mb-6">
            <Icon size={48} className="text-discord-text-muted" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-discord-text-muted max-w-md">{text}</p>
    </div>
);

// --- Main Modal Component ---

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ user, onClose, inputDeviceId, setInputDeviceId }) => {
  const [activeTab, setActiveTab] = useState('minha-conta');

  // Close on ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const SidebarItem = ({ id, label, isRed = false }: { id: string, label: string, isRed?: boolean }) => (
    <div 
      onClick={() => setActiveTab(id)}
      className={`px-2 py-1.5 rounded mb-0.5 cursor-pointer text-sm font-medium transition-colors
      ${activeTab === id && !isRed ? 'bg-[#404249] text-white' : ''}
      ${isRed ? 'text-discord-red hover:bg-[#404249]/20' : 'text-discord-text-muted hover:bg-[#35373C] hover:text-discord-text-normal'}
      ${activeTab !== id && !isRed ? '' : ''}
      `}
    >
      {label}
    </div>
  );

  const renderContent = () => {
      switch(activeTab) {
          case 'minha-conta': return <MyAccountContent user={user} />;
          case 'perfis': return <ProfilesContent user={user} />;
          case 'privacidade': return <PrivacyContent />;
          case 'voz-video': return <VoiceVideoContent inputDeviceId={inputDeviceId} setInputDeviceId={setInputDeviceId} />;
          case 'aparencia': return <AppearanceContent />;
          case 'autorizados': return <AuthorizedAppsContent />;
          
          case 'familia': 
            return <PlaceholderContent title="Central da Família" icon={Activity} text="Mantenha-se informado sobre as atividades e amizades de seus filhos adolescentes no Discord." />;
          case 'conexoes':
            return <PlaceholderContent title="Conexões" icon={Globe} text="Conecte suas contas do PlayStation, Xbox, Spotify, Reddit e mais para exibir no seu perfil." />;
          case 'acessibilidade':
             return <PlaceholderContent title="Acessibilidade" icon={Eye} text="Opções de saturação de cor, contraste reduzido e controle de movimento." />;
          case 'chat':
             return <PlaceholderContent title="Texto e Imagens" icon={ImageIcon} text="Controle como imagens, vídeos e links são exibidos no chat." />;
          case 'notificacoes':
             return <PlaceholderContent title="Notificações" icon={Bell} text="Gerencie seus sons, notificações push e emblemas de não lido." />;
          default:
             return <PlaceholderContent title="Em Construção" icon={Monitor} text="Esta seção ainda está sendo construída." />;
      }
  };

  return (
    <div className="fixed inset-0 bg-[#313338] z-50 flex animate-in fade-in duration-200 font-sans">
      {/* Sidebar */}
      <div className="w-[35%] min-w-[200px] max-w-[300px] bg-[#2B2D31] flex justify-end pt-14 pb-4">
        <div className="w-[190px] pr-2 custom-scrollbar overflow-y-auto">
          <div className="text-xs font-bold text-discord-text-muted uppercase mb-2 px-2">Configurações de Usuário</div>
          <SidebarItem id="minha-conta" label="Minha Conta" />
          <SidebarItem id="perfis" label="Perfis" />
          <SidebarItem id="privacidade" label="Privacidade e Segurança" />
          <SidebarItem id="familia" label="Central da Família" />
          <SidebarItem id="autorizados" label="Aplicativos Autorizados" />
          <SidebarItem id="conexoes" label="Conexões" />
          
          <div className="h-[1px] bg-[#3F4147] my-2 mx-2" />
          
          <div className="text-xs font-bold text-discord-text-muted uppercase mb-2 px-2 mt-4">Configurações do App</div>
          <SidebarItem id="aparencia" label="Aparência" />
          <SidebarItem id="acessibilidade" label="Acessibilidade" />
          <SidebarItem id="voz-video" label="Voz e Vídeo" />
          <SidebarItem id="chat" label="Texto e Imagens" />
          <SidebarItem id="notificacoes" label="Notificações" />

          <div className="h-[1px] bg-[#3F4147] my-2 mx-2" />
          
          <div 
             className="px-2 py-1.5 rounded mb-0.5 cursor-pointer text-sm font-medium transition-colors text-discord-red hover:bg-[#404249]/20 flex items-center justify-between"
             onClick={onClose}
          >
            <span>Sair</span>
            <LogOut size={14} />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-[#313338] pt-14 px-10 flex overflow-y-auto">
        <div className="max-w-[700px] w-full min-w-[460px] pb-20">
          
          {/* Close Button Layout (Floating right) */}
          <div className="fixed top-0 right-0 pt-14 pr-[calc((100vw-700px)/2-100px)] flex flex-col items-center">
             <div 
                onClick={onClose}
                className="group flex flex-col items-center cursor-pointer ml-8 mt-2"
             >
                <div className="w-9 h-9 border-2 border-discord-text-muted rounded-full flex items-center justify-center text-discord-text-muted group-hover:bg-discord-text-muted/10 transition-all">
                    <X size={20} />
                </div>
                <span className="text-xs font-bold text-discord-text-muted mt-1 uppercase group-hover:text-white transition-colors">Esc</span>
             </div>
          </div>

          {renderContent()}

        </div>
      </div>
    </div>
  );
};