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
    if (!asset || !asset.buffer || !this.context) {
      console.warn(`[AudioService] Cannot play music ${id}: asset or context missing`);
      return;
    }

    // Stoppe vorherige Musik sofort (ohne Fade)
    const oldSource = this.activeSources.get('music');
    if (oldSource) {
      try {
        oldSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.activeSources.delete('music');
    }

    // Reset music bus volume
    const musicBus = this.buses.get('music');
    if (musicBus) {
      musicBus.gain.cancelScheduledValues(this.context.currentTime);
      musicBus.gain.value = 0.5; // Default music volume
    }

    const source = this.context.createBufferSource();
    source.buffer = asset.buffer;
    source.loop = options?.loop ?? asset.loop ?? true;

    const gain = this.context.createGain();
    gain.gain.value = this.dbToLinear(asset.gain);
    
    source.connect(gain);
    if (musicBus) gain.connect(musicBus);

    // Fade-In
    if (options?.fadeMs && options.fadeMs > 0) {
      gain.gain.setValueAtTime(0, this.context.currentTime);
      gain.gain.linearRampToValueAtTime(
        this.dbToLinear(asset.gain),
        this.context.currentTime + options.fadeMs / 1000
      );
    }

    source.start();
    this.activeSources.set('music', source);
    console.log(`[AudioService] Started music: ${id}`);
  }

  /**
   * Stoppt Musik
   */
  stopMusic(fadeMs?: number): void {
    const source = this.activeSources.get('music');
    if (!source || !this.context) return;

    try {
      if (fadeMs && fadeMs > 0) {
        // Fade-out durch Bus-Lautstärke
        const musicBus = this.buses.get('music');
        if (musicBus) {
          const currentVolume = musicBus.gain.value;
          musicBus.gain.setValueAtTime(currentVolume, this.context.currentTime);
          musicBus.gain.linearRampToValueAtTime(0, this.context.currentTime + fadeMs / 1000);
        }
        
        setTimeout(() => {
          try {
            source.stop();
          } catch (e) {
            // Already stopped
          }
          this.activeSources.delete('music');
          
          // Reset bus volume
          if (musicBus) {
            musicBus.gain.value = 0.5; // Default music volume
          }
        }, fadeMs);
      } else {
        source.stop();
        this.activeSources.delete('music');
      }
    } catch (e) {
      console.warn('[AudioService] Error stopping music:', e);
      this.activeSources.delete('music');
    }
  }

  /**
   * Spielt Ambience ab (looped)
   */
  playAmb(id: string, loop: boolean = true): void {
    const asset = this.assets.get(id);
    if (!asset || !asset.buffer || !this.context) return;

    // Stoppe vorherige Ambience
    this.stopAmb();

    const source = this.context.createBufferSource();
    source.buffer = asset.buffer;
    source.loop = loop;

    const gain = this.context.createGain();
    gain.gain.value = this.dbToLinear(asset.gain);
    
    source.connect(gain);
    const bus = this.buses.get('amb');
    if (bus) gain.connect(bus);

    source.start();
    this.activeSources.set('amb', source);
  }

  /**
   * Stoppt Ambience
   */
  stopAmb(): void {
    const source = this.activeSources.get('amb');
    if (!source) return;

    try {
      source.stop();
    } catch (e) {
      // Already stopped
    }
    this.activeSources.delete('amb');
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
  onRunStart(ambienceId?: string): void {
    // Stoppe Menu-Musik
    this.stopMusic(500);
    
    // Starte Ambience wenn ID gegeben
    if (ambienceId) {
      // Warte kurz nach Musik-Fade
      setTimeout(() => {
        this.playAmb(ambienceId, true);
      }, 600);
    }
  }

  onRunEnd(): void {
    console.log('[AudioService] Run ended - stopping ambience and restarting menu music');
    
    // Stoppe Ambience
    this.stopAmb();
    
    // Starte Menu-Musik wieder (mit etwas Delay)
    setTimeout(() => {
      console.log('[AudioService] Attempting to restart menu music');
      this.playMusic('menu_music', { loop: true, fadeMs: 1000 });
    }, 600);
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
  /**
   * Lädt alle Game-Assets
   */
  async loadGameAssets(): Promise<void> {
    // Menu Music
    await this.loadAsset('menu_music', '/src/assets/audio/music/main_menu.mp3', -3, true);
    
    // Ambience (3 Tracks)
    await this.loadAsset('amb01', '/src/assets/audio/ambience/ambience01.mp3', -6, true);
    await this.loadAsset('amb02', '/src/assets/audio/ambience/ambience02.mp3', -6, true);
    await this.loadAsset('amb03', '/src/assets/audio/ambience/ambience03.mp3', -6, true);
    
    // Stamp sounds (3)
    await this.loadAsset('stamp01', '/src/assets/audio/stamps/stamp01.mp3', -2);
    await this.loadAsset('stamp02', '/src/assets/audio/stamps/stamp02.mp3', -2);
    await this.loadAsset('stamp03', '/src/assets/audio/stamps/stamp03.mp3', -2);
    
    // Frustration sounds (7 sighs)
    await this.loadAsset('sigh01', '/src/assets/audio/reactions/sigh01.mp3', -4);
    await this.loadAsset('sigh02', '/src/assets/audio/reactions/sigh02.mp3', -4);
    await this.loadAsset('sigh03', '/src/assets/audio/reactions/sigh03.mp3', -4);
    await this.loadAsset('sigh04', '/src/assets/audio/reactions/sigh04.mp3', -4);
    await this.loadAsset('sigh05', '/src/assets/audio/reactions/sigh05.mp3', -4);
    await this.loadAsset('sigh06', '/src/assets/audio/reactions/sigh06.mp3', -4);
    await this.loadAsset('sigh07', '/src/assets/audio/reactions/sigh07.mp3', -4);
    
    // Coffee sound
    await this.loadAsset('coffee01', '/src/assets/audio/reactions/coffee01.mp3', -3);
    
    console.log('[AudioService] All game assets loaded');
  }

  /**
   * Spielt zufälligen Stempel-Sound
   */
  playRandomStamp(): void {
    const stamps = ['stamp01', 'stamp02', 'stamp03'];
    const randomStamp = stamps[Math.floor(Math.random() * stamps.length)];
    this.playSfx(randomStamp);
  }

  /**
   * Spielt zufälligen Frustrations-Sound
   */
  playRandomFrustration(): void {
    const sighs = ['sigh01', 'sigh02', 'sigh03', 'sigh04', 'sigh05', 'sigh06', 'sigh07'];
    const randomSigh = sighs[Math.floor(Math.random() * sighs.length)];
    this.playSfx(randomSigh);
  }

  /**
   * Spielt Kaffee-Klecker-Sound
   */
  playCoffeeSpill(): void {
    this.playSfx('coffee01');
  }

  /**
   * Wählt zufällige Ambience-ID
   */
  static selectRandomAmbience(): string {
    const ambiences = ['amb01', 'amb02', 'amb03'];
    return ambiences[Math.floor(Math.random() * ambiences.length)];
  }

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
