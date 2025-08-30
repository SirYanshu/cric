export interface Team {
  id: number;
  name: string;
  budget: number;
  money_left: number;
  players_count: number;
  created_at: string;
  players?: Player[];
  owner?: string;
}

export interface Player {
  id: number;
  name: string;
  player_type: PlayerType;
  batting_hand: BattingHand;
  bowling_style?: BowlingStyle;
  overall_skill: number;
  batting: number;
  bowling?: number;
  fielding: number;
  wicketkeeping?: number;
  fitness: number;
  bio?: string;
  team?: number;
  team_name?: string;
  first_eleven: boolean;
  base_price: number;
  sold_price?: number;
  bowling_attributes?: BowlingAttributes;
  batting_attributes?: BattingAttributes;
  wicketkeeping_attributes?: WicketKeepingAttributes;
  fielding_attributes?: FieldingAttributes;
  created_at: string;
}

export interface BowlingAttributes {
  id: number;
  player_id: number;
  bowler_type: BowlerType;
  off_break?: number;
  arm_ball?: number;
  doosra?: number;
  carrom_ball?: number;
  leg_break?: number;
  googly?: number;
  slider?: number;
  flipper?: number;
  top_spin?: number;
  pace?: number;
  swing?: number;
  seam?: number;
  bouncer?: number;
  yorkers?: number;
  variation?: number;
  control?: number;
}

export interface BattingAttributes {
  id: number;
  player_id: number;
  off_break: number;
  arm_ball: number;
  doosra: number;
  carrom_ball: number;
  leg_break: number;
  googly: number;
  slider: number;
  flipper: number;
  top_spin: number;
  pace: number;
  swing: number;
  seam: number;
  bouncer: number;
  yorkers: number;
  power_hitting: number;
  technique: number;
  footwork: number;
  shot_selection: number;
}

export interface WicketKeepingAttributes {
  id: number;
  player_id: number;
  overall_skill: number;
  catching?: number;
  stumping?: number;
  reflexes?: number;
  positioning?: number;
  communication?: number;
}

export interface FieldingAttributes {
  id: number;
  player_id: number;
  catching: number;
  ground_fielding: number;
  throwing_accuracy: number;
  throwing_distance: number;
}

export interface Match {
  id: number;
  team1: number;
  team1_name: string;
  team2: number;
  team2_name: string;
  pitch_condition?: number;
  pitch_condition_name?: string;
  weather_condition?: number;
  weather_condition_name?: string;
  status: MatchStatus;
  winner?: number;
  winner_name?: string;
  team1_score: number;
  team2_score: number;
  team1_wickets: number;
  team2_wickets: number;
  created_at: string;
  updated_at: string;
}

export interface MatchResult {
  match_id: number;
  team1: string;
  team2: string;
  winner: string;
  margin: string;
  first_innings: InningsResult;
  second_innings: InningsResult;
  pitch_condition?: string;
  weather_condition?: string;
}

export interface InningsResult {
  total_runs: number;
  total_wickets: number;
  overs_bowled: number;
  over_summaries: OverSummary[];
  batting_team: string;
  bowling_team: string;
}

export interface OverSummary {
  balls: string[];
  runs: number;
  wickets: number;
  bowler: string;
  batsman: string;
}

export interface Auction {
  id: number;
  name: string;
  status: AuctionStatus;
  start_time: string;
  end_time?: string;
  participating_teams_count: number;
  players_pool_count: number;
  created_at: string;
}

export interface Bid {
  id: number;
  auction: number;
  auction_name: string;
  player: number;
  player_name: string;
  team: number;
  team_name: string;
  amount: number;
  status: BidStatus;
  created_at: string;
}

export interface PitchCondition {
  id: number;
  name: string;
  condition: PitchType;
  spin: number;
  seam: number;
  swing: number;
  reverse_swing: number;
  boundary_size: number;
}

export interface WeatherCondition {
  id: number;
  name: string;
  condition: WeatherType;
  spin: number;
  swing: number;
  seam: number;
  humidity: number;
}

export type PlayerType = 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER' | 'WICKET_KEEPER_BATSMAN';
export type BattingHand = 'RIGHT' | 'LEFT';
export type BowlingStyle = 'RIGHT_ARM_OFF_SPIN' | 'LEFT_ARM_OFF_SPIN' | 'RIGHT_ARM_LEG_SPIN' | 'LEFT_ARM_LEG_SPIN' | 'RIGHT_ARM_FAST' | 'LEFT_ARM_FAST' | 'RIGHT_ARM_MEDIUM' | 'LEFT_ARM_MEDIUM';
export type BowlerType = 'OFF_SPIN' | 'LEG_SPIN' | 'FAST' | 'MEDIUM';
export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type AuctionStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type BidStatus = 'ACTIVE' | 'OUTBID' | 'WON' | 'WITHDRAWN';
export type PitchType = 'DRY' | 'GREEN' | 'DUSTY' | 'FLAT' | 'BOUNCY';
export type WeatherType = 'SUNNY' | 'OVERCAST' | 'RAINY' | 'HUMID' | 'WINDY';

export interface ApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}
