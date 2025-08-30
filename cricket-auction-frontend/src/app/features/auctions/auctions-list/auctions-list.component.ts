// File: src/app/features/auctions/auctions-list/auctions-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auctions-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="auctions-container">
      <h1>Auctions</h1>
      <mat-card>
        <mat-card-content>
          <p>Auctions module coming soon!</p>
          <p>Here you'll be able to:</p>
          <ul>
            <li>View ongoing auctions</li>
            <li>Place bids on players</li>
            <li>Track auction results</li>
          </ul>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            Start New Auction
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auctions-container { 
      padding: 20px; 
    }
    h1 { 
      color: #333; 
      margin-bottom: 20px;
    }
    mat-card {
      max-width: 600px;
    }
    ul {
      margin: 16px 0;
    }
  `]
})
export class AuctionsListComponent { }
