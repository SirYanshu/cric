import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: "app-rating-history",
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `<div class="container"><mat-card><mat-card-header><mat-card-title>Rating History</mat-card-title></mat-card-header><mat-card-content><p>Rating history chart coming soon!</p></mat-card-content></mat-card></div>`,
  styles: [`.container { padding: 20px; }`]
})
export class RatingHistoryComponent {}
