export interface Team {
  id: number;
  name: string;
  budget: number;
  money_left: number;
  players_count: number;
  created_at: string;
  players?: Player[];
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

// Enhanced models for multi-tournament career system

export interface UserProfile {
  id: number;
  user: number;
  username?: string;
  current_rating: number;
  peak_rating: number;
  career_matches: number;
  career_runs: number;
  career_wickets: number;
  career_wins: number;
  career_losses: number;
  tournaments_played: number;
  tournaments_won: number;
  created_at: string;
}

export interface Tournament {
  id: number;
  name: string;
  description?: string;
  tournament_type: TournamentType;
  status: TournamentStatus;
  max_teams: number;
  current_teams: number;
  entry_fee: number;
  prize_pool: number;
  rating_factor: number;
  registration_start: string;
  registration_end: string;
  tournament_start: string;
  tournament_end?: string;
  created_at: string;
  updated_at: string;
  registrations?: TournamentRegistration[];
}

export interface TournamentRegistration {
  id: number;
  tournament: number;
  tournament_name?: string;
  user: number;
  username?: string;
  team: number;
  team_name?: string;
  registered_at: string;
  rating_at_registration: number;
}

export interface EnhancedMatch extends Match {
  tournament: number;
  tournament_name?: string;
  match_type: string;
  overs: number;
  team1_overs: number;
  team2_overs: number;
  team1_rating_change: number;
  team2_rating_change: number;
  innings?: Innings[];
  player_performances?: PlayerPerformance[];
}

export interface Innings {
  id: number;
  match: number;
  batting_team: number;
  batting_team_name?: string;
  bowling_team: number;
  bowling_team_name?: string;
  innings_type: 'FIRST' | 'SECOND';
  total_runs: number;
  wickets_lost: number;
  overs_bowled: number;
  extras: number;
  created_at: string;
  overs?: Over[];
}

export interface Over {
  id: number;
  innings: number;
  over_number: number;
  bowler: number;
  bowler_name?: string;
  runs_scored: number;
  wickets: number;
  balls?: Ball[];
}

export interface Ball {
  id: number;
  over: number;
  ball_number: number;
  bowler: number;
  bowler_name?: string;
  batsman: number;
  batsman_name?: string;
  outcome: BallOutcome;
  runs: number;
  is_wicket: boolean;
  dismissal_type?: DismissalType;
  fielder?: number;
  fielder_name?: string;
}

export interface PlayerPerformance {
  id: number;
  match: number;
  player: number;
  player_name?: string;
  team: number;
  team_name?: string;
  
  // Batting stats
  runs_scored: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  batting_position?: number;
  how_out?: string;
  
  // Bowling stats
  overs_bowled: number;
  runs_conceded: number;
  wickets_taken: number;
  maidens: number;
  
  // Fielding stats
  catches: number;
  stumpings: number;
  run_outs: number;
  
  // Performance ratings
  batting_rating: number;
  bowling_rating: number;
  fielding_rating: number;
  overall_rating: number;
}

export interface RatingHistory {
  id: number;
  user: number;
  username?: string;
  match?: number;
  match_description?: string;
  tournament?: number;
  tournament_name?: string;
  old_rating: number;
  new_rating: number;
  rating_change: number;
  reason: string;
  created_at: string;
}

export interface Achievement {
  id: number;
  user: number;
  username?: string;
  achievement_type: AchievementType;
  title: string;
  description: string;
  match?: number;
  tournament?: number;
  earned_at: string;
}

export interface CareerStats {
  rating: {
    current: number;
    peak: number;
  };
  matches: {
    played: number;
    won: number;
    lost: number;
    win_percentage: number;
  };
  tournaments: {
    played: number;
    won: number;
  };
  batting: {
    average: number;
    strike_rate: number;
    total_runs: number;
  };
  bowling: {
    average: number;
    total_wickets: number;
  };
}

export interface Scorecard {
  match: EnhancedMatch;
  innings: Innings[];
  player_performances: PlayerPerformance[];
  rating_changes: {
    [userId: number]: {
      old: number;
      new: number;
    };
  };
}

// Enhanced types
export type TournamentType = 'LEAGUE' | 'KNOCKOUT' | 'ROUND_ROBIN' | 'HYBRID';
export type TournamentStatus = 'REGISTRATION' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type BallOutcome = '0' | '1' | '2' | '3' | '4' | '6' | 'W' | 'WD' | 'NB' | 'B' | 'LB';

export type DismissalType = 'BOWLED' | 'CAUGHT' | 'LBW' | 'STUMPED' | 'RUN_OUT' | 'HIT_WICKET';

export type AchievementType = 
  | 'CENTURY' 
  | 'FIVE_WICKETS' 
  | 'HAT_TRICK' 
  | 'TOURNAMENT_WIN' 
  | 'RATING_MILESTONE' 
  | 'MATCH_WIN';

// Chart data interfaces for analytics
export interface RatingChartData {
  labels: string[];
  datasets: [{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }];
}

export interface PerformanceChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

export interface BattingAnalytics {
  runs_per_match: number;
  balls_per_match: number;
  strike_rate: number;
  average: number;
  boundaries_percentage: number;
  dismissal_analysis: {
    [key: string]: number;
  };
}

export interface BowlingAnalytics {
  wickets_per_match: number;
  economy_rate: number;
  average: number;
  strike_rate: number;
  maiden_percentage: number;
}

// Updated Team interface to include owner
export interface EnhancedTeam extends Team {
  owner?: number;
  owner_name?: string;
  tournament?: number;
  tournament_name?: string;
}
