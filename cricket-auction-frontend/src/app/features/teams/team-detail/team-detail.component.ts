import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { TeamService } from '../../../core/services/team.service';
import { Team, Player } from '../../../core/models';
import { TeamPlayersComponent } from '../team-players/team-players.component';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    TeamPlayersComponent
  ],
  template: `
    <div class="team-detail-container" *ngIf="team">
      <div class="header">
        <button mat-icon-button routerLink="/teams">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{team.name}}</h1>
        <button mat-raised-button color="primary" [routerLink]="['/teams', team.id, 'edit']">
          <mat-icon>edit</mat-icon>
          Edit Team
        </button>
      </div>

      <div class="content-grid">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>Team Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-item">
              <label>Team Name:</label>
              <span>{{team.name}}</span>
            </div>
            <div class="info-item">
              <label>Total Budget:</label>
              <span class="budget">\${{formatCurrency(team.budget)}}</span>
            </div>
            <div class="info-item">
              <label>Available Budget:</label>
              <span class="money-left">\${{formatCurrency(team.money_left)}}</span>
            </div>
            <div class="info-item">
              <label>Players Count:</label>
              <span>{{team.players_count}}</span>
            </div>
            <div class="budget-progress">
              <label>Budget Usage:</label>
              <mat-progress-bar mode="determinate" [value]="getBudgetUsagePercentage()"></mat-progress-bar>
              <small>{{getBudgetUsagePercentage() | number:'1.1-1'}}% used</small>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="players-card">
          <mat-card-header>
            <mat-card-title>Players</mat-card-title>
            <mat-card-subtitle>{{players.length}} players in squad</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <mat-tab-group>
              <mat-tab label="All Players">
                <app-team-players [players]="players" [teamId]="team.id"></app-team-players>
              </mat-tab>
              <mat-tab label="Playing XI">
                <app-team-players [players]="playingEleven" [teamId]="team.id" [isPlayingEleven]="true"></app-team-players>
              </mat-tab>
            </mat-tab-group>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
      </div>
    </div>
  `,
  styles: [`
    .team-detail-container { padding: 20px; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .header h1 { flex: 1; margin: 0; color: #333; }
    .content-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; }
    @media (max-width: 768px) { .content-grid { grid-template-columns: 1fr; } }
    .info-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .info-item:last-child { border-bottom: none; }
    .info-item label { font-weight: 500; color: #666; }
    .budget { color: #2e7d32; font-family: monospace; }
    .money-left { color: #1976d2; font-family: monospace; }
    .budget-progress { margin-top: 16px; }
    .budget-progress label { display: block; margin-bottom: 8px; font-weight: 500; color: #666; }
    .budget-progress small { display: block; margin-top: 4px; color: #666; }
    .loading-container { display: flex; justify-content: center; padding: 40px; }
  `]
})
export class TeamDetailComponent implements OnInit {
  team: Team | null = null;
  players: Player[] = [];
  playingEleven: Player[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const teamId = Number(this.route.snapshot.paramMap.get('id'));
    if (teamId) {
      this.loadTeamData(teamId);
    }
  }

  private loadTeamData(teamId: number): void {
    this.loading = true;
    
    this.teamService.getTeam(teamId).subscribe({
      next: (team) => {
        this.team = team;
      },
      error: (error) => {
        this.snackBar.open('Error loading team: ' + error, 'Close', { duration: 3000 });
        this.router.navigate(['/teams']);
      }
    });

    this.teamService.getTeamPlayers(teamId).subscribe({
      next: (players) => {
        this.players = players;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading players: ' + error, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });

    this.teamService.getPlayingEleven(teamId).subscribe({
      next: (players) => {
        this.playingEleven = players;
      },
      error: (error) => {
        console.error('Error loading playing eleven:', error);
      }
    });
  }

  formatCurrency(amount: number): string {
    return (amount / 1000000).toFixed(1) + 'M';
  }

  getBudgetUsagePercentage(): number {
    if (!this.team) return 0;
    return ((this.team.budget - this.team.money_left) / this.team.budget) * 100;
  }
}
