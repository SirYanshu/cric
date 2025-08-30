import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="stats-card" [ngClass]="'stats-card-' + color">
      <mat-card-content>
        <div class="stats-content">
          <div class="stats-icon">
            <mat-icon [ngClass]="'icon-' + color">{{icon}}</mat-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{value | number}}</div>
            <div class="stats-title">{{title}}</div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .stats-card { height: 120px; cursor: pointer; transition: transform 0.2s ease-in-out; }
    .stats-card:hover { transform: translateY(-2px); }
    .stats-content { display: flex; align-items: center; height: 100%; }
    .stats-icon { margin-right: 16px; }
    .stats-icon mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .stats-value { font-size: 2.5rem; font-weight: bold; line-height: 1; }
    .stats-title { font-size: 1rem; color: #666; margin-top: 4px; }
    .stats-card-primary .stats-value { color: #1976d2; }
    .stats-card-accent .stats-value { color: #ff4081; }
    .stats-card-warn .stats-value { color: #f44336; }
    .icon-primary { color: #1976d2; }
    .icon-accent { color: #ff4081; }
    .icon-warn { color: #f44336; }
  `]
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() icon: string = '';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
}
