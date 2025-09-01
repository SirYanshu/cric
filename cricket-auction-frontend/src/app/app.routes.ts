import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Dashboard
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  
  // Teams Management
  { 
    path: 'teams', 
    loadChildren: () => import('./features/teams/teams.routes').then(m => m.TEAMS_ROUTES)
  },
  
  // Players Management
  { 
    path: 'players', 
    loadChildren: () => import('./features/players/players.routes').then(m => m.PLAYERS_ROUTES)
  },
  
  // Matches with enhanced scorecard
  { 
    path: 'matches', 
    loadChildren: () => import('./features/matches/matches.routes').then(m => m.MATCHES_ROUTES)
  },
  
  // Tournaments (NEW)
  { 
    path: 'tournaments', 
    loadChildren: () => import('./features/tournaments/tournaments.routes').then(m => m.TOURNAMENTS_ROUTES)
  },
  
  // Auctions
  { 
    path: 'auctions', 
    loadChildren: () => import('./features/auctions/auctions.routes').then(m => m.AUCTIONS_ROUTES)
  },
  
  // Career Profile (NEW)
  { 
    path: 'profile', 
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
  },
  
  // Leaderboard (NEW)
  { 
    path: 'leaderboard', 
    loadComponent: () => import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
  },
  
  { path: '**', redirectTo: '/dashboard' }
];
