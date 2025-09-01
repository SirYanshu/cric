// src/app/features/tournaments/tournament-list/tournament-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar'; // Added this import
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Simplified Tournament interface for now
interface Tournament {
  id: number;
  name: string;
  description?: string;
  tournament_type: string;
  status: string;
  max_teams: number;
  current_teams: number;
  entry_fee: number;
  prize_pool: number;
  rating_factor: number;
  registration_start: string;
  registration_end: string;
  tournament_start: string;
  tournament_end?: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule, // Added this import
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="tournaments-container">
      <div class="header">
        <h1>Tournaments</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="/tournaments/create">
            <mat-icon>add</mat-icon>
            Create Tournament
          </button>
          <button mat-button routerLink="/leaderboard">
            <mat-icon>leaderboard</mat-icon>
            Leaderboard
          </button>
        </div>
      </div>

      <!-- Active/Registration Tournaments -->
      <div class="active-tournaments" *ngIf="activeTournaments.length > 0">
        <h2>Active & Registration Open</h2>
        <div class="tournament-cards">
          <mat-card *ngFor="let tournament of activeTournaments" class="tournament-card">
            <mat-card-header>
              <mat-card-title>{{tournament.name}}</mat-card-title>
              <mat-card-subtitle>
                <mat-chip [ngClass]="'status-' + tournament.status.toLowerCase()">
                  {{getStatusLabel(tournament.status)}}
                </mat-chip>
              </mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="tournament-info">
                <div class="info-row">
                  <mat-icon>groups</mat-icon>
                  <span>{{tournament.current_teams}}/{{tournament.max_teams}} teams</span>
                </div>
                <div class="info-row">
                  <mat-icon>sports</mat-icon>
                  <span>{{getTournamentTypeLabel(tournament.tournament_type)}}</span>
                </div>
                <div class="info-row" *ngIf="tournament.prize_pool > 0">
                  <mat-icon>monetization_on</mat-icon>
                  <span>\${{formatCurrency(tournament.prize_pool)}} prize pool</span>
                </div>
                <div class="info-row">
                  <mat-icon>star</mat-icon>
                  <span>{{tournament.rating_factor}}x rating factor</span>
                </div>
              </div>
            </mat-card-content>
            
            <mat-card-actions>
              <button mat-button [routerLink]="['/tournaments', tournament.id]">View Details</button>
              <button mat-raised-button color="primary" 
                      *ngIf="tournament.status === 'REGISTRATION'"
                      (click)="registerForTournament(tournament)">
                Register Team
              </button>
              <button mat-raised-button color="accent"
                      *ngIf="tournament.status === 'ACTIVE'"
                      [routerLink]="['/tournaments', tournament.id, 'matches']">
                View Matches
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <!-- All Tournaments Table -->
      <mat-card class="tournaments-table-card">
        <mat-card-header>
          <mat-card-title>All Tournaments</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <table mat-table [dataSource]="dataSource" matSort class="tournaments-table">
            
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Tournament</th>
              <td mat-cell *matCellDef="let tournament">
                <div class="tournament-cell">
                  <span class="tournament-name">{{tournament.name}}</span>
                  <small class="tournament-type">{{getTournamentTypeLabel(tournament.tournament_type)}}</small>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let tournament">
                <mat-chip [ngClass]="'status-' + tournament.status.toLowerCase()">
                  {{getStatusLabel(tournament.status)}}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="teams">
              <th mat-header-cell *matHeaderCellDef>Teams</th>
              <td mat-cell *matCellDef="let tournament">
                <span class="team-count">{{tournament.current_teams}}/{{tournament.max_teams}}</span>
                <mat-progress-bar mode="determinate" 
                                  [value]="(tournament.current_teams / tournament.max_teams) * 100"
                                  class="team-progress">
                </mat-progress-bar>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let tournament">
                <button mat-icon-button [routerLink]="['/tournaments', tournament.id]">
                  <mat-icon>visibility</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="tournament-row"></tr>
          </table>

          <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
      </div>
    </div>
  `,
  styles: [`
    .tournaments-container { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #333; }
    .header-actions { display: flex; gap: 10px; }
    .active-tournaments { margin-bottom: 40px; }
    .active-tournaments h2 { color: #333; margin-bottom: 20px; }
    .tournament-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
    .tournament-card { transition: transform 0.2s; }
    .tournament-card:hover { transform: translateY(-2px); }
    .tournament-info { margin: 15px 0; }
    .info-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .tournaments-table-card { margin-top: 20px; }
    .tournaments-table { width: 100%; }
    .tournament-cell { display: flex; flex-direction: column; }
    .tournament-name { font-weight: 500; }
    .tournament-type { color: #666; }
    .team-count { font-weight: 500; }
    .team-progress { margin-top: 4px; height: 4px; }
    .loading-container { display: flex; justify-content: center; padding: 40px; }
    
    .status-registration { background-color: #2196f3; color: white; }
    .status-active { background-color: #4caf50; color: white; }
    .status-completed { background-color: #9e9e9e; color: white; }
  `]
})
export class TournamentListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'status', 'teams', 'actions'];
  dataSource = new MatTableDataSource<Tournament>();
  activeTournaments: Tournament[] = [];
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTournaments();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadTournaments(): void {
    this.loading = true;
    
    // Mock data for now - replace with actual service call
    setTimeout(() => {
      const mockTournaments: Tournament[] = [
        {
          id: 1,
          name: 'Championship League',
          tournament_type: 'LEAGUE',
          status: 'REGISTRATION',
          max_teams: 8,
          current_teams: 5,
          entry_fee: 50000,
          prize_pool: 500000,
          rating_factor: 1.5,
          registration_start: new Date().toISOString(),
          registration_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          tournament_start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Quick Fire Cup',
          tournament_type: 'KNOCKOUT',
          status: 'ACTIVE',
          max_teams: 16,
          current_teams: 16,
          entry_fee: 25000,
          prize_pool: 200000,
          rating_factor: 1.2,
          registration_start: new Date().toISOString(),
          registration_end: new Date().toISOString(),
          tournament_start: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      this.dataSource.data = mockTournaments;
      this.activeTournaments = mockTournaments.filter(t => 
        t.status === 'REGISTRATION' || t.status === 'ACTIVE'
      );
      this.loading = false;
    }, 1000);
  }

  registerForTournament(tournament: Tournament): void {
    this.snackBar.open('Tournament registration feature coming soon!', 'Close', { duration: 3000 });
  }

  getStatusLabel(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  getTournamentTypeLabel(type: string): string {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K';
    }
    return amount.toString();
  }
}
