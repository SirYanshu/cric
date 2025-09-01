
// src/app/features/matches/matches.routes.ts
import { Routes } from '@angular/router';

export const MATCHES_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./matches-list/matches-list.component').then(m => m.MatchesListComponent)
  },
  { 
    path: 'create', 
    loadComponent: () => import('./match-form/match-form.component').then(m => m.MatchFormComponent)
  },
  { 
    path: ':id', 
    loadComponent: () => import('./match-detail/match-detail.component').then(m => m.MatchDetailComponent)
  },
  { 
    path: ':id/scorecard', 
    loadComponent: () => import('../matches/match-scorecard/match-scorecard.component').then(m => m.MatchScorecardComponent)
  },
  { 
    path: ':id/simulate', 
    loadComponent: () => import('./match-simulation/match-simulation.component').then(m => m.MatchSimulationComponent)
  }
];
