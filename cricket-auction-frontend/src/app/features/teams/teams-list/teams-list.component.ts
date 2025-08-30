import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TeamService } from '../../../core/services/team.service';
import { Team } from '../../../core/models';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="teams-container">
      <div class="header">
        <h1>Teams</h1>
        <button mat-raised-button color="primary" routerLink="/teams/create">
          <mat-icon>add</mat-icon>
          Create Team
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="dataSource" matSort class="teams-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Team Name</th>
              <td mat-cell *matCellDef="let team" class="team-name">
                <mat-icon class="team-icon">groups</mat-icon>
                {{team.name}}
              </td>
            </ng-container>

            <ng-container matColumnDef="players_count">
              <th mat-header-cell *matHeaderCellDef>Players</th>
              <td mat-cell *matCellDef="let team">
                <mat-chip class="player-chip">{{team.players_count}}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="budget">
              <th mat-header-cell *matHeaderCellDef>Total Budget</th>
              <td mat-cell *matCellDef="let team">
                <span class="budget">\${{formatCurrency(team.budget)}}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="money_left">
              <th mat-header-cell *matHeaderCellDef>Available Budget</th>
              <td mat-cell *matCellDef="let team">
                <span class="money-left">\${{formatCurrency(team.money_left)}}</span>
                <div class="budget-bar">
                  <mat-progress-bar mode="determinate" [value]="getBudgetPercentage(team)"></mat-progress-bar>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let team">{{team.created_at | date:'short'}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let team">
                <button mat-icon-button [routerLink]="['/teams', team.id]" matTooltip="View">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button [routerLink]="['/teams', team.id, 'edit']" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteTeam(team)" matTooltip="Delete" color="warn">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="team-row" (click)="viewTeam(row)"></tr>
          </table>

          <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
      </div>
    </div>
  `,
  styles: [`
    .teams-container { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .teams-table { width: 100%; }
    .team-row { cursor: pointer; transition: background-color 0.2s; }
    .team-row:hover { background-color: #f5f5f5; }
    .team-name { display: flex; align-items: center; font-weight: 500; }
    .team-icon { margin-right: 8px; color: #1976d2; }
    .player-chip { background-color: #e3f2fd; color: #1976d2; }
    .budget { font-family: monospace; color: #2e7d32; }
    .money-left { font-family: monospace; color: #1976d2; }
    .budget-bar { margin-top: 4px; width: 100px; }
    .loading-container { display: flex; justify-content: center; padding: 40px; }
    h1 { margin: 0; color: #333; }
  `]
})
export class TeamsListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'players_count', 'budget', 'money_left', 'created_at', 'actions'];
  dataSource = new MatTableDataSource<Team>();
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private teamService: TeamService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadTeams(): void {
    this.loading = true;
    this.teamService.getTeams().subscribe({
      next: (response) => {
        this.dataSource.data = response.results;
        this.loading = false;
        console.log('Teams loaded successfully:', response);
      },
      error: (error) => {
        this.snackBar.open('Error loading teams: ' + error, 'Close', { duration: 3000 });
        this.loading = false;
        console.error('Error loading teams:', error);
      }
    });
  }

  viewTeam(team: Team): void {
    // Router navigation handled by routerLink in template
  }

  deleteTeam(team: Team): void {
    if (confirm(`Are you sure you want to delete ${team.name}?`)) {
      this.teamService.deleteTeam(team.id).subscribe({
        next: () => {
          this.snackBar.open('Team deleted successfully', 'Close', { duration: 3000 });
          this.loadTeams();
        },
        error: (error) => {
          this.snackBar.open('Error deleting team: ' + error, 'Close', { duration: 3000 });
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return (amount / 1000000).toFixed(1) + 'M';
  }

  getBudgetPercentage(team: Team): number {
    return (team.money_left / team.budget) * 100;
  }
}
