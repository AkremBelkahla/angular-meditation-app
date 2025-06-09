import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Méditation Zen - Accueil'
  },
  {
    path: 'session',
    loadComponent: () => import('./pages/session/session.component').then(m => m.SessionComponent),
    title: 'Méditation Zen - Session'
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent),
    title: 'Méditation Zen - Historique'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
