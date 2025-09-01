import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dashboard-container">
      <h1>Cricket Career Manager Dashboard</h1>
      
      <div class="welcome-card">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Welcome to Cricket Career Manager</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Your comprehensive cricket tournament and career management system.</p>
            <div class="action-buttons">
              <button mat-raised-button color="primary" routerLink="/tournaments">
                <mat-icon>emoji_events</mat-icon>
                View Tournaments
              </button>
              <button mat-raised-button color="accent" routerLink="/teams">
                <mat-icon>groups</mat-icon>
                Manage Teams
              </button>
              <button mat-raised-button routerLink="/matches">
                <mat-icon>sports_cricket</mat-icon>
                View Matches
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 20px; max-width: 800px; margin: 0 auto; }
    h1 { text-align: center; color: #333; margin-bottom: 30px; }
    .welcome-card { margin-bottom: 30px; }
    .action-buttons { display: flex; gap: 16px; margin-top: 20px; }
    @media (max-width: 600px) {
      .action-buttons { flex-direction: column; }
      .action-buttons button { width: 100%; }
    }
  `]
})
export class DashboardComponent {}
