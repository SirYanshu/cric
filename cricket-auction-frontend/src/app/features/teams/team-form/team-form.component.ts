import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamService } from '../../../core/services/team.service';

@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="team-form-container">
      <div class="header">
        <button mat-icon-button routerLink="/teams">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{isEditMode ? 'Edit Team' : 'Create New Team'}}</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="teamForm" (ngSubmit)="onSubmit()">
            <div class="form-fields">
              <mat-form-field appearance="outline">
                <mat-label>Team Name</mat-label>
                <input matInput formControlName="name" placeholder="Enter team name">
                <mat-error *ngIf="teamForm.get('name')?.hasError('required')">
                  Team name is required
                </mat-error>
                <mat-error *ngIf="teamForm.get('name')?.hasError('minlength')">
                  Team name must be at least 2 characters
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Budget</mat-label>
                <input matInput type="number" formControlName="budget" placeholder="Enter team budget">
                <mat-hint>Budget in dollars (e.g., 10000000 for $10M)</mat-hint>
                <mat-error *ngIf="teamForm.get('budget')?.hasError('required')">
                  Budget is required
                </mat-error>
                <mat-error *ngIf="teamForm.get('budget')?.hasError('min')">
                  Budget must be at least $1,000,000
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" *ngIf="isEditMode">
                <mat-label>Available Budget</mat-label>
                <input matInput type="number" formControlName="money_left">
                <mat-error *ngIf="teamForm.get('money_left')?.hasError('required')">
                  Available budget is required
                </mat-error>
                <mat-error *ngIf="teamForm.get('money_left')?.hasError('min')">
                  Available budget cannot be negative
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="teamForm.invalid || loading">
                <mat-icon *ngIf="loading" class="spinning">refresh</mat-icon>
                <mat-icon *ngIf="!loading">{{isEditMode ? 'update' : 'add'}}</mat-icon>
                {{isEditMode ? 'Update Team' : 'Create Team'}}
              </button>
              <button mat-button type="button" routerLink="/teams">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .team-form-container { padding: 20px; max-width: 600px; margin: 0 auto; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .header h1 { margin: 0; color: #333; }
    .form-fields { display: grid; gap: 20px; margin-bottom: 20px; }
    mat-form-field { width: 100%; }
    .form-actions { display: flex; gap: 16px; }
    @media (max-width: 480px) { 
      .form-actions { flex-direction: column; } 
      .form-actions button { width: 100%; } 
    }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class TeamFormComponent implements OnInit {
  teamForm: FormGroup;
  isEditMode = false;
  loading = false;
  teamId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private snackBar: MatSnackBar
  ) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      budget: [10000000, [Validators.required, Validators.min(1000000)]],
      money_left: [10000000, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.teamId = Number(id);
      this.loadTeam(this.teamId);
    }
  }

  private loadTeam(id: number): void {
    this.loading = true;
    this.teamService.getTeam(id).subscribe({
      next: (team) => {
        this.teamForm.patchValue(team);
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading team: ' + error, 'Close', { duration: 3000 });
        this.router.navigate(['/teams']);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.teamForm.valid) {
      this.loading = true;
      const teamData = this.teamForm.value;

      if (!this.isEditMode) {
        teamData.money_left = teamData.budget;
      }

      const operation = this.isEditMode 
        ? this.teamService.updateTeam(this.teamId!, teamData)
        : this.teamService.createTeam(teamData);

      operation.subscribe({
        next: (team) => {
          const message = this.isEditMode ? 'Team updated successfully' : 'Team created successfully';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.router.navigate(['/teams', team.id]);
        },
        error: (error) => {
          this.snackBar.open('Error saving team: ' + error, 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }
}
