import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: "app-tournament-matches",
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `<div class="container"><mat-card><mat-card-header><mat-card-title>Tournament Matches</mat-card-title></mat-card-header><mat-card-content><p>Tournament match fixtures coming soon!</p></mat-card-content></mat-card></div>`,
  styles: [`.container { padding: 20px; }`]
})
export class TournamentMatchesComponent {}
