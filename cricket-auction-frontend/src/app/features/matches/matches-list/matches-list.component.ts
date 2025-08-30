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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatchService } from '../../../core/services/match.service';
import { Match } from '../../../core/models';

@Component({
  selector: 'app-matches-list',
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
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './matches-list.component.html',
  styleUrls: ['./matches-list.component.scss']
})
export class MatchesListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['teams', 'score', 'winner', 'status', 'created_at', 'actions'];
  dataSource = new MatTableDataSource<Match>();
  loading = false;
  simulatingMatches = new Set<number>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private matchService: MatchService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMatches();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadMatches(): void {
    this.loading = true;
    this.matchService.getMatches().subscribe({
      next: (response) => {
        this.dataSource.data = response.results;
        this.loading = false;
        console.log('Matches loaded:', response);
      },
      error: (error) => {
        this.snackBar.open('Error loading matches: ' + error, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  createMatch(): void {
    const mockMatch = {
      team1: 1,
      team2: 2,
      pitch_condition: 1,
      weather_condition: 1
    };
    
    this.matchService.createMatch(mockMatch).subscribe({
      next: () => {
        this.snackBar.open('Match created successfully', 'Close', { duration: 3000 });
        this.loadMatches();
      },
      error: (error) => {
        this.snackBar.open('Error creating match: ' + error, 'Close', { duration: 3000 });
      }
    });
  }

  simulateMatch(match: Match): void {
    this.simulatingMatches.add(match.id);
    
    this.matchService.simulateMatch(match.id, 20).subscribe({
      next: (result) => {
        this.snackBar.open(`Match completed! ${result.winner} won ${result.margin}`, 'Close', { duration: 5000 });
        this.simulatingMatches.delete(match.id);
        this.loadMatches();
        console.log('Match simulation result:', result);
      },
      error: (error) => {
        this.snackBar.open('Error simulating match: ' + error, 'Close', { duration: 3000 });
        this.simulatingMatches.delete(match.id);
      }
    });
  }

  getStatusLabel(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
}
