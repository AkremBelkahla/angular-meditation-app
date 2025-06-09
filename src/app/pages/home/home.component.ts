import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SessionService, SessionStats } from '../../services/session.service';
import { SoundSelectorComponent } from '../../components/sound-selector/sound-selector.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SoundSelectorComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  stats: SessionStats = {
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0
  };
  
  private statsSubscription: Subscription | null = null;

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner aux statistiques
    this.statsSubscription = this.sessionService.stats$.subscribe(stats => {
      this.stats = stats;
    });
  }

  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites de mémoire
    if (this.statsSubscription) this.statsSubscription.unsubscribe();
  }

  // Démarrer une session rapide avec une durée prédéfinie
  startQuickSession(duration: number): void {
    this.sessionService.setDuration(duration);
    this.router.navigate(['/session']);
  }

  // Naviguer vers la page de session
  navigateToSession(): void {
    this.router.navigate(['/session']);
  }

  // Naviguer vers la page d'historique
  navigateToHistory(): void {
    this.router.navigate(['/history']);
  }
}
