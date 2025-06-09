import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Sound {
  id: string;
  name: string;
  file: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private sounds: Sound[] = [
    {
      id: 'rain',
      name: 'Pluie',
      file: 'assets/sounds/rain.mp3',
      icon: 'water_drop'
    },
    {
      id: 'forest',
      name: 'Forêt',
      file: 'assets/sounds/forest.mp3',
      icon: 'forest'
    },
    {
      id: 'waves',
      name: 'Vagues',
      file: 'assets/sounds/waves.mp3',
      icon: 'waves'
    },
    {
      id: 'whitenoise',
      name: 'Bruit blanc',
      file: 'assets/sounds/whitenoise.mp3',
      icon: 'grain'
    }
  ];

  private selectedSoundSubject = new BehaviorSubject<Sound | null>(null);
  selectedSound$ = this.selectedSoundSubject.asObservable();

  private volumeSubject = new BehaviorSubject<number>(0.5); // 0 à 1
  volume$ = this.volumeSubject.asObservable();

  private isMutedSubject = new BehaviorSubject<boolean>(false);
  isMuted$ = this.isMutedSubject.asObservable();

  private audioElement: HTMLAudioElement | null = null;
  private isPlaying = false;

  constructor() {
    // Charger les préférences de son depuis localStorage
    this.loadSoundPreferences();
  }

  // Obtenir la liste des sons disponibles
  getSounds(): Sound[] {
    return [...this.sounds];
  }

  // Sélectionner un son
  selectSound(soundId: string): void {
    const sound = this.sounds.find(s => s.id === soundId);
    if (sound) {
      this.selectedSoundSubject.next(sound);
      localStorage.setItem('meditation-selected-sound', soundId);
      
      if (this.isPlaying) {
        this.stopSound();
        this.playSound();
      }
    }
  }

  // Jouer le son sélectionné
  playSound(): void {
    const sound = this.selectedSoundSubject.value;
    if (!sound) return;

    if (this.audioElement) {
      this.stopSound();
    }

    this.audioElement = new Audio(sound.file);
    this.audioElement.loop = true;
    this.audioElement.volume = this.isMutedSubject.value ? 0 : this.volumeSubject.value;
    
    // Gérer les erreurs de chargement
    this.audioElement.onerror = () => {
      console.error(`Erreur lors du chargement du son: ${sound.file}`);
      this.audioElement = null;
    };
    
    this.audioElement.play().catch(error => {
      console.error('Erreur lors de la lecture du son:', error);
      this.audioElement = null;
    });
    
    this.isPlaying = true;
  }

  // Arrêter le son
  stopSound(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
      this.isPlaying = false;
    }
  }

  // Régler le volume
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.volumeSubject.next(clampedVolume);
    localStorage.setItem('meditation-volume', clampedVolume.toString());
    
    if (this.audioElement && !this.isMutedSubject.value) {
      this.audioElement.volume = clampedVolume;
    }
  }

  // Activer/désactiver le son
  toggleMute(): void {
    const newMuteState = !this.isMutedSubject.value;
    this.isMutedSubject.next(newMuteState);
    localStorage.setItem('meditation-muted', newMuteState.toString());
    
    if (this.audioElement) {
      this.audioElement.volume = newMuteState ? 0 : this.volumeSubject.value;
    }
  }

  // Charger les préférences de son depuis localStorage
  private loadSoundPreferences(): void {
    // Charger le son sélectionné
    const savedSoundId = localStorage.getItem('meditation-selected-sound');
    if (savedSoundId) {
      const sound = this.sounds.find(s => s.id === savedSoundId);
      if (sound) {
        this.selectedSoundSubject.next(sound);
      }
    }
    
    // Charger le volume
    const savedVolume = localStorage.getItem('meditation-volume');
    if (savedVolume) {
      const volume = parseFloat(savedVolume);
      if (!isNaN(volume) && volume >= 0 && volume <= 1) {
        this.volumeSubject.next(volume);
      }
    }
    
    // Charger l'état muet
    const savedMuted = localStorage.getItem('meditation-muted');
    if (savedMuted) {
      this.isMutedSubject.next(savedMuted === 'true');
    }
  }

  // Précharger les sons pour une utilisation ultérieure
  preloadSounds(): void {
    this.sounds.forEach(sound => {
      const audio = new Audio();
      audio.src = sound.file;
      audio.preload = 'auto';
      audio.load();
    });
  }
}
