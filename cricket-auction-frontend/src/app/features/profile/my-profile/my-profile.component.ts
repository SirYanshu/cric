import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: "app-my-profile",
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="profile-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>My Profile</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Your career profile and statistics will appear here.</p>
          <p>Features coming soon:</p>
          <ul>
            <li>Career statistics</li>
            <li>Rating history</li>
            <li>Achievement gallery</li>
            <li>Tournament performance</li>
          </ul>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container { padding: 20px; max-width: 800px; margin: 0 auto; }
  `]
})
export class MyProfileComponent {}
