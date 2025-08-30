import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'teams', 
    loadChildren: () => import('./features/teams/teams.routes').then(m => m.TEAMS_ROUTES)
  },
  { 
    path: 'players', 
    loadComponent: () => import('./features/players/players-list/players-list.component').then(m => m.PlayersListComponent)
  },
  { 
    path: 'matches', 
    loadComponent: () => import('./features/matches/matches-list/matches-list.component').then(m => m.MatchesListComponent)
  },
  { 
    path: 'auctions', 
    loadComponent: () => import('./features/auctions/auctions-list/auctions-list.component').then(m => m.AuctionsListComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
