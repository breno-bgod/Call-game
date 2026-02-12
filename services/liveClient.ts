import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export class GeminiLiveClient {
  private ai: GoogleGenAI;
  private context: AudioContext;
  private inputContext: AudioContext;
  private nextStartTime: number = 0;
  private sources: Set<AudioBufferSourceNode> = new Set();
  private sessionPromise: Promise<any> | null = null;
  
  public onBotSpeakingChange: (isSpeaking: boolean) => void = () => {};
  
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Output context for playing audio
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    // Input context for processing microphone (Gemini prefers 16kHz input)
    this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  }

  async connect(stream: MediaStream) {
    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: "Você é um participante de um chat de voz do Discord. Aja de forma casual, breve e divertida. Não faça discursos longos.",
      },
      callbacks: {
        onopen: () => {
          console.log("Gemini Live Connected");
          this.processInputStream(stream);
        },
        onmessage: (message: LiveServerMessage) => {
          this.handleMessage(message);
        },
        onclose: () => {
          console.log("Gemini Live Closed");
        },
        onerror: (err) => {
          console.error("Gemini Live Error", err);
        }
      }
    });
  }

  private processInputStream(stream: MediaStream) {
    const source = this.inputContext.createMediaStreamSource(stream);
    // Buffer size 4096, 1 input channel, 1 output channel
    const processor = this.inputContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createBlob(inputData);
      
      this.sessionPromise?.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    source.connect(processor);
    processor.connect(this.inputContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
      this.onBotSpeakingChange(true);
      
      const audioBuffer = await this.decodeAudioData(
        this.decode(base64Audio),
        this.context,
        24000,
        1
      );

      this.nextStartTime = Math.max(this.nextStartTime, this.context.currentTime);
      
      const source = this.context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.context.destination);
      
      source.onended = () => {
        this.sources.delete(source);
        if (this.sources.size === 0) {
            // Slight delay to prevent flickering
            setTimeout(() => this.onBotSpeakingChange(false), 200);
        }
      };

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.sources.add(source);
    }

    if (message.serverContent?.interrupted) {
      this.sources.forEach(source => source.stop());
      this.sources.clear();
      this.nextStartTime = 0;
      this.onBotSpeakingChange(false);
    }
  }

  disconnect() {
    // There isn't a direct disconnect method exposed on the session object easily in this pattern
    // usually, but closing contexts stops processing.
    this.sources.forEach(s => s.stop());
    this.context.close();
    this.inputContext.close();
  }

  // --- Helpers ---

  private createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      // Convert float (-1.0 to 1.0) to int16
      int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
    }
    
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);

    return {
      data: b64,
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}