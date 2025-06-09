import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SessionService, MeditationSession, SessionStats } from '../../services/session.service';

interface DayActivity {
  date: Date;
  label: string;
  minutes: number;
  percentage: number;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {
  sessions: MeditationSession[] = [];
  stats: SessionStats = {
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0
  };
  weeklyActivity: DayActivity[] = [];
  
  private sessionsSubscription: Subscription | null = null;
  private statsSubscription: Subscription | null = null;
  private displayLimit = 10;

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner aux sessions
    this.sessionsSubscription = this.sessionService.sessions$.subscribe(sessions => {
      // Trier les sessions par date (plus récentes en premier)
      const sortedSessions = [...sessions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Limiter le nombre de sessions affichées
      this.sessions = sortedSessions.slice(0, this.displayLimit);
      
      // Calculer l'activité hebdomadaire
      this.calculateWeeklyActivity(sessions);
    });
    
    // S'abonner aux statistiques
    this.statsSubscription = this.sessionService.stats$.subscribe(stats => {
      this.stats = stats;
    });
  }

  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites de mémoire
    if (this.sessionsSubscription) this.sessionsSubscription.unsubscribe();
    if (this.statsSubscription) this.statsSubscription.unsubscribe();
  }

  // Calculer l'activité hebdomadaire
  calculateWeeklyActivity(sessions: MeditationSession[]): void {
    const today = new Date();
    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const weeklyActivity: DayActivity[] = [];
    
    // Créer un tableau pour les 7 derniers jours
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      weeklyActivity.push({
        date: date,
        label: weekDays[date.getDay()],
        minutes: 0,
        percentage: 0
      });
    }
    
    // Calculer les minutes pour chaque jour
    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      const dayIndex = weeklyActivity.findIndex(day => 
        day.date.getTime() === sessionDate.getTime()
      );
      
      if (dayIndex !== -1) {
        weeklyActivity[dayIndex].minutes += Math.round(session.duration / 60);
      }
    });
    
    // Calculer le pourcentage pour l'affichage du graphique
    const maxMinutes = Math.max(...weeklyActivity.map(day => day.minutes), 1);
    weeklyActivity.forEach(day => {
      day.percentage = (day.minutes / maxMinutes) * 100;
    });
    
    this.weeklyActivity = weeklyActivity;
  }

  // Charger plus de sessions
  loadMoreSessions(): void {
    this.displayLimit += 10;
    
    this.sessionService.sessions$.subscribe(sessions => {
      const sortedSessions = [...sessions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      this.sessions = sortedSessions.slice(0, this.displayLimit);
    }).unsubscribe();
  }

  // Formater la date d'une session
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(date).toLocaleDateString('fr-FR', options);
  }

  // Formater la durée d'une session
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  // Naviguer vers la page d'accueil
  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  // Naviguer vers la page de session
  navigateToSession(): void {
    this.router.navigate(['/session']);
  }
}
