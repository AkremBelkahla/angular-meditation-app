import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SoundService, Sound } from '../../services/sound.service';

@Component({
  selector: 'app-sound-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sound-selector.component.html',
  styleUrls: ['./sound-selector.component.scss']
})
export class SoundSelectorComponent implements OnInit, OnDestroy {
  sounds: Sound[] = [];
  selectedSound: Sound | null = null;
  volume = 0.5;
  isMuted = false;
  
  private soundSubscription: Subscription | null = null;
  private volumeSubscription: Subscription | null = null;
  private mutedSubscription: Subscription | null = null;

  constructor(private soundService: SoundService) {}

  ngOnInit(): void {
    // Charger la liste des sons
    this.sounds = this.soundService.getSounds();
    
    // S'abonner au son sélectionné
    this.soundSubscription = this.soundService.selectedSound$.subscribe(sound => {
      this.selectedSound = sound;
    });
    
    // S'abonner au volume
    this.volumeSubscription = this.soundService.volume$.subscribe(volume => {
      this.volume = volume;
    });
    
    // S'abonner à l'état muet
    this.mutedSubscription = this.soundService.isMuted$.subscribe(muted => {
      this.isMuted = muted;
    });
    
    // Précharger les sons
    this.soundService.preloadSounds();
  }

  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites de mémoire
    if (this.soundSubscription) this.soundSubscription.unsubscribe();
    if (this.volumeSubscription) this.volumeSubscription.unsubscribe();
    if (this.mutedSubscription) this.mutedSubscription.unsubscribe();
  }

  // Sélectionner un son
  selectSound(soundId: string): void {
    this.soundService.selectSound(soundId);
  }

  // Changer le volume
  onVolumeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const volume = parseFloat(target.value);
    this.soundService.setVolume(volume);
  }

  // Activer/désactiver le son
  toggleMute(): void {
    this.soundService.toggleMute();
  }
}
