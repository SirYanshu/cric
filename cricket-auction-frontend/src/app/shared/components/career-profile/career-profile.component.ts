// src/app/shared/components/career-profile/career-profile.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TournamentService } from '../../../core/services/tournament.service';
import { UserProfile, CareerStats, RatingHistory, Achievement } from '../../../core/models';

@Component({
  selector: 'app-career-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="career-profile-container" *ngIf="userProfile">
      <div class="profile-header">
        <h1>{{userProfile.username || 'Player'}}</h1>
        <div class="rating-display">
          <span class="current-rating">{{userProfile.current_rating | number:'1.0-0'}}</span>
          <span class="rating-label">Current Rating</span>
        </div>
      </div>
      
      <div class="quick-stats" *ngIf="careerStats">
        <div class="stat-card">
          <mat-icon>sports_cricket</mat-icon>
          <span class="stat-value">{{careerStats.matches.played}}</span>
          <span class="stat-label">Matches</span>
        </div>
        <div class="stat-card">
          <mat-icon>emoji_events</mat-icon>
          <span class="stat-value">{{careerStats.tournaments.won}}</span>
          <span class="stat-label">Tournaments Won</span>
        </div>
        <div class="stat-card">
          <mat-icon>trending_up</mat-icon>
          <span class="stat-value">{{careerStats.matches.win_percentage | number:'1.1-1'}}%</span>
          <span class="stat-label">Win Rate</span>
        </div>
      </div>
      
      <p *ngIf="!careerStats">Loading career statistics...</p>
    </div>
  `,
  styles: [`
    .career-profile-container { padding: 20px; }
    .profile-header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      border-radius: 12px;
      color: white;
      margin-bottom: 20px;
    }
    .profile-header h1 { margin: 0 0 15px 0; }
    .current-rating { font-size: 3rem; font-weight: bold; }
    .rating-label { opacity: 0.9; }
    .quick-stats { display: flex; gap: 20px; }
    .stat-card { 
      background: white; 
      padding: 20px; 
      border-radius: 8px; 
      text-align: center; 
      flex: 1;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .stat-value { display: block; font-size: 2rem; font-weight: bold; color: #1976d2; }
    .stat-label { color: #666; }
    @media (max-width: 768px) {
      .quick-stats { flex-direction: column; }
    }
  `]
})
export class CareerProfileComponent implements OnInit {
  @Input() userId!: number;
  
  userProfile: UserProfile | null = null;
  careerStats: CareerStats | null = null;
  ratingHistory: RatingHistory[] = [];
  achievements: Achievement[] = [];

  constructor(private tournamentService: TournamentService) {}

  ngOnInit(): void {
    this.loadProfileData();
  }

  loadProfileData(): void {
    this.tournamentService.getUserProfile(this.userId).subscribe({
      next: (profile: UserProfile) => {
        this.userProfile = profile;
      },
      error: (error: any) => console.error('Error loading profile:', error)
    });

    this.tournamentService.getCareerStats(this.userId).subscribe({
      next: (stats: CareerStats) => {
        this.careerStats = stats;
      },
      error: (error: any) => console.error('Error loading career stats:', error)
    });

    this.tournamentService.getRatingHistory(this.userId).subscribe({
      next: (history: RatingHistory[]) => {
        this.ratingHistory = history.slice(0, 20);
      },
      error: (error: any) => console.error('Error loading rating history:', error)
    });

    this.tournamentService.getAchievements(this.userId).subscribe({
      next: (achievements: Achievement[]) => {
        this.achievements = achievements;
      },
      error: (error: any) => console.error('Error loading achievements:', error)
    });
  }
}
