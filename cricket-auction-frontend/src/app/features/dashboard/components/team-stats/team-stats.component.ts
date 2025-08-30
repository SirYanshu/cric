import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Team } from '../../../../core/models';

@Component({
  selector: 'app-team-stats',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="team-stats">
      <div *ngIf="teams && teams.length > 0; else noData">
        <div class="teams-list">
          <div *ngFor="let team of teams" class="team-item">
            <div class="team-name">{{team.name}}</div>
            <div class="budget-info">
              <div class="budget-row">
                <span class="label">Total Budget:</span>
                <span class="value">\${{formatCurrency(team.budget)}}</span>
              </div>
              <div class="budget-row">
                <span class="label">Available:</span>
                <span class="value">\${{formatCurrency(team.money_left)}}</span>
              </div>
              <mat-progress-bar 
                mode="determinate" 
                [value]="getBudgetUsagePercentage(team)"
                class="usage-bar">
              </mat-progress-bar>
              <small>{{getBudgetUsagePercentage(team) | number:'1.0-0'}}% used</small>
            </div>
          </div>
        </div>
      </div>
      <ng-template #noData>
        <div class="no-data">
          <mat-icon>bar_chart</mat-icon>
          <p>No team data available</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .team-stats { 
      height: 300px; 
      overflow-y: auto; 
    }
    .teams-list { 
      padding: 16px; 
    }
    .team-item { 
      margin-bottom: 20px; 
      padding: 12px; 
      border: 1px solid #e0e0e0; 
      border-radius: 4px; 
    }
    .team-name { 
      font-weight: 500; 
      margin-bottom: 8px; 
      color: #333; 
    }
    .budget-row { 
      display: flex; 
      justify-content: space-between; 
      margin-bottom: 4px; 
    }
    .label { 
      color: #666; 
      font-size: 0.9rem; 
    }
    .value { 
      font-family: monospace; 
      font-weight: 500; 
    }
    .usage-bar { 
      margin: 8px 0 4px 0; 
    }
    .no-data { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      height: 100%; 
      color: #666; 
    }
    .no-data mat-icon { 
      font-size: 48px; 
      width: 48px; 
      height: 48px; 
      margin-bottom: 16px; 
    }
  `]
})
export class TeamStatsComponent implements OnChanges {
  @Input() teams: Team[] = [];

  ngOnChanges(): void {
    // Component logic can be added here if needed
  }

  formatCurrency(amount: number): string {
    if (amount == null || isNaN(amount)) {
      return '0.0M';
    }
    return (amount / 1000000).toFixed(1) + 'M';
  }

  getBudgetUsagePercentage(team: Team): number {
    if (!team || team.budget == null || team.money_left == null || team.budget === 0) {
      return 0;
    }
    const percentage = ((team.budget - team.money_left) / team.budget) * 100;
    return Math.max(0, Math.min(100, percentage)); // Clamp between 0 and 100
  }
}
