import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MeditationSession {
  id: string;
  date: Date;
  duration: number; // en secondes
  completed: boolean;
  soundId?: string;
}

export interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  // État de la session en cours
  private sessionStateSubject = new BehaviorSubject<'idle' | 'running' | 'paused'>('idle');
  sessionState$ = this.sessionStateSubject.asObservable();

  // Durée de la session en cours (en secondes)
  private durationSubject = new BehaviorSubject<number>(300); // 5 minutes par défaut
  duration$ = this.durationSubject.asObservable();

  // Temps restant de la session en cours (en secondes)
  private remainingTimeSubject = new BehaviorSubject<number>(300);
  remainingTime$ = this.remainingTimeSubject.asObservable();

  // Phase de respiration actuelle
  private breathPhaseSubject = new BehaviorSubject<'inhale' | 'exhale'>('inhale');
  breathPhase$ = this.breathPhaseSubject.asObservable();

  // Historique des sessions
  private sessionsSubject = new BehaviorSubject<MeditationSession[]>([]);
  sessions$ = this.sessionsSubject.asObservable();

  // Statistiques
  private statsSubject = new BehaviorSubject<SessionStats>({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  stats$ = this.statsSubject.asObservable();

  private timer: any;
  private breathTimer: any;
  private currentSession: MeditationSession | null = null;

  constructor() {
    this.loadSessionsFromStorage();
    this.calculateStats();
  }

  // Définir la durée de la session
  setDuration(seconds: number): void {
    this.durationSubject.next(seconds);
    this.remainingTimeSubject.next(seconds);
  }

  // Démarrer une session
  startSession(soundId?: string): void {
    if (this.sessionStateSubject.value === 'running') {
      return;
    }

    const duration = this.durationSubject.value;
    
    this.currentSession = {
      id: Date.now().toString(),
      date: new Date(),
      duration: duration,
      completed: false,
      soundId
    };

    this.sessionStateSubject.next('running');
    this.remainingTimeSubject.next(duration);
    
    this.startBreathCycle();
    
    this.timer = setInterval(() => {
      const remaining = this.remainingTimeSubject.value - 1;
      this.remainingTimeSubject.next(remaining);
      
      if (remaining <= 0) {
        this.completeSession();
      }
    }, 1000);
  }

  // Mettre en pause la session
  pauseSession(): void {
    if (this.sessionStateSubject.value !== 'running') {
      return;
    }
    
    clearInterval(this.timer);
    clearInterval(this.breathTimer);
    this.sessionStateSubject.next('paused');
  }

  // Reprendre la session
  resumeSession(): void {
    if (this.sessionStateSubject.value !== 'paused') {
      return;
    }
    
    this.sessionStateSubject.next('running');
    this.startBreathCycle();
    
    this.timer = setInterval(() => {
      const remaining = this.remainingTimeSubject.value - 1;
      this.remainingTimeSubject.next(remaining);
      
      if (remaining <= 0) {
        this.completeSession();
      }
    }, 1000);
  }

  // Arrêter la session
  stopSession(): void {
    clearInterval(this.timer);
    clearInterval(this.breathTimer);
    this.sessionStateSubject.next('idle');
    
    if (this.currentSession) {
      const completedDuration = this.currentSession.duration - this.remainingTimeSubject.value;
      if (completedDuration > 30) { // Sauvegarder seulement si plus de 30 secondes
        const partialSession: MeditationSession = {
          ...this.currentSession,
          duration: completedDuration
        };
        this.saveSession(partialSession);
      }
      this.currentSession = null;
    }
  }

  // Terminer la session avec succès
  private completeSession(): void {
    clearInterval(this.timer);
    clearInterval(this.breathTimer);
    this.sessionStateSubject.next('idle');
    
    if (this.currentSession) {
      const completedSession: MeditationSession = {
        ...this.currentSession,
        completed: true
      };
      this.saveSession(completedSession);
      this.currentSession = null;
    }
  }

  // Gérer le cycle de respiration
  private startBreathCycle(): void {
    // Cycle de respiration: 4 secondes inhale, 4 secondes exhale
    const breathDuration = 4000; // 4 secondes
    
    this.breathPhaseSubject.next('inhale');
    
    this.breathTimer = setInterval(() => {
      const currentPhase = this.breathPhaseSubject.value;
      this.breathPhaseSubject.next(currentPhase === 'inhale' ? 'exhale' : 'inhale');
    }, breathDuration);
  }

  // Sauvegarder une session
  private saveSession(session: MeditationSession): void {
    const sessions = [...this.sessionsSubject.value, session];
    this.sessionsSubject.next(sessions);
    localStorage.setItem('meditation-sessions', JSON.stringify(sessions));
    this.calculateStats();
  }

  // Charger les sessions depuis le stockage local
  private loadSessionsFromStorage(): void {
    const savedSessions = localStorage.getItem('meditation-sessions');
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions);
        // Convertir les dates de string à Date
        const parsedSessions = sessions.map((session: any) => ({
          ...session,
          date: new Date(session.date)
        }));
        this.sessionsSubject.next(parsedSessions);
      } catch (e) {
        console.error('Erreur lors du chargement des sessions:', e);
        this.sessionsSubject.next([]);
      }
    }
  }

  // Calculer les statistiques
  private calculateStats(): void {
    const sessions = this.sessionsSubject.value;
    
    const totalSessions = sessions.length;
    const totalMinutes = Math.round(sessions.reduce((acc, session) => acc + session.duration, 0) / 60);
    
    // Calculer la série actuelle
    const currentStreak = this.calculateCurrentStreak(sessions);
    
    // Calculer la plus longue série
    const longestStreak = this.calculateLongestStreak(sessions);
    
    this.statsSubject.next({
      totalSessions,
      totalMinutes,
      currentStreak,
      longestStreak
    });
  }

  // Calculer la série actuelle
  private calculateCurrentStreak(sessions: MeditationSession[]): number {
    if (sessions.length === 0) return 0;
    
    const sortedSessions = [...sessions].sort((a, b) => b.date.getTime() - a.date.getTime());
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Vérifier si une session a été complétée aujourd'hui
    const todaySession = sortedSessions.find(session => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === currentDate.getTime();
    });
    
    if (todaySession) {
      streak = 1;
    } else {
      // Si pas de session aujourd'hui, vérifier si hier
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdaySession = sortedSessions.find(session => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === yesterday.getTime();
      });
      
      if (!yesterdaySession) return 0;
    }
    
    // Compter les jours consécutifs
    let checkDate = new Date(currentDate);
    if (!todaySession) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (true) {
      const daySession = sortedSessions.find(session => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === checkDate.getTime();
      });
      
      if (daySession) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Calculer la plus longue série
  private calculateLongestStreak(sessions: MeditationSession[]): number {
    if (sessions.length === 0) return 0;
    
    const dates = sessions.map(session => {
      const date = new Date(session.date);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });
    
    // Éliminer les doublons (plusieurs sessions le même jour)
    const uniqueDates = [...new Set(dates)].sort();
    
    let currentStreak = 1;
    let longestStreak = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = (uniqueDates[i] - uniqueDates[i - 1]) / (1000 * 60 * 60 * 24);
      
      if (diff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return longestStreak;
  }

  // Obtenir les sessions pour une période spécifique
  getSessionsForPeriod(startDate: Date, endDate: Date): MeditationSession[] {
    return this.sessionsSubject.value.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }

  // Formater le temps restant en MM:SS
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
