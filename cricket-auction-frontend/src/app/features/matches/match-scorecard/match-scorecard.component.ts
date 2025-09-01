// match-scorecard.component.ts - Detailed cricket scorecard with ball-by-ball tracking

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { SimpleChartComponent } from '../../../shared/components/simple-chart/simple-chart.component';
import { 
  EnhancedMatch, Innings, PlayerPerformance, Over, Ball, RatingHistory,
  BattingAnalytics, BowlingAnalytics, RatingChartData, PerformanceChartData
} from '../../../core/models';

@Component({
  selector: 'app-match-scorecard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatExpansionModule,
    SimpleChartComponent
  ],
  template: `
    <div class="scorecard-container" *ngIf="match">
      <div class="match-header">
        <h1>{{match.team1_name}} vs {{match.team2_name}}</h1>
        <div class="match-info">
          <mat-chip class="tournament-chip">{{match.tournament_name}}</mat-chip>
          <mat-chip [ngClass]="'status-' + match.status.toLowerCase()">
            {{getStatusLabel(match.status)}}
          </mat-chip>
        </div>
      </div>

      <div class="score-summary" *ngIf="match.status === 'COMPLETED'">
        <div class="team-score">
          <h2>{{match.team1_name}}</h2>
          <div class="score">{{match.team1_score}}/{{match.team1_wickets}}</div>
          <div class="overs">({{match.team1_overs}} overs)</div>
          <div class="rating-change" [ngClass]="match.team1_rating_change >= 0 ? 'positive' : 'negative'">
            {{match.team1_rating_change >= 0 ? '+' : ''}}{{match.team1_rating_change | number:'1.1-1'}} rating
          </div>
        </div>
        
        <div class="vs-section">
          <mat-icon>sports_cricket</mat-icon>
          <div class="result" *ngIf="match.winner_name">
            <strong>{{match.winner_name}} won</strong>
          </div>
        </div>
        
        <div class="team-score">
          <h2>{{match.team2_name}}</h2>
          <div class="score">{{match.team2_score}}/{{match.team2_wickets}}</div>
          <div class="overs">({{match.team2_overs}} overs)</div>
          <div class="rating-change" [ngClass]="match.team2_rating_change >= 0 ? 'positive' : 'negative'">
            {{match.team2_rating_change >= 0 ? '+' : ''}}{{match.team2_rating_change | number:'1.1-1'}} rating
          </div>
        </div>
      </div>

      <mat-tab-group class="scorecard-tabs">
        
        <!-- Scorecard Tab -->
        <mat-tab label="Scorecard">
          <div class="tab-content">
            <div class="innings-section" *ngFor="let innings of match.innings">
              <mat-card class="innings-card">
                <mat-card-header>
                  <mat-card-title>
                    {{innings.batting_team_name}} - {{innings.total_runs}}/{{innings.wickets_lost}} 
                    ({{innings.overs_bowled}} overs)
                  </mat-card-title>
                  <mat-card-subtitle>{{getInningsLabel(innings.innings_type)}}</mat-card-subtitle>
                </mat-card-header>
                
                <mat-card-content>
                  <!-- Batting Performance -->
                  <div class="performance-section">
                    <h3>Batting</h3>
                    <table mat-table [dataSource]="getBattingPerformances(innings)" class="performance-table">
                      <ng-container matColumnDef="player">
                        <th mat-header-cell *matHeaderCellDef>Player</th>
                        <td mat-cell *matCellDef="let perf">
                          {{perf.player_name}}
                          <span class="batting-position" *ngIf="perf.batting_position">({{perf.batting_position}})</span>
                        </td>
                      </ng-container>
                      
                      <ng-container matColumnDef="runs">
                        <th mat-header-cell *matHeaderCellDef>Runs</th>
                        <td mat-cell *matCellDef="let perf">{{perf.runs_scored}}</td>
                      </ng-container>
                      
                      <ng-container matColumnDef="balls">
                        <th mat-header-cell *matHeaderCellDef>Balls</th>
                        <td mat-cell *matCellDef="let perf">{{perf.balls_faced}}</td>
                      </ng-container>
                      
                      <ng-container matColumnDef="strike_rate">
                        <th mat-header-cell *matHeaderCellDef>SR</th>
                        <td mat-cell *matCellDef="let perf">{{getStrikeRate(perf) | number:'1.1-1'}}</td>
                      </ng-container>
                      
                      <ng-container matColumnDef="boundaries">
                        <th mat-header-cell *matHeaderCellDef>4s/6s</th>
                        <td mat-cell *matCellDef="let perf">{{perf.fours}}/{{perf.sixes}}</td>
                      </ng-container>
                      
                      <ng-container matColumnDef="how_out">
                        <th mat-header-cell *matHeaderCellDef>How Out</th>
                        <td mat-cell *matCellDef="let perf">
                          <span class="dismissal">{{perf.how_out || 'Not Out'}}</span>
                        </td>
                      </ng-container>
                      
                      <tr mat-header-row *matHeaderRowDef="battingColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: battingColumns;"></tr>
                    </table>
                  </div>
                  
                  <!-- Bowling Performance -->
                  <div class="performance-section">
                    <h3>Bowling</h3>
                    <table mat-table [dataSource]="getBowlingPerformances(innings)" class="performance-table">
                      <ng-container matColumnDef="player">
                        <th mat-header-cell *matHeaderCellDef>Bowler</th>
                        <td mat-cell *matCellDef="let perf">{{perf.player_name}}</td>
                      </ng-container>
                      
                      <ng-container matColumnDef="overs">
                        <th mat-header-cell *matHeaderCellDef>Overs</th>
                        <td mat-cell *matCellDef="let perf">{{perf.overs_bowled}}</td>
                      </ng-container>
                      
                      <ng-container matColumnDef="maidens">
                        <th mat-header-cell *matHeaderCellDef>M</th>
                        <td mat-cell *matCellDef="let perf">{{perf.maidens}}</td>
                      </ng-container>
                      
                      <ng-container matColumnDef="runs">
                        <th mat-header-cell *matHeaderCellDef>Runs</th>
                        <td mat-cell *matCellDef="let perf">{{perf.runs_conceded}}</td>
                      </ng-container>
                      
                      <ng-container matColumnDef="wickets">
                        <th mat-header-cell *matHeaderCellDef>Wickets</th>
                        <td mat-cell *matCellDef="let perf">{{perf.wickets_taken}}</td>
                      </ng-container>
                      
                      <ng-container matColumnDef="economy">
                        <th mat-header-cell *matHeaderCellDef>Econ</th>
                        <td mat-cell *matCellDef="let perf">{{getEconomy(perf) | number:'1.1-1'}}</td>
                      </ng-container>
                      
                      <tr mat-header-row *matHeaderRowDef="bowlingColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: bowlingColumns;"></tr>
                    </table>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Ball by Ball Tab -->
        <mat-tab label="Ball by Ball">
          <div class="tab-content">
            <mat-accordion class="overs-accordion" *ngFor="let innings of match.innings">
              <mat-expansion-panel class="innings-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>{{innings.batting_team_name}} Innings</mat-panel-title>
                  <mat-panel-description>{{innings.total_runs}}/{{innings.wickets_lost}} ({{innings.overs_bowled}} overs)</mat-panel-description>
                </mat-expansion-panel-header>
                
                <div class="over-details" *ngFor="let over of innings.overs">
                  <mat-card class="over-card">
                    <mat-card-header>
                      <mat-card-title>Over {{over.over_number}} - {{over.bowler_name}}</mat-card-title>
                      <mat-card-subtitle>{{over.runs_scored}} runs, {{over.wickets}} wickets</mat-card-subtitle>
                    </mat-card-header>
                    
                    <mat-card-content>
                      <div class="balls-grid">
                        <div *ngFor="let ball of over.balls" class="ball-outcome" [ngClass]="'outcome-' + ball.outcome">
                          <div class="ball-number">{{ball.ball_number}}</div>
                          <div class="outcome">{{ball.outcome}}</div>
                          <div class="runs" *ngIf="ball.runs > 0">{{ball.runs}}</div>
                          <div class="wicket-info" *ngIf="ball.is_wicket">
                            <small>{{ball.dismissal_type}}</small>
                            <small *ngIf="ball.fielder_name">{{ball.fielder_name}}</small>
                          </div>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </mat-expansion-panel>
            </mat-accordion>
          </div>
        </mat-tab>

        <!-- Analytics Tab -->
        <mat-tab label="Analytics">
          <div class="tab-content">
            <div class="analytics-grid">
              
              <!-- Match Performance Chart -->
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Match Performance</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <app-simple-chart 
                    *ngIf="performanceChartData"
                    type="bar"
                    [data]="performanceChartData"
                    [options]="chartOptions">
                  </app-simple-chart>
                </mat-card-content>
              </mat-card>

              <!-- Run Rate Chart -->
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Run Rate by Over</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <app-simple-chart 
                    *ngIf="runRateChartData"
                    type="line"
                    [data]="runRateChartData"
                    [options]="chartOptions">
                  </app-simple-chart>
                </mat-card-content>
              </mat-card>

              <!-- Key Statistics -->
              <mat-card class="stats-card">
                <mat-card-header>
                  <mat-card-title>Match Statistics</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="stats-grid">
                    <div class="stat-item">
                      <span class="label">Highest Score</span>
                      <span class="value">{{getHighestScore()}}</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">Best Bowling</span>
                      <span class="value">{{getBestBowling()}}</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">Total Boundaries</span>
                      <span class="value">{{getTotalBoundaries()}}</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">Match Duration</span>
                      <span class="value">{{getTotalOvers()}} overs</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Rating Impact Tab -->
        <mat-tab label="Rating Impact">
          <div class="tab-content">
            <div class="rating-impact-grid">
              <mat-card class="rating-card" *ngFor="let team of [match.team1_name, match.team2_name]; let i = index">
                <mat-card-header>
                  <mat-card-title>{{team}}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="rating-info">
                    <div class="rating-change" [ngClass]="getRatingChange(i) >= 0 ? 'positive' : 'negative'">
                      <span class="change">{{getRatingChange(i) >= 0 ? '+' : ''}}{{getRatingChange(i) | number:'1.1-1'}}</span>
                      <span class="label">Rating Change</span>
                    </div>
                    
                    <div class="performance-breakdown">
                      <h4>Performance Breakdown</h4>
                      <div class="breakdown-item">
                        <span>Team Result (70%)</span>
                        <span>{{i === 0 ? (match.winner_name === match.team1_name ? '1.0' : '0.0') : (match.winner_name === match.team2_name ? '1.0' : '0.0')}}</span>
                      </div>
                      <div class="breakdown-item">
                        <span>Individual Performance (30%)</span>
                        <span>{{getAvgPerformanceScore(i) | number:'1.2-2'}}</span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .scorecard-container { padding: 20px; }
    .match-header { text-align: center; margin-bottom: 30px; }
    .match-header h1 { margin: 0; color: #333; }
    .match-info { display: flex; justify-content: center; gap: 10px; margin-top: 10px; }
    .tournament-chip { background-color: #1976d2; color: white; }
    
    .score-summary { 
      display: grid; 
      grid-template-columns: 1fr auto 1fr; 
      gap: 20px; 
      align-items: center; 
      margin-bottom: 30px; 
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px;
    }
    
    .team-score {
      text-align: center;
    }
    
    .team-score h2 {
      margin: 0 0 10px 0;
      color: #333;
    }
    
    .score {
      font-size: 2.5rem;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 5px;
    }
    
    .overs {
      color: #666;
      margin-bottom: 10px;
    }
    
    .rating-change {
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .rating-change.positive {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .rating-change.negative {
      background-color: #ffebee;
      color: #d32f2f;
    }
    
    .vs-section {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    
    .vs-section mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
    }
    
    .result {
      font-size: 1.2rem;
      color: #2e7d32;
    }
    
    .scorecard-tabs {
      margin-top: 20px;
    }
    
    .tab-content {
      padding: 20px;
    }
    
    .innings-section {
      margin-bottom: 30px;
    }
    
    .performance-section {
      margin-bottom: 30px;
    }
    
    .performance-section h3 {
      color: #333;
      margin-bottom: 15px;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 5px;
    }
    
    .performance-table {
      width: 100%;
    }
    
    .batting-position {
      color: #666;
      font-size: 0.9rem;
    }
    
    .dismissal {
      font-size: 0.9rem;
      color: #d32f2f;
    }
    
    .overs-accordion {
      margin: 20px 0;
    }
    
    .over-card {
      margin-bottom: 15px;
    }
    
    .balls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    
    .ball-outcome {
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 8px;
      text-align: center;
      transition: transform 0.2s;
    }
    
    .ball-outcome:hover {
      transform: scale(1.05);
    }
    
    .outcome-0 { border-color: #9e9e9e; }
    .outcome-1, .outcome-2, .outcome-3 { border-color: #2196f3; }
    .outcome-4 { border-color: #ff9800; background-color: #fff3e0; }
    .outcome-6 { border-color: #4caf50; background-color: #e8f5e8; }
    .outcome-W { border-color: #f44336; background-color: #ffebee; }
    .outcome-WD, .outcome-NB { border-color: #ff5722; }
    
    .ball-number {
      font-size: 0.8rem;
      color: #666;
    }
    
    .outcome {
      font-weight: bold;
      font-size: 1.2rem;
      margin: 4px 0;
    }
    
    .runs {
      font-size: 0.9rem;
      color: #1976d2;
    }
    
    .wicket-info {
      font-size: 0.7rem;
      color: #d32f2f;
    }
    
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }
    
    .chart-card {
      height: 400px;
    }
    
    .stats-card .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    
    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      border: 1px solid #eee;
      border-radius: 4px;
    }
    
    .stat-item .label {
      color: #666;
    }
    
    .stat-item .value {
      font-weight: 500;
      color: #1976d2;
    }
    
    .rating-impact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .rating-info {
      text-align: center;
    }
    
    .rating-change {
      margin-bottom: 20px;
      padding: 20px;
      border-radius: 8px;
    }
    
    .rating-change .change {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .rating-change .label {
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .performance-breakdown {
      text-align: left;
    }
    
    .breakdown-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    
    .status-completed { background-color: #4caf50; color: white; }
    .status-in_progress { background-color: #ff9800; color: white; }
    .status-scheduled { background-color: #2196f3; color: white; }
    
    @media (max-width: 768px) {
      .score-summary { grid-template-columns: 1fr; gap: 15px; }
      .analytics-grid { grid-template-columns: 1fr; }
      .rating-impact-grid { grid-template-columns: 1fr; }
      .balls-grid { grid-template-columns: repeat(3, 1fr); }
    }
  `]
})
export class MatchScorecardComponent implements OnInit {
  @Input() match!: EnhancedMatch;
  
