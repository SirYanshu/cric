import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Player } from '../../../core/models';

@Component({
  selector: 'app-team-players',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './team-players.component.html',
  styleUrls: ['./team-players.component.scss']
})
export class TeamPlayersComponent implements OnInit, OnChanges {
  @Input() players: Player[] = [];
  @Input() teamId: number = 0;
  @Input() isPlayingEleven: boolean = false;

  displayedColumns: string[] = ['name', 'skills', 'price', 'first_eleven'];
  dataSource = new MatTableDataSource<Player>();

  ngOnInit(): void {
    this.updateDataSource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['players']) {
      this.updateDataSource();
    }
  }

  private updateDataSource(): void {
    this.dataSource.data = this.players ?? [];
  }

  formatCurrency(amount: number | null | undefined): string {
    if (!amount) return '0.0M';
    return (amount / 1_000_000).toFixed(1) + 'M';
  }

  getPlayerTypeLabel(type: string | null | undefined): string {
    if (!type) return 'Unknown';
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}
