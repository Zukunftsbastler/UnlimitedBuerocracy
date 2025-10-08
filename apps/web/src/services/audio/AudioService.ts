/**
 * AudioService – Bürokratie der Unendlichkeit
 * 
 * WebAudio-basierter Service mit Bus-Architektur für SFX, UI, Music und Ambience.
 * Unterstützt Ducking, Lautstärkeregelung und State-zu-Audio-Mapping.
 */

/**
 * Audio-Bus-Typen
 */
export type AudioBus = 'master' | 'sfx' | 'ui' | 'music' | 'amb';

/**
 * Audio-Asset-Definition
 */
interface AudioAsset {
  id: string;
  url: string;
  buffer?: AudioBuffer;
  gain: number; // dB offset
  loop?: boolean;
}

/**
 * Audio-Service für kafkaeske Klanglandschaft
 */
export class AudioService {
  private context?: AudioContext;
  private buses: Map<AudioBus, GainNode> = new Map();
  private assets: Map<string, AudioAsset> = new Map();
  private initialized: boolean = false;
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();

  /**
   * Initialisiert AudioContext und Busse
   * Muss durch User-Interaction getriggert werden (Browser-Policy)
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Master-Bus
      const master = this.context.createGain();
      master.connect(this.context.destination);
      this.buses.set('master', master);

      // Sub-Busse
      const busNames: AudioBus[] = ['sfx', 'ui', 'music', 'amb'];
      for (const name of busNames) {
        const bus = this.context.createGain();
        bus.connect(master);
        this.buses.set(name, bus);
      }

      // Default-Lautstärken
      this.setBusVolume('master', 0.7);
      this.setBusVolume('sfx', 0.8);
      this.setBusVolume('ui', 0.6);
      this.setBusVolume('music', 0.5);
      this.setBusVolume('amb', 0.4);

      this.initialized = true;
      console.log('[AudioService] Initialized');
    } catch (error) {
      console.error('[AudioService] Initialization failed:', error);
    }
  }

  /**
   * Lädt Audio-Assets
   */
  async loadAsset(id: string, url: string, gain: number = 0, loop: boolean = false): Promise<void> {
    if (!this.context) {
      console.warn('[AudioService] Context not initialized');
      return;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await this.context.decodeAudioData(arrayBuffer);

      this.assets.set(id, {
        id,
        url,
        buffer,
        gain,
        loop,
      });

      console.log(`[AudioService] Loaded asset: ${id}`);
    } catch (error) {
      console.error(`[AudioService] Failed to load ${id}:`, error);
    }
  }

  /**
   * Spielt SFX ab
   */
  playSfx(id: string, options?: { volume?: number; rate?: number }): void {
    this.playSound(id, 'sfx', options);
  }

  /**
   * Spielt UI-Sound ab
   */
  playUi(id: string, options?: { volume?: number; rate?: number }): void {
    this.playSound(id, 'ui', options);
  }

  /**
   * Spielt Musik ab
   */
  playMusic(id: string, options?: { loop?: boolean; fadeMs?: number }): void {
    const asset = this.assets.get(id);
    if (!asset || !asset.buffer || !this.context) return;

    // Stoppe vorherige Musik
    this.stopMusic(options?.fadeMs);

    const source = this.context.createBufferSource();
    source.buffer = asset.buffer;
    source.loop = options?.loop ?? asset.loop ?? true;

    const gain = this.context.createGain();
    gain.gain.value = this.dbToLinear(asset.gain);
    
    source.connect(gain);
    const bus = this.buses.get('music');
    if (bus) gain.connect(bus);

    // Fade-In
    if (options?.fadeMs) {
      gain.gain.setValueAtTime(0, this.context.currentTime);
      gain.gain.linearRampToValueAtTime(
        this.dbToLinear(asset.gain),
        this.context.currentTime + options.fadeMs / 1000
      );
    }

    source.start();
    this.activeSources.set('music', source);
  }

  /**
   * Stoppt Musik
   */
  stopMusic(fadeMs?: number): void {
    const source = this.activeSources.get('music');
    if (!source || !this.context) return;

    if (fadeMs) {
      const gain = source.context.createGain();
      gain.gain.setValueAtTime(1, this.context.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.context.currentTime + fadeMs / 1000);
      setTimeout(() => {
        source.stop();
        this.activeSources.delete('music');
      }, fadeMs);
    } else {
      source.stop();
      this.activeSources.delete('music');
    }
  }

  /**
   * Spielt Ambience ab
   */
  playAmb(id: string, loop: boolean = true): void {
    this.playSound(id, 'amb', { volume: 1 });
  }

  /**
   * Internes Play mit Bus-Routing
   */
  private playSound(id: string, busName: AudioBus, options?: { volume?: number; rate?: number }): void {
    const asset = this.assets.get(id);
    if (!asset || !asset.buffer || !this.context) {
      // Stumm abspielen (kein Asset geladen)
      return;
    }

    const source = this.context.createBufferSource();
    source.buffer = asset.buffer;
    source.playbackRate.value = options?.rate ?? 1.0;

    const gain = this.context.createGain();
    const volumeMultiplier = options?.volume ?? 1.0;
    gain.gain.value = this.dbToLinear(asset.gain) * volumeMultiplier;

    source.connect(gain);
    const bus = this.buses.get(busName);
    if (bus) gain.connect(bus);

    source.start();

    // Auto-cleanup
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
  }

  /**
   * Setzt Bus-Lautstärke (0..1)
   */
  setBusVolume(bus: AudioBus, volume: number): void {
    const gainNode = this.buses.get(bus);
    if (gainNode) {
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Ducking: Senkt Musik-Lautstärke temporär
   */
  setDucking(amount: number, releaseMs: number = 400): void {
    const musicBus = this.buses.get('music');
    if (!musicBus || !this.context) return;

    const currentVolume = musicBus.gain.value;
    const targetVolume = currentVolume * (1 - amount);

    musicBus.gain.setValueAtTime(currentVolume, this.context.currentTime);
    musicBus.gain.linearRampToValueAtTime(targetVolume, this.context.currentTime + 0.05);
    musicBus.gain.linearRampToValueAtTime(currentVolume, this.context.currentTime + releaseMs / 1000);
  }

  /**
   * Hilfsfunktion: dB zu linear
   */
  private dbToLinear(db: number): number {
    return Math.pow(10, db / 20);
  }

  /**
   * Event-Hooks (werden von RunController aufgerufen)
   */
  onRunStart(): void {
    // Optional: Starte Ambience
  }

  onRunEnd(): void {
    // Optional: Fade-Out Musik
    this.stopMusic(800);
  }

  onAudit(): void {
    // Optional: Spiele Gong
    this.playSfx('audit_gong');
    this.setDucking(0.5, 600);
  }

  onPowerUp(id: string): void {
    this.playSfx('powerup_activate');
  }

  onOverload(level: number): void {
    if (level > 0.8) {
      // Screen-Wobble-SFX
      this.playSfx('overload_warning');
    }
  }

  /**
   * Gibt Debug-Infos zurück
   */
  getStats(): {
    initialized: boolean;
    assetsLoaded: number;
    activeSources: number;
  } {
    return {
      initialized: this.initialized,
      assetsLoaded: this.assets.size,
      activeSources: this.activeSources.size,
    };
  }
}

/**
 * Singleton-Instanz
 */
export const audioService = new AudioService();
