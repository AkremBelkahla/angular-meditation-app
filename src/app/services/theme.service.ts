import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ThemeSettings {
  darkMode: boolean;
  defaultDuration: number; // en secondes
  breathingRhythm: number; // en secondes
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private defaultSettings: ThemeSettings = {
    darkMode: false,
    defaultDuration: 300, // 5 minutes par défaut
    breathingRhythm: 4 // 4 secondes par défaut
  };

  private settingsSubject = new BehaviorSubject<ThemeSettings>(this.defaultSettings);
  settings$ = this.settingsSubject.asObservable();

  constructor() {
    this.loadSettings();
    this.applyTheme();
  }

  // Basculer entre le mode clair et sombre
  toggleDarkMode(): void {
    const currentSettings = this.settingsSubject.value;
    const newSettings = {
      ...currentSettings,
      darkMode: !currentSettings.darkMode
    };
    
    this.settingsSubject.next(newSettings);
    this.saveSettings(newSettings);
    this.applyTheme();
  }

  // Définir la durée par défaut des sessions
  setDefaultDuration(seconds: number): void {
    const currentSettings = this.settingsSubject.value;
    const newSettings = {
      ...currentSettings,
      defaultDuration: seconds
    };
    
    this.settingsSubject.next(newSettings);
    this.saveSettings(newSettings);
  }

  // Définir le rythme de respiration
  setBreathingRhythm(seconds: number): void {
    const currentSettings = this.settingsSubject.value;
    const newSettings = {
      ...currentSettings,
      breathingRhythm: seconds
    };
    
    this.settingsSubject.next(newSettings);
    this.saveSettings(newSettings);
  }

  // Obtenir les paramètres actuels
  getSettings(): ThemeSettings {
    return this.settingsSubject.value;
  }

  // Appliquer le thème au document
  private applyTheme(): void {
    const isDarkMode = this.settingsSubject.value.darkMode;
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Sauvegarder les paramètres dans localStorage
  private saveSettings(settings: ThemeSettings): void {
    localStorage.setItem('meditation-settings', JSON.stringify(settings));
  }

  // Charger les paramètres depuis localStorage
  private loadSettings(): void {
    const savedSettings = localStorage.getItem('meditation-settings');
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        this.settingsSubject.next({
          ...this.defaultSettings,
          ...parsedSettings
        });
      } catch (e) {
        console.error('Erreur lors du chargement des paramètres:', e);
        this.settingsSubject.next(this.defaultSettings);
      }
    }
  }
}
