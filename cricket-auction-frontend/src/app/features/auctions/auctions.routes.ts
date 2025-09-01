
// Updated simplified route configurations to prevent missing component errors
// src/app/features/auctions/auctions.routes.ts
import { Routes } from '@angular/router';

export const AUCTIONS_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./auctions-list/auctions-list.component').then(m => m.AuctionsListComponent)
  },
  { 
    path: 'create', 
    loadComponent: () => import('./auction-form/auction-form.component').then(m => m.AuctionFormComponent)
  },
  { 
    path: ':id', 
    loadComponent: () => import('./auction-detail/auction-detail.component').then(m => m.AuctionDetailComponent)
  },
  { 
    path: ':id/bid', 
    loadComponent: () => import('./auction-bidding/auction-bidding.component').then(m => m.AuctionBiddingComponent)
  }
];
