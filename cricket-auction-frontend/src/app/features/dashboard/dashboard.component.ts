import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamService } from '../../core/services/team.service';
import { PlayerService } from '../../core/services/player.service';
import { MatchService } from '../../core/services/match.service';
import { AuctionService } from '../../core/services/auction.service';
import { Team, Player, Match, Auction } from '../../core/models';
import { StatsCardComponent } from './components/stats-card/stats-card.component';
import { RecentMatchesComponent } from './components/recent-matches/recent-matches.component';
import { TeamStatsComponent } from './components/team-stats/team-stats.component';

interface DashboardStats {
  totalTeams: number;
  totalPlayers: number;
  totalMatches: number;
  activeAuctions: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    StatsCardComponent,
    RecentMatchesComponent,
    TeamStatsComponent
  ],
  template: `
    <div class="dashboard-container">
      <h1>Cricket Auction Dashboard</h1>
      
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading dashboard data...</p>
      </div>
      
      <div *ngIf="!loading">
        <div class="stats-grid">
          <app-stats-card title="Teams" [value]="stats?.totalTeams || 0" icon="groups" color="primary"></app-stats-card>
          <app-stats-card title="Players" [value]="stats?.totalPlayers || 0" icon="person" color="accent"></app-stats-card>
          <app-stats-card title="Matches" [value]="stats?.totalMatches || 0" icon="sports_cricket" color="warn"></app-stats-card>
          <app-stats-card title="Active Auctions" [value]="stats?.activeAuctions || 0" icon="gavel" color="primary"></app-stats-card>
        </div>
        
        <div class="charts-section">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Team Performance</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <app-team-stats [teams]="teams"></app-team-stats>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="matches-card">
            <mat-card-header>
              <mat-card-title>Recent Matches</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <app-recent-matches [matches]="recentMatches"></app-recent-matches>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button routerLink="/matches">View All Matches</button>
            </mat-card-actions>
          </mat-card>
        </div>
        
        <div class="quick-actions">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Quick Actions</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="action-buttons">
                <button mat-raised-button color="primary" routerLink="/matches/create">
                  <mat-icon>add</mat-icon>
                  Create Match
                </button>
                <button mat-raised-button color="accent" routerLink="/auctions/create">
                  <mat-icon>gavel</mat-icon>
                  Start Auction
                </button>
                <button mat-raised-button color="warn" routerLink="/players/create">
                  <mat-icon>person_add</mat-icon>
                  Add Player
                </button>
                <button mat-raised-button routerLink="/teams/create">
                  <mat-icon>group_add</mat-icon>
                  Create Team
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
      
      <div *ngIf="error" class="error-container">
        <mat-card color="warn">
          <mat-card-content>
            <h3>Connection Error</h3>
            <p>{{error}}</p>
            <button mat-raised-button color="primary" (click)="retryLoad()">
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 20px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .charts-section { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 30px; }
    @media (max-width: 768px) { .charts-section { grid-template-columns: 1fr; } }
    .chart-card, .matches-card { height: 400px; }
    .action-buttons { display: flex; gap: 16px; flex-wrap: wrap; }
    @media (max-width: 480px) { .action-buttons { flex-direction: column; } .action-buttons button { width: 100%; } }
    h1 { margin-bottom: 30px; color: #333; }
    .loading-container, .error-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; }
    .error-container mat-card { background-color: #ffebee; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  teams: Team[] = [];
  recentMatches: Match[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private teamService: TeamService,
    private playerService: PlayerService,
    private matchService: MatchService,
    private auctionService: AuctionService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;
    
    forkJoin({
      teams: this.teamService.getTeams(),
      players: this.playerService.getPlayers(),
      matches: this.matchService.getMatches(),
      auctions: this.auctionService.getAuctions()
    }).subscribe({
      next: (data) => {
        this.teams = data.teams.results;
        this.recentMatches = data.matches.results.slice(0, 5);
        this.stats = {
          totalTeams: data.teams.count,
          totalPlayers: data.players.count,
          totalMatches: data.matches.count,
          activeAuctions: data.auctions.results.filter(a => a.status === 'ACTIVE').length
        };
        this.loading = false;
        console.log('Dashboard data loaded successfully:', this.stats);
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  retryLoad(): void {
    this.loadDashboardData();
  }
}
