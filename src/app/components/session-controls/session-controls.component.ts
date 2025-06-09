import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SessionService } from '../../services/session.service';
import { SoundService } from '../../services/sound.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-session-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-controls.component.html',
  styleUrls: ['./session-controls.component.scss']
})
export class SessionControlsComponent implements OnInit, OnDestroy {
  sessionState: 'idle' | 'running' | 'paused' = 'idle';
  breathPhase: 'inhale' | 'exhale' = 'inhale';
  remainingTime = 300; // 5 minutes par défaut
  selectedDuration = 300; // 5 minutes par défaut
  formattedTime = '05:00';
  
  private stateSubscription: Subscription | null = null;
  private timeSubscription: Subscription | null = null;
  private breathSubscription: Subscription | null = null;
  private durationSubscription: Subscription | null = null;

  constructor(
    private sessionService: SessionService,
    private soundService: SoundService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Charger la durée par défaut des paramètres
    const settings = this.themeService.getSettings();
    this.selectedDuration = settings.defaultDuration;
    this.sessionService.setDuration(this.selectedDuration);
    
    // S'abonner aux changements d'état de la session
    this.stateSubscription = this.sessionService.sessionState$.subscribe(state => {
      this.sessionState = state;
      
      // Démarrer/arrêter le son en fonction de l'état de la session
      if (state === 'running') {
        this.soundService.playSound();
      } else if (state === 'idle') {
        this.soundService.stopSound();
      }
    });
    
    // S'abonner aux changements de temps restant
    this.timeSubscription = this.sessionService.remainingTime$.subscribe(time => {
      this.remainingTime = time;
      this.formattedTime = this.sessionService.formatTime(time);
    });
    
    // S'abonner aux changements de phase de respiration
    this.breathSubscription = this.sessionService.breathPhase$.subscribe(phase => {
      this.breathPhase = phase;
    });
    
    // S'abonner aux changements de durée
    this.durationSubscription = this.sessionService.duration$.subscribe(duration => {
      this.selectedDuration = duration;
    });
  }

  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites de mémoire
    if (this.stateSubscription) this.stateSubscription.unsubscribe();
    if (this.timeSubscription) this.timeSubscription.unsubscribe();
    if (this.breathSubscription) this.breathSubscription.unsubscribe();
    if (this.durationSubscription) this.durationSubscription.unsubscribe();
    
    // Arrêter le son si le composant est détruit
    this.soundService.stopSound();
  }

  // Définir la durée de la session
  setDuration(seconds: number): void {
    this.selectedDuration = seconds;
    this.sessionService.setDuration(seconds);
  }

  // Démarrer une session
  startSession(): void {
    const selectedSound = this.soundService.selectedSound$;
    let soundId: string | undefined;
    
    // Obtenir l'ID du son sélectionné s'il existe
    selectedSound.subscribe(sound => {
      if (sound) {
        soundId = sound.id;
      }
    }).unsubscribe();
    
    this.sessionService.startSession(soundId);
  }

  // Mettre en pause la session
  pauseSession(): void {
    this.sessionService.pauseSession();
    this.soundService.stopSound();
  }

  // Reprendre la session
  resumeSession(): void {
    this.sessionService.resumeSession();
    this.soundService.playSound();
  }

  // Arrêter la session
  stopSession(): void {
    this.sessionService.stopSession();
    this.soundService.stopSound();
  }
}
