// src/app/features/tournaments/tournaments.routes.ts
import { Routes } from '@angular/router';

export const TOURNAMENTS_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./tournament-list/tournament-list.component').then(m => m.TournamentListComponent)
  },
  { 
    path: 'create', 
    loadComponent: () => import('./tournament-form/tournament-form.component').then(m => m.TournamentFormComponent)
  },
  { 
    path: ':id', 
    loadComponent: () => import('./tournament-detail/tournament-detail.component').then(m => m.TournamentDetailComponent)
  },
  { 
    path: ':id/matches', 
    loadComponent: () => import('./tournament-matches/tournament-matches.component').then(m => m.TournamentMatchesComponent)
  },
  { 
    path: ':id/leaderboard', 
    loadComponent: () => import('./tournament-leaderboard/tournament-leaderboard.component').then(m => m.TournamentLeaderboardComponent)
  }
];
