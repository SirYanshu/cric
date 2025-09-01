
// features/tournaments/tournament-detail/tournament-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { TournamentService } from '../../../core/services/tournament.service';
import { Tournament, TournamentRegistration } from '../../../core/models';

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule, 
    MatIconModule, MatTableModule, MatChipsModule, 
    MatProgressBarModule, MatTabsModule
  ],
  template: `
    <div class="tournament-detail-container" *ngIf="tournament">
      <div class="tournament-header">
        <div class="back-button">
          <button mat-icon-button routerLink="/tournaments">
            <mat-icon>arrow_back</mat-icon>
          </button>
        </div>
        
        <div class="tournament-info">
          <h1>{{tournament.name}}</h1>
          <mat-chip [ngClass]="'status-' + tournament.status.toLowerCase()">
            {{getStatusLabel(tournament.status)}}
          </mat-chip>
          <p>{{tournament.description}}</p>
        </div>
        
        <div class="tournament-stats">
          <div class="stat-item">
            <mat-icon>groups</mat-icon>
            <div>
              <span class="value">{{tournament.current_teams}}/{{tournament.max_teams}}</span>
              <span class="label">Teams</span>
            </div>
          </div>
          <div class="stat-item" *ngIf="tournament.prize_pool > 0">
            <mat-icon>monetization_on</mat-icon>
            <div>
              <span class="value">\${{formatCurrency(tournament.prize_pool)}}</span>
              <span class="label">Prize Pool</span>
            </div>
          </div>
          <div class="stat-item">
            <mat-icon>star</mat-icon>
            <div>
              <span class="value">{{tournament.rating_factor}}x</span>
              <span class="label">Rating Factor</span>
            </div>
          </div>
        </div>
      </div>

      <mat-tab-group class="tournament-tabs">
        
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="tab-content">
            <div class="overview-grid">
              
              <!-- Tournament Details -->
              <mat-card class="details-card">
                <mat-card-header>
                  <mat-card-title>Tournament Details</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="detail-row">
                    <span class="label">Tournament Type:</span>
                    <span class="value">{{getTournamentTypeLabel(tournament.tournament_type)}}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Registration Period:</span>
                    <span class="value">
                      {{tournament.registration_start | date:'short'}} - 
                      {{tournament.registration_end | date:'short'}}
                    </span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Tournament Dates:</span>
                    <span class="value">
                      {{tournament.tournament_start | date:'short'}} - 
                      {{tournament.tournament_end | date:'short'}}
                    </span>
                  </div>
                  <div class="detail-row" *ngIf="tournament.entry_fee > 0">
                    <span class="label">Entry Fee:</span>
                    <span class="value">\${{formatCurrency(tournament.entry_fee)}}</span>
                  </div>
                </mat-card-content>
                <mat-card-actions *ngIf="tournament.status === 'REGISTRATION'">
                  <button mat-raised-button color="primary" (click)="registerForTournament()">
                    <mat-icon>app_registration</mat-icon>
                    Register Team
                  </button>
                </mat-card-actions>
              </mat-card>

              <!-- Registration Progress -->
              <mat-card class="progress-card">
                <mat-card-header>
                  <mat-card-title>Registration Progress</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="progress-info">
                    <div class="progress-numbers">
                      <span class="current">{{tournament.current_teams}}</span>
                      <span class="separator">/</span>
                      <span class="max">{{tournament.max_teams}}</span>
                      <span class="label">teams registered</span>
                    </div>
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="(tournament.current_teams / tournament.max_teams) * 100"
                      class="registration-progress">
                    </mat-progress-bar>
                  </div>
                  
                  <div class="time-remaining" *ngIf="tournament.status === 'REGISTRATION'">
                    <mat-icon>schedule</mat-icon>
                    <span>Registration closes {{tournament.registration_end | date:'medium'}}</span>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Registered Teams Tab -->
        <mat-tab label="Registered Teams">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Registered Teams ({{registrations.length}})</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="registrations" class="registrations-table">
                  
                  <ng-container matColumnDef="team_name">
                    <th mat-header-cell *matHeaderCellDef>Team</th>
                    <td mat-cell *matCellDef="let registration">{{registration.team_name}}</td>
                  </ng-container>

                  <ng-container matColumnDef="username">
                    <th mat-header-cell *matHeaderCellDef>Owner</th>
                    <td mat-cell *matCellDef="let registration">{{registration.username}}</td>
                  </ng-container>

                  <ng-container matColumnDef="rating_at_registration">
                    <th mat-header-cell *matHeaderCellDef>Rating at Registration</th>
                    <td mat-cell *matCellDef="let registration">
                      {{registration.rating_at_registration | number:'1.0-0'}}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="registered_at">
                    <th mat-header-cell *matHeaderCellDef>Registered</th>
                    <td mat-cell *matCellDef="let registration">
                      {{registration.registered_at | date:'short'}}
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="registrationColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: registrationColumns;"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Matches Tab -->
        <mat-tab label="Matches" *ngIf="tournament.status === 'ACTIVE' || tournament.status === 'COMPLETED'">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Tournament Matches</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>Match fixtures and results will appear here when the tournament starts.</p>
                <button mat-raised-button [routerLink]="['/tournaments', tournament.id, 'matches']">
                  <mat-icon>sports_cricket</mat-icon>
                  View All Matches
                </button>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .tournament-detail-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    
    .tournament-header { 
      display: grid; 
      grid-template-columns: auto 1fr auto; 
      gap: 20px; 
      align-items: center; 
      margin-bottom: 30px; 
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }
    
    .tournament-info h1 { 
      margin: 0 0 10px 0; 
      font-size: 2.5rem; 
    }
    
    .tournament-info p { 
      margin: 15px 0 0 0; 
      opacity: 0.9; 
    }
    
    .tournament-stats { 
      display: flex; 
      flex-direction: column; 
      gap: 15px; 
    }
    
    .stat-item { 
      display: flex; 
      align-items: center; 
      gap: 10px; 
      background: rgba(255, 255, 255, 0.1); 
      padding: 15px; 
      border-radius: 8px; 
      backdrop-filter: blur(10px);
    }
    
    .stat-item .value { 
      font-size: 1.5rem; 
      font-weight: bold; 
      line-height: 1; 
    }
    
    .stat-item .label { 
      font-size: 0.9rem; 
      opacity: 0.8; 
    }
    
    .tournament-tabs { 
      margin-top: 20px; 
    }
    
    .tab-content { 
      padding: 20px 0; 
    }
    
    .overview-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); 
      gap: 20px; 
    }
    
    .detail-row { 
      display: flex; 
      justify-content: space-between; 
      padding: 12px 0; 
      border-bottom: 1px solid #eee; 
    }
    
    .detail-row:last-child { 
      border-bottom: none; 
    }
    
    .detail-row .label { 
      color: #666; 
      font-weight: 500; 
    }
    
    .detail-row .value { 
      color: #333; 
    }
    
    .progress-info { 
      text-align: center; 
      margin-bottom: 20px; 
    }
    
    .progress-numbers { 
      display: flex; 
      justify-content: center; 
      align-items: baseline; 
      gap: 5px; 
      margin-bottom: 15px; 
    }
    
    .current { 
      font-size: 2rem; 
      font-weight: bold; 
      color: #1976d2; 
    }
    
    .separator { 
      font-size: 1.5rem; 
      color: #666; 
    }
    
    .max { 
      font-size: 2rem; 
      font-weight: bold; 
      color: #666; 
    }
    
    .label { 
      margin-left: 10px; 
      color: #666; 
    }
    
    .registration-progress { 
      height: 8px; 
    }
    
    .time-remaining { 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      gap: 8px; 
      color: #666; 
      font-size: 0.9rem; 
    }
    
    .registrations-table { 
      width: 100%; 
    }
    
    .status-registration { background-color: #2196f3; color: white; }
    .status-active { background-color: #4caf50; color: white; }
    .status-completed { background-color: #9e9e9e; color: white; }
    .status-cancelled { background-color: #f44336; color: white; }
    
    @media (max-width: 768px) {
      .tournament-header { 
        grid-template-columns: 1fr; 
        text-align: center; 
      }
      
      .tournament-stats { 
        flex-direction: row; 
        justify-content: center; 
      }
      
      .overview-grid { 
        grid-template-columns: 1fr; 
      }
    }
  `]
})
export class TournamentDetailComponent implements OnInit {
  tournament: Tournament | null = null;
  registrations: TournamentRegistration[] = [];
  registrationColumns: string[] = ['team_name', 'username', 'rating_at_registration', 'registered_at'];

  constructor(
    private route: ActivatedRoute,
    private tournamentService: TournamentService
  ) {}

  ngOnInit(): void {
    const tournamentId = Number(this.route.snapshot.paramMap.get('id'));
    if (tournamentId) {
      this.loadTournamentData(tournamentId);
    }
  }

  private loadTournamentData(tournamentId: number): void {
    this.tournamentService.getTournament(tournamentId).subscribe({
      next: (tournament) => {
        this.tournament = tournament;
      },
      error: (error) => console.error('Error loading tournament:', error)
    });

    this.tournamentService.getTournamentRegistrations(tournamentId).subscribe({
      next: (registrations) => {
        this.registrations = registrations;
      },
      error: (error) => console.error('Error loading registrations:', error)
    });
  }

  registerForTournament(): void {
    // Implementation would show team selection dialog
    // For now, just a placeholder
    console.log('Register for tournament clicked');
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
