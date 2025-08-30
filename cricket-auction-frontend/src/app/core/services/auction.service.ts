import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Auction, Bid, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuctionService {
  private readonly endpoint = 'auctions';
  private readonly bidEndpoint = 'bids';

  constructor(private apiService: ApiService) {}

  getAuctions(): Observable<ApiResponse<Auction>> {
    return this.apiService.get<ApiResponse<Auction>>(`${this.endpoint}/`);
  }

  getAuction(id: number): Observable<Auction> {
    return this.apiService.get<Auction>(`${this.endpoint}/${id}/`);
  }

  createAuction(auction: Partial<Auction>): Observable<Auction> {
    return this.apiService.post<Auction>(`${this.endpoint}/`, auction);
  }

  addTeamToAuction(auctionId: number, teamId: number): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/${auctionId}/add_team/`, { team_id: teamId });
  }

  addPlayerToAuction(auctionId: number, playerId: number): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/${auctionId}/add_player/`, { player_id: playerId });
  }

  getCurrentBids(auctionId: number): Observable<Bid[]> {
    return this.apiService.get<Bid[]>(`${this.endpoint}/${auctionId}/current_bids/`);
  }

  getBids(): Observable<ApiResponse<Bid>> {
    return this.apiService.get<ApiResponse<Bid>>(`${this.bidEndpoint}/`);
  }

  placeBid(bid: Partial<Bid>): Observable<Bid> {
    return this.apiService.post<Bid>(`${this.bidEndpoint}/`, bid);
  }

  finalizeBid(bidId: number): Observable<any> {
    return this.apiService.post<any>(`${this.bidEndpoint}/${bidId}/finalize/`, {});
  }
}
