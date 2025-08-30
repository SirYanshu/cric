import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Team, Player, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private readonly endpoint = 'teams';

  constructor(private apiService: ApiService) {}

  getTeams(): Observable<ApiResponse<Team>> {
    return this.apiService.get<ApiResponse<Team>>(`${this.endpoint}/`);
  }

  getTeam(id: number): Observable<Team> {
    return this.apiService.get<Team>(`${this.endpoint}/${id}/`);
  }

  createTeam(team: Partial<Team>): Observable<Team> {
    return this.apiService.post<Team>(`${this.endpoint}/`, team);
  }

  updateTeam(id: number, team: Partial<Team>): Observable<Team> {
    return this.apiService.put<Team>(`${this.endpoint}/${id}/`, team);
  }

  deleteTeam(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}/`);
  }

  getTeamPlayers(id: number): Observable<Player[]> {
    return this.apiService.get<Player[]>(`${this.endpoint}/${id}/players/`);
  }

  getPlayingEleven(id: number): Observable<Player[]> {
    return this.apiService.get<Player[]>(`${this.endpoint}/${id}/playing_eleven/`);
  }
}
