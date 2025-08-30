import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Player, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private readonly endpoint = 'players';

  constructor(private apiService: ApiService) {}

  getPlayers(params?: any): Observable<ApiResponse<Player>> {
    return this.apiService.get<ApiResponse<Player>>(`${this.endpoint}/`, params);
  }

  getPlayer(id: number): Observable<Player> {
    return this.apiService.get<Player>(`${this.endpoint}/${id}/`);
  }

  createPlayer(player: Partial<Player>): Observable<Player> {
    return this.apiService.post<Player>(`${this.endpoint}/`, player);
  }

  updatePlayer(id: number, player: Partial<Player>): Observable<Player> {
    return this.apiService.put<Player>(`${this.endpoint}/${id}/`, player);
  }

  deletePlayer(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}/`);
  }

  getAvailablePlayers(): Observable<Player[]> {
    return this.apiService.get<Player[]>(`${this.endpoint}/available/`);
  }
}
