import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Match, MatchResult, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private readonly endpoint = 'matches';

  constructor(private apiService: ApiService) {}

  getMatches(): Observable<ApiResponse<Match>> {
    return this.apiService.get<ApiResponse<Match>>(`${this.endpoint}/`);
  }

  getMatch(id: number): Observable<Match> {
    return this.apiService.get<Match>(`${this.endpoint}/${id}/`);
  }

  createMatch(match: Partial<Match>): Observable<Match> {
    return this.apiService.post<Match>(`${this.endpoint}/`, match);
  }

  simulateMatch(id: number, maxOvers: number = 20): Observable<MatchResult> {
    return this.apiService.post<MatchResult>(`${this.endpoint}/${id}/simulate/`, { max_overs: maxOvers });
  }

  simulateBall(id: number, bowlerId: number, batsmanId: number, wicketkeeperId?: number): Observable<any> {
    const data: any = {
      bowler_id: bowlerId,
      batsman_id: batsmanId
    };
    if (wicketkeeperId) {
      data.wicketkeeper_id = wicketkeeperId;
    }
    return this.apiService.post<any>(`${this.endpoint}/${id}/simulate_ball/`, data);
  }
}