  battingColumns: string[] = ['player', 'runs', 'balls', 'strike_rate', 'boundaries', 'how_out'];
  bowlingColumns: string[] = ['player', 'overs', 'maidens', 'runs', 'wickets', 'economy'];
  
  performanceChartData: PerformanceChartData | null = null;
  runRateChartData: any = null;
  
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const
      }
    }
  };

  ngOnInit(): void {
    this.generateChartData();
  }

  getBattingPerformances(innings: Innings): PlayerPerformance[] {
    return this.match.player_performances?.filter(p => 
      p.team === innings.batting_team && p.balls_faced > 0
    ) || [];
  }

  getBowlingPerformances(innings: Innings): PlayerPerformance[] {
    return this.match.player_performances?.filter(p => 
      p.team === innings.bowling_team && p.overs_bowled > 0
    ) || [];
  }

  getStrikeRate(performance: PlayerPerformance): number {
    return performance.balls_faced > 0 ? (performance.runs_scored / performance.balls_faced) * 100 : 0;
  }

  getEconomy(performance: PlayerPerformance): number {
    return performance.overs_bowled > 0 ? performance.runs_conceded / performance.overs_bowled : 0;
  }

  getStatusLabel(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  getInningsLabel(type: string): string {
    return type === 'FIRST' ? 'First Innings' : 'Second Innings';
  }

  getRatingChange(teamIndex: number): number {
    return teamIndex === 0 ? this.match.team1_rating_change : this.match.team2_rating_change;
  }

  getAvgPerformanceScore(teamIndex: number): number {
    const teamId = teamIndex === 0 ? this.match.team1 : this.match.team2;
    const performances = this.match.player_performances?.filter(p => p.team === teamId) || [];
    
    if (performances.length === 0) return 0;
    
    const totalScore = performances.reduce((sum, p) => sum + p.overall_rating, 0);
    return totalScore / performances.length;
  }

  getHighestScore(): string {
    const performances = this.match.player_performances || [];
    const highest = performances.reduce((max, p) => 
      p.runs_scored > max.runs_scored ? p : max, performances[0] || { runs_scored: 0, player_name: 'N/A' });
    
    return `${highest.runs_scored} (${highest.player_name})`;
  }

  getBestBowling(): string {
    const performances = this.match.player_performances || [];
    const best = performances.reduce((max, p) => 
      p.wickets_taken > max.wickets_taken ? p : max, performances[0] || { wickets_taken: 0, runs_conceded: 0, player_name: 'N/A' });
    
    return `${best.wickets_taken}/${best.runs_conceded} (${best.player_name})`;
  }

  getTotalBoundaries(): number {
    const performances = this.match.player_performances || [];
    return performances.reduce((total, p) => total + p.fours + p.sixes, 0);
  }

  getTotalOvers(): number {
    return Number(this.match.team1_overs) + Number(this.match.team2_overs);
  }

  generateChartData(): void {
    if (!this.match.player_performances) return;

    // Performance comparison chart
    const team1Performances = this.match.player_performances.filter(p => p.team === this.match.team1);
    const team2Performances = this.match.player_performances.filter(p => p.team === this.match.team2);

    this.performanceChartData = {
      labels: ['Batting', 'Bowling', 'Fielding', 'Overall'],
      datasets: [
        {
          label: this.match.team1_name,
          data: [
            this.getAvgRating(team1Performances, 'batting_rating'),
            this.getAvgRating(team1Performances, 'bowling_rating'),
            this.getAvgRating(team1Performances, 'fielding_rating'),
            this.getAvgRating(team1Performances, 'overall_rating')
          ],
          backgroundColor: ['rgba(25, 118, 210, 0.7)']
        },
        {
          label: this.match.team2_name,
          data: [
            this.getAvgRating(team2Performances, 'batting_rating'),
            this.getAvgRating(team2Performances, 'bowling_rating'),
            this.getAvgRating(team2Performances, 'fielding_rating'),
            this.getAvgRating(team2Performances, 'overall_rating')
          ],
          backgroundColor: ['rgba(255, 64, 129, 0.7)']
        }
      ]
    };

    // Run rate chart (simplified - would need over-by-over data)
    this.generateRunRateChart();
  }

  private getAvgRating(performances: PlayerPerformance[], ratingType: keyof PlayerPerformance): number {
    if (performances.length === 0) return 0;
    const total = performances.reduce((sum, p) => sum + (p[ratingType] as number), 0);
    return total / performances.length;
  }

  private generateRunRateChart(): void {
    // This would need detailed over-by-over data
    // For now, creating a simplified version
    const overs = Array.from({length: this.match.overs}, (_, i) => i + 1);
    
    this.runRateChartData = {
      labels: overs.map(o => `Over ${o}`),
      datasets: [
        {
          label: 'Run Rate',
          data: overs.map(() => Math.random() * 12 + 4), // Mock data
          borderColor: 'rgb(25, 118, 210)',
          backgroundColor: 'rgba(25, 118, 210, 0.2)',
          fill: false,
          tension: 0.1
        }
      ]
    };
  }
}
