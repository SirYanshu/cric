
// src/app/features/profile/achievements/achievements.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Achievements</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Achievements gallery coming soon!</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.container { padding: 20px; }`]
})
export class AchievementsComponent {}
