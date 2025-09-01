
// Leaderboard component - features/leaderboard/leaderboard.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TournamentService } from '../../core/services/tournament.service';
import { UserProfile } from '../../core/models';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="leaderboard-container">
      <div class="header">
        <h1>Global Leaderboard</h1>
        <p>Rankings based on current player ratings and achievements</p>
      </div>

      <mat-tab-group class="leaderboard-tabs">
        
        <!-- Overall Rankings -->
        <mat-tab label="Overall Rankings">
          <div class="tab-content">
            <mat-card>
              <mat-card-content>
                
                <!-- Top 3 Podium -->
                <div class="podium" *ngIf="topPlayers.length >= 3">
                  <div class="podium-position second">
                    <div class="position-number">2</div>
                    <div class="player-info">
                      <h3>{{topPlayers[1].username}}</h3>
                      <div class="rating">{{topPlayers[1].current_rating | number:'1.0-0'}}</div>
                      <div class="stats">{{topPlayers[1].career_wins}}W / {{topPlayers[1].career_matches}}M</div>
                    </div>
                    <mat-icon class="medal silver">workspace_premium</mat-icon>
                  </div>
                  
                  <div class="podium-position first">
                    <div class="position-number">1</div>
                    <div class="player-info">
                      <h3>{{topPlayers[0].username}}</h3>
                      <div class="rating">{{topPlayers[0].current_rating | number:'1.0-0'}}</div>
                      <div class="stats">{{topPlayers[0].career_wins}}W / {{topPlayers[0].career_matches}}M</div>
                    </div>
                    <mat-icon class="medal gold">workspace_premium</mat-icon>
                  </div>
                  
                  <div class="podium-position third">
                    <div class="position-number">3</div>
                    <div class="player-info">
                      <h3>{{topPlayers[2].username}}</h3>
                      <div class="rating">{{topPlayers[2].current_rating | number:'1.0-0'}}</div>
                      <div class="stats">{{topPlayers[2].career_wins}}W / {{topPlayers[2].career_matches}}M</div>
                    </div>
                    <mat-icon class="medal bronze">workspace_premium</mat-icon>
                  </div>
                </div>

                <!-- Full Rankings Table -->
                <table mat-table [dataSource]="dataSource" matSort class="rankings-table">
                  
                  <ng-container matColumnDef="rank">
                    <th mat-header-cell *matHeaderCellDef>Rank</th>
                    <td mat-cell *matCellDef="let player; let i = index">
                      <div class="rank-cell">
                        <span class="rank-number" [ngClass]="getRankClass(i + 1)">{{i + 1}}</span>
                        <mat-icon *ngIf="i < 3" class="rank-icon" [ngClass]="getRankIconClass(i + 1)">
                          workspace_premium
                        </mat-icon>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="username">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Player</th>
                    <td mat-cell *matCellDef="let player">
                      <div class="player-cell">
                        <span class="username">{{player.username}}</span>
                        <div class="player-badges">
                          <mat-chip *ngIf="player.tournaments_won > 0" class="tournament-chip">
                            {{player.tournaments_won}} Tournament{{player.tournaments_won > 1 ? 's' : ''}}
                          </mat-chip>
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="current_rating">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Rating</th>
                    <td mat-cell *matCellDef="let player">
                      <div class="rating-cell">
                        <span class="current-rating">{{player.current_rating | number:'1.0-0'}}</span>
                        <small class="peak-rating">Peak: {{player.peak_rating | number:'1.0-0'}}</small>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="matches">
                    <th mat-header-cell *matHeaderCellDef>Record</th>
                    <td mat-cell *matCellDef="let player">
                      <div class="record-cell">
                        <span class="wins">{{player.career_wins}}W</span>
                        <span class="separator">-</span>
                        <span class="losses">{{player.career_losses}}L</span>
                        <div class="win-rate">{{getWinPercentage(player) | number:'1.1-1'}}%</div>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="tournaments">
                    <th mat-header-cell *matHeaderCellDef>Tournaments</th>
                    <td mat-cell *matCellDef="let player">
                      <div class="tournament-cell">
                        <span class="tournaments-won">{{player.tournaments_won}}</span>
                        <span class="separator">/</span>
                        <span class="tournaments-played">{{player.tournaments_played}}</span>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                      class="player-row" 
                      [ngClass]="getRowClass(row)"></tr>
                </table>

                <mat-paginator [pageSizeOptions]="[25, 50, 100]" showFirstLastButtons></mat-paginator>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Rising Stars -->
        <mat-tab label="Rising Stars">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Rising Stars</mat-card-title>
                <mat-card-subtitle>Players with the biggest recent rating gains</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="rising-stars-grid">
                  <div *ngFor="let player of risingStars" class="rising-star-card">
                    <div class="player-info">
                      <h3>{{player.username}}</h3>
                      <div class="rating-change positive">
                        <mat-icon>trending_up</mat-icon>
                        <span>+42 this week</span>
                      </div>
                      <div class="current-rating">{{player.current_rating | number:'1.0-0'}} rating</div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Hall of Fame -->
        <mat-tab label="Hall of Fame">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Hall of Fame</mat-card-title>
                <mat-card-subtitle>Legendary players and record holders</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="hall-of-fame-grid">
                  <div class="record-category">
                    <h3>Highest Peak Rating</h3>
                    <div class="record-holder" *ngIf="topPlayers.length > 0">
                      <span class="name">{{topPlayers[0].username}}</span>
                      <span class="value">{{topPlayers[0].peak_rating | number:'1.0-0'}}</span>
                    </div>
                  </div>
                  
                  <div class="record-category">
                    <h3>Most Tournament Wins</h3>
                    <div class="record-holder">
                      <span class="name">Champion Player</span>
                      <span class="value">15 Tournaments</span>
                    </div>
                  </div>
                  
                  <div class="record-category">
                    <h3>Most Matches Won</h3>
                    <div class="record-holder">
                      <span class="name">Veteran Player</span>
                      <span class="value">247 Wins</span>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading leaderboard...</p>
      </div>
    </div>
  `,
  styles: [`
    .leaderboard-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #333; }
    .header p { color: #666; margin-top: 10px; }
    
    .leaderboard-tabs { margin-top: 20px; }
    .tab-content { padding: 20px 0; }
    
    .podium { 
      display: grid; 
      grid-template-columns: 1fr 1fr 1fr; 
      gap: 20px; 
      margin-bottom: 40px; 
      padding: 40px 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 12px;
    }
    
    .podium-position { 
      text-align: center; 
      position: relative;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .podium-position.first { 
      transform: translateY(-20px);
      border: 3px solid #ffd700;
    }
    
    .podium-position.second { 
      transform: translateY(-10px);
      border: 3px solid #c0c0c0;
    }
    
    .podium-position.third { 
      border: 3px solid #cd7f32;
    }
    
    .position-number { 
      font-size: 2rem; 
      font-weight: bold; 
      color: #333; 
      margin-bottom: 10px;
    }
    
    .player-info h3 { 
      margin: 0 0 10px 0; 
      color: #333; 
    }
    
    .player-info .rating { 
      font-size: 1.5rem; 
      font-weight: bold; 
      color: #1976d2; 
      margin-bottom: 5px;
    }
    
    .player-info .stats { 
      color: #666; 
      font-size: 0.9rem; 
    }
    
    .medal { 
      position: absolute; 
      top: -10px; 
      right: -10px; 
      font-size: 32px; 
    }
    
    .medal.gold { color: #ffd700; }
    .medal.silver { color: #c0c0c0; }
    .medal.bronze { color: #cd7f32; }
    
    .rankings-table { 
      width: 100%; 
      margin-top: 20px;
    }
    
    .rank-cell { 
      display: flex; 
      align-items: center; 
      gap: 8px; 
    }
    
    .rank-number { 
      font-weight: bold; 
      min-width: 30px; 
    }
    
    .rank-number.top { color: #ffd700; }
    .rank-number.high { color: #1976d2; }
    
    .rank-icon { 
      font-size: 18px; 
    }
    
    .rank-icon.gold { color: #ffd700; }
    .rank-icon.silver { color: #c0c0c0; }
    .rank-icon.bronze { color: #cd7f32; }
    
    .player-cell { 
      display: flex; 
      flex-direction: column; 
    }
    
    .username { 
      font-weight: 500; 
      color: #333; 
    }
    
    .player-badges { 
      margin-top: 4px; 
    }
    
    .tournament-chip { 
      background-color: #ffc107; 
      color: #333; 
      font-size: 0.7rem; 
      height: 20px; 
    }
    
    .rating-cell { 
      display: flex; 
      flex-direction: column; 
    }
    
    .current-rating { 
      font-weight: bold; 
      font-size: 1.1rem; 
      color: #1976d2; 
    }
    
    .peak-rating { 
      color: #666; 
      margin-top: 2px; 
    }
    
    .record-cell { 
      display: flex; 
      align-items: center; 
      gap: 4px; 
    }
    
    .wins { color: #4caf50; font-weight: 500; }
    .losses { color: #f44336; font-weight: 500; }
    .separator { color: #666; }
    .win-rate { 
      margin-left: 8px; 
      font-size: 0.9rem; 
      color: #666; 
    }
    
    .tournament-cell { 
      display: flex; 
      align-items: center; 
      gap: 4px; 
    }
    
    .tournaments-won { 
      color: #ffc107; 
      font-weight: bold; 
    }
    
    .player-row { 
      transition: background-color 0.2s; 
    }
    
    .player-row:hover { 
      background-color: #f5f5f5; 
    }
    
    .player-row.current-user { 
      background-color: #e3f2fd !important; 
    }
    
    .rising-stars-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
      gap: 20px; 
    }
    
    .rising-star-card { 
      padding: 20px; 
      border: 1px solid #eee; 
      border-radius: 8px; 
      background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
    }
    
    .rising-star-card h3 { 
      margin: 0 0 10px 0; 
      color: #333; 
    }
    
    .rating-change { 
      display: flex; 
      align-items: center; 
      gap: 5px; 
      margin-bottom: 8px; 
    }
    
    .rating-change.positive { 
      color: #4caf50; 
    }
    
    .current-rating { 
      color: #666; 
      font-size: 0.9rem; 
    }
    
    .hall-of-fame-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
      gap: 30px; 
    }
    
    .record-category { 
      text-align: center; 
      padding: 30px; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }
    
    .record-category h3 { 
      margin: 0 0 20px 0; 
    }
    
    .record-holder { 
      display: flex; 
      flex-direction: column; 
      gap: 10px; 
    }
    
    .record-holder .name { 
      font-size: 1.2rem; 
      font-weight: 500; 
    }
    
    .record-holder .value { 
      font-size: 2rem; 
      font-weight: bold; 
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .loading-container { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      padding: 60px; 
    }
    
    @media (max-width: 768px) {
      .podium { 
        grid-template-columns: 1fr; 
      }
      
      .podium-position.first, 
      .podium-position.second, 
      .podium-position.third { 
        transform: none; 
      }
      
      .rising-stars-grid { 
        grid-template-columns: 1fr; 
      }
      
      .hall-of-fame-grid { 
        grid-template-columns: 1fr; 
      }
    }
  `]
})
export class LeaderboardComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['rank', 'username', 'current_rating', 'matches', 'tournaments'];
  dataSource = new MatTableDataSource<UserProfile>();
  topPlayers: UserProfile[] = [];
  risingStars: UserProfile[] = [];
  loading = false;
  currentUserId = 1; // Mock - would come from auth service

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private tournamentService: TournamentService) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadLeaderboard(): void {
    this.loading = true;
    
    this.tournamentService.getLeaderboard().subscribe({
      next: (players) => {
        this.dataSource.data = players;
        this.topPlayers = players.slice(0, 3);
        this.risingStars = players.filter(p => p.current_rating > 1400).slice(3, 9);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading leaderboard:', error);
        this.loading = false;
      }
    });
  }

  getRankClass(rank: number): string {
    if (rank <= 3) return 'top';
    if (rank <= 10) return 'high';
    return '';
  }

  getRankIconClass(rank: number): string {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  }

  getRowClass(player: UserProfile): string {
    return player.id === this.currentUserId ? 'current-user' : '';
  }

  getWinPercentage(player: UserProfile): number {
    if (player.career_matches === 0) return 0;
    return (player.career_wins / player.career_matches) * 100;
  }
}
