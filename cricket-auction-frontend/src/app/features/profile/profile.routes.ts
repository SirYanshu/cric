
// src/app/features/profile/profile.routes.ts
import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  { 
    path: '', 
    redirectTo: '/profile/me', 
    pathMatch: 'full' 
  },
  { 
    path: 'me', 
    loadComponent: () => import('./my-profile/my-profile.component').then(m => m.MyProfileComponent)
  },
  { 
    path: ':id', 
    loadComponent: () => import('./user-profile/user-profile.component').then(m => m.UserProfileComponent)
  },
  { 
    path: 'achievements', 
    loadComponent: () => import('./achievements/achievements.component').then(m => m.AchievementsComponent)
  },
  { 
    path: 'rating-history', 
    loadComponent: () => import('./rating-history/rating-history.component').then(m => m.RatingHistoryComponent)
  }
];
