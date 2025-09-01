
// src/app/core/services/tournament.service.ts
// Fix service with proper types
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Tournament, TournamentRegistration, UserProfile, RatingHistory, Achievement, CareerStats, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private readonly endpoint = 'tournaments';
  private readonly profileEndpoint = 'user-profiles';
  private readonly ratingHistoryEndpoint = 'rating-history';
  private readonly achievementsEndpoint = 'achievements';

  constructor(private apiService: ApiService) {}

  // Tournament Management
  getTournaments(params?: any): Observable<ApiResponse<Tournament>> {
    return this.apiService.get<ApiResponse<Tournament>>(`${this.endpoint}/`, params);
  }

  getTournament(id: number): Observable<Tournament> {
    return this.apiService.get<Tournament>(`${this.endpoint}/${id}/`);
  }

  createTournament(tournament: Partial<Tournament>): Observable<Tournament> {
    return this.apiService.post<Tournament>(`${this.endpoint}/`, tournament);
  }

  updateTournament(id: number, tournament: Partial<Tournament>): Observable<Tournament> {
    return this.apiService.put<Tournament>(`${this.endpoint}/${id}/`, tournament);
  }

  registerForTournament(tournamentId: number, teamId: number): Observable<TournamentRegistration> {
    return this.apiService.post<TournamentRegistration>(`${this.endpoint}/${tournamentId}/register/`, { team_id: teamId });
  }

  getTournamentRegistrations(tournamentId: number): Observable<TournamentRegistration[]> {
    return this.apiService.get<TournamentRegistration[]>(`${this.endpoint}/${tournamentId}/registrations/`);
  }

  startTournament(tournamentId: number): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/${tournamentId}/start/`, {});
  }

  // User Profile & Career Management
  getUserProfile(userId: number): Observable<UserProfile> {
    return this.apiService.get<UserProfile>(`${this.profileEndpoint}/${userId}/`);
  }

  getCareerStats(userId: number): Observable<CareerStats> {
    return this.apiService.get<CareerStats>(`${this.profileEndpoint}/${userId}/career-stats/`);
  }

  getRatingHistory(userId: number): Observable<RatingHistory[]> {
    return this.apiService.get<RatingHistory[]>(`${this.ratingHistoryEndpoint}/`, { user: userId });
  }

  getAchievements(userId: number): Observable<Achievement[]> {
    return this.apiService.get<Achievement[]>(`${this.achievementsEndpoint}/`, { user: userId });
  }

  // Leaderboards
  getLeaderboard(): Observable<UserProfile[]> {
    return this.apiService.get<UserProfile[]>(`${this.profileEndpoint}/leaderboard/`);
  }
}
