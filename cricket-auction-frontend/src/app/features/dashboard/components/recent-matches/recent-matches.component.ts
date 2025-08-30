import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Match, MatchStatus } from '../../../../core/models';

@Component({
  selector: 'app-recent-matches',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <div class="recent-matches">
      <div *ngIf="matches && matches.length > 0; else noMatches">
        <div *ngFor="let match of matches" class="match-item">
          <div class="match-teams">
            <span class="team-name">{{ match.team1_name }}</span>
            <span class="vs">vs</span>
            <span class="team-name">{{ match.team2_name }}</span>
          </div>

          <div class="match-result" *ngIf="match.status === 'COMPLETED'">
            <span class="winner">{{ match.winner_name }}</span>
          </div>

          <mat-chip [ngClass]="'status-' + match.status.toLowerCase()">
            {{ match.status }}
          </mat-chip>
        </div>
      </div>

      <ng-template #noMatches>
        <div class="no-matches">
          <mat-icon>sports_cricket</mat-icon>
          <p>No recent matches found</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .recent-matches {
      padding: 16px;
    }
    .match-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }
    .match-teams {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .team-name {
      font-weight: 500;
    }
    .vs {
      color: #666;
      font-size: 0.9rem;
    }
    .status-completed {
      background-color: #4caf50;
      color: white;
    }
    .status-in_progress {
      background-color: #2196f3;
      color: white;
    }
    .status-upcoming, .status-scheduled {
      background-color: #ff9800;
      color: white;
    }
    .status-cancelled {
      background-color: #9e9e9e;
      color: white;
    }
    .no-matches {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .no-matches mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
  `]
})
export class RecentMatchesComponent implements OnInit {
  @Input() matches: Match[] = [];

  // Keep the mock data as fallback for now
  private mockMatches: Match[] = [
    {
      id: 1,
      team1: 1,
      team1_name: 'Team A',
      team2: 2,
      team2_name: 'Team B',
      status: 'COMPLETED',
      winner: 1,
      winner_name: 'Team A',
      team1_score: 180,
      team2_score: 150,
      team1_wickets: 7,
      team2_wickets: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      team1: 3,
      team1_name: 'Team C',
      team2: 4,
      team2_name: 'Team D',
      status: 'SCHEDULED',
      team1_score: 0,
      team2_score: 0,
      team1_wickets: 0,
      team2_wickets: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  ngOnInit(): void {
    // Use mock data if no matches are passed in
    if (!this.matches || this.matches.length === 0) {
      this.matches = this.mockMatches;
    }
  }
}
