# enhanced_match_engine.py - Enhanced match simulation with detailed ball-by-ball tracking

import random
from typing import Dict, List, Tuple, Optional
from decimal import Decimal
from .models import (
    Player, Team, BowlingAttributes, BattingAttributes, 
    WicketKeepingAttributes, FieldingAttributes,
    PitchCondition, WeatherCondition, Match, Tournament,
    Innings, Over, Ball, PlayerPerformance
)
from .rating_system import RatingSystem, AchievementSystem

class EnhancedMatchEngine:
    """
    Enhanced match engine with detailed ball-by-ball tracking,
    player statistics, and performance analysis.
    """
    
    IMPACT_FACTORS = {
        'bowling': {
            "0": 0.23, "1": 0.05, "2": -0.2, "3": -0.5, "4": -0.75, "6": -1,
            "W": 1.0, "WD": -0.8, "NB": -1, "B": 0.0, "LB": 0.0
        },
        'batting': {
            "0": -0.238, "1": -0.0115, "2": 0.2, "3": 0.5, "4": 0.75, "6": 1.0,
            "W": -1.0, "WD": 0, "NB": 0, "B": 0, "LB": 0
        },
        'pitch': {
            "0": 0.01, "1": -0.0109, "2": -0.05, "3": 0.0, "4": -0.05, "6": -0.1,
            "W": 0.2, "WD": 0.1, "NB": 0.0, "B": 0.1, "LB": -0.01
        },
        'weather': {
            "0": 0.01, "1": -0.0109, "2": -0.05, "3": 0.0, "4": -0.05, "6": -0.1,
            "W": 0.2, "WD": 0.1, "NB": 0.0, "B": 0.1, "LB": -0.01
        },
        'fielding': {
            "0": 0.01, "1": -0.0109, "2": 0.0, "3": 0.0, "4": -0.05, "6": -0.05,
            "W": 0.1, "WD": 0.0, "NB": 0.0, "B": 0.0, "LB": 0.0
        },
        'wicketkeeping': {
            "0": 0.0, "1": 0.0, "2": 0.0, "3": 0.0, "4": -0.005, "6": 0.0,
            "W": 0.05, "WD": -0.1, "NB": 0.0, "B": -0.1, "LB": -0.1
        }
    }
    
    DISMISSAL_WEIGHTS = {
        'BOWLED': 0.25,
        'CAUGHT': 0.35,
        'LBW': 0.20,
        'STUMPED': 0.05,
        'RUN_OUT': 0.10,
        'HIT_WICKET': 0.05
    }

    def __init__(self, match: Match):
        self.match = match
        self.team1 = match.team1
        self.team2 = match.team2
        self.pitch_condition = match.pitch_condition
        self.weather_condition = match.weather_condition
        self.tournament = match.tournament
        
        # Initialize player performances
        self.player_stats = {}
        self._initialize_player_stats()
    
    def _initialize_player_stats(self):
        """Initialize performance tracking for all players"""
        for team in [self.team1, self.team2]:
            players = self.get_playing_eleven(team)
            for player in players:
                self.player_stats[player.id] = {
                    'player': player,
                    'team': team,
                    'runs_scored': 0,
                    'balls_faced': 0,
                    'fours': 0,
                    'sixes': 0,
                    'overs_bowled': 0,
                    'runs_conceded': 0,
                    'wickets_taken': 0,
                    'maidens': 0,
                    'catches': 0,
                    'stumpings': 0,
                    'run_outs': 0,
                    'how_out': '',
                    'batting_position': None
                }

    def get_playing_eleven(self, team: Team) -> List[Player]:
        """Get the playing eleven from the team"""
        players = list(team.players.all())
        
        if not players:
            raise ValueError(f"Team {team.name} has no players")
        
        playing_eleven = [p for p in players if p.first_eleven]
        
        if len(playing_eleven) < 11:
            remaining_players = sorted(
                [p for p in players if not p.first_eleven],
                key=lambda p: p.overall_skill,
                reverse=True
            )[:11 - len(playing_eleven)]
            playing_eleven.extend(remaining_players)
        elif len(playing_eleven) > 11:
            playing_eleven = sorted(
                playing_eleven, 
                key=lambda p: p.overall_skill, 
                reverse=True
            )[:11]
        
        if not playing_eleven and players:
            playing_eleven = sorted(players, key=lambda p: p.overall_skill, reverse=True)[:11]
        
        if not playing_eleven:
            raise ValueError(f"Could not form playing eleven for team {team.name}")
            
        return playing_eleven

    def simulate_ball(self, bowler: Player, batsman: Player, over_obj: Over, 
                     ball_number: int, wicketkeeper: Optional[Player] = None, 
                     fielding_avg: int = 50) -> Tuple[str, int, bool, Dict]:
        """Simulate a single ball and return detailed information"""
        
        # Get base outcome using existing logic
        outcome = self.simulate_ball_outcome(bowler, batsman, wicketkeeper, fielding_avg)
        
        runs = 0
        is_wicket = False
        dismissal_type = None
        fielder = None
        extras = {}
        
        # Process outcome
        if outcome.isdigit():
            runs = int(outcome)
        elif outcome == "4":
            runs = 4
            self.player_stats[batsman.id]['fours'] += 1
        elif outcome == "6":
            runs = 6
            self.player_stats[batsman.id]['sixes'] += 1
        elif outcome == "W":
            is_wicket = True
            dismissal_type = self._determine_dismissal_type(bowler, batsman, wicketkeeper)
            if dismissal_type in ['CAUGHT', 'STUMPED']:
                fielder = self._select_fielder(dismissal_type, wicketkeeper, over_obj.innings.bowling_team)
        elif outcome == "WD":
            runs = 1
            extras['wides'] = 1
        elif outcome == "NB":
            runs = 1
            extras['no_balls'] = 1
        elif outcome.startswith("B"):
            runs = int(outcome.split()[-1]) if " " in outcome else 1
            extras['byes'] = runs
        elif outcome.startswith("LB"):
            runs = int(outcome.split()[-1]) if " " in outcome else 1
            extras['leg_byes'] = runs

        # Update player statistics
        self._update_ball_stats(bowler, batsman, runs, is_wicket, outcome, extras)
        
        # Create ball record
        ball_obj = Ball.objects.create(
            over=over_obj,
            ball_number=ball_number,
            bowler=bowler,
            batsman=batsman,
            outcome=outcome,
            runs=runs,
            is_wicket=is_wicket,
            dismissal_type=dismissal_type,
            fielder=fielder
        )
        
        return outcome, runs, is_wicket, {
            'dismissal_type': dismissal_type,
            'fielder': fielder.name if fielder else None,
            'extras': extras
        }

    def _determine_dismissal_type(self, bowler: Player, batsman: Player, 
                                 wicketkeeper: Optional[Player]) -> str:
        """Determine how the batsman was dismissed"""
        weights = list(self.DISMISSAL_WEIGHTS.values())
        dismissal_types = list(self.DISMISSAL_WEIGHTS.keys())
        
        # Adjust weights based on bowler/keeper skills
        if wicketkeeper and wicketkeeper.wicketkeeping > 70:
            # Good keeper increases stumping chance
            stumped_idx = dismissal_types.index('STUMPED')
            weights[stumped_idx] *= 1.5
        
        if bowler.bowling and bowler.bowling > 80:
            # Good bowler increases bowled chance
            bowled_idx = dismissal_types.index('BOWLED')
            weights[bowled_idx] *= 1.3
        
        return random.choices(dismissal_types, weights=weights)[0]

    def _select_fielder(self, dismissal_type: str, wicketkeeper: Optional[Player], 
                       fielding_team: Team) -> Optional[Player]:
        """Select the fielder involved in the dismissal"""
        if dismissal_type == 'STUMPED':
            return wicketkeeper
        elif dismissal_type == 'CAUGHT':
            # Random fielder from the team
            fielders = self.get_playing_eleven(fielding_team)
            return random.choice(fielders)
        return None

    def _update_ball_stats(self, bowler: Player, batsman: Player, runs: int, 
                          is_wicket: bool, outcome: str, extras: Dict):
        """Update player statistics for this ball"""
        
        # Batsman stats (only for legal deliveries)
        if outcome not in ['WD', 'NB']:
            self.player_stats[batsman.id]['balls_faced'] += 1
            self.player_stats[batsman.id]['runs_scored'] += runs - sum(extras.get(k, 0) for k in ['byes', 'leg_byes'])
        
        # Bowler stats
        bowler_stats = self.player_stats[bowler.id]
        if outcome not in ['WD', 'NB']:
            # Legal delivery
            if bowler_stats['overs_bowled'] % 1 == 0.8:  # 5 balls bowled, this is 6th
                bowler_stats['overs_bowled'] = int(bowler_stats['overs_bowled']) + 1
            else:
                bowler_stats['overs_bowled'] += 0.1
        
        bowler_stats['runs_conceded'] += runs
        
        if is_wicket:
            bowler_stats['wickets_taken'] += 1
            self.player_stats[batsman.id]['how_out'] = f"{outcome} ({bowler.name})"
        
        # Check for maiden over (simplified)
        if runs == 0 and outcome not in ['WD', 'NB']:
            # This would need more complex logic to track full overs
            pass

    def simulate_over(self, bowler: Player, batsman: Player, innings_obj: Innings,
                     over_number: int, wicketkeeper: Optional[Player] = None,
                     fielding_avg: int = 50) -> Dict:
        """Simulate a complete over with detailed tracking"""
        
        over_obj = Over.objects.create(
            innings=innings_obj,
            over_number=over_number,
            bowler=bowler
        )
        
        balls = []
        total_runs = 0
        wickets = 0
        valid_balls = 0
        current_batsman = batsman
        
        while valid_balls < 6:
            ball_number = len(balls) + 1
            outcome, runs, is_wicket, details = self.simulate_ball(
                bowler, current_batsman, over_obj, ball_number, wicketkeeper, fielding_avg
            )
            
            balls.append({
                'outcome': outcome,
                'runs': runs,
                'is_wicket': is_wicket,
                'batsman': current_batsman.name,
                'details': details
            })
            
            total_runs += runs
            
            if outcome not in ['WD', 'NB']:
                valid_balls += 1
            
            if is_wicket:
                wickets += 1
                # In a real game, next batsman would come in
                # For simulation, we'll continue with same batsman
                break
        
        # Update over object
        over_obj.runs_scored = total_runs
        over_obj.wickets = wickets
        over_obj.save()
        
        return {
            'over_number': over_number,
            'bowler': bowler.name,
            'balls': balls,
            'runs': total_runs,
            'wickets': wickets
        }

    def simulate_innings(self, batting_team: Team, bowling_team: Team, 
                        innings_type: str, target_score: Optional[int] = None, 
                        max_overs: int = 20) -> Dict:
        """Simulate a complete innings with detailed tracking"""
        
        # Create innings object
        innings_obj = Innings.objects.create(
            match=self.match,
            batting_team=batting_team,
            bowling_team=bowling_team,
            innings_type=innings_type
        )
        
        batting_eleven = self.get_playing_eleven(batting_team)
        bowling_eleven = self.get_playing_eleven(bowling_team)
        
        # Set batting positions
        for i, player in enumerate(batting_eleven[:11]):
            self.player_stats[player.id]['batting_position'] = i + 1
        
        # Get wicketkeeper
        wicketkeeper = None
        for p in bowling_eleven:
            if p.wicketkeeping and p.wicketkeeping > 0:
                wicketkeeper = p
                break
        
        # Get bowlers
        bowlers = [p for p in bowling_eleven if p.bowling and p.bowling > 0]
        if not bowlers:
            bowlers = bowling_eleven[:6]
        
        # Calculate fielding average
        fielding_scores = [p.fielding for p in bowling_eleven if p.fielding is not None]
        fielding_avg = sum(fielding_scores) // len(fielding_scores) if fielding_scores else 50
        
        # Initialize innings tracking
        total_runs = 0
        total_wickets = 0
        overs_bowled = 0
        current_batsman_idx = 0
        over_summaries = []
        
        while (overs_bowled < max_overs and 
               total_wickets < 10 and 
               current_batsman_idx < len(batting_eleven) and
               (target_score is None or total_runs < target_score)):
            
            # Select bowler (rotate)
            bowler = bowlers[overs_bowled % len(bowlers)]
            
            # Current batsman
            if current_batsman_idx < len(batting_eleven):
                batsman = batting_eleven[current_batsman_idx]
            else:
                break
            
            # Simulate over
            over_summary = self.simulate_over(
                bowler, batsman, innings_obj, overs_bowled + 1, 
                wicketkeeper, fielding_avg
            )
            over_summaries.append(over_summary)
            
            total_runs += over_summary['runs']
            total_wickets += over_summary['wickets']
            
            if over_summary['wickets'] > 0:
                current_batsman_idx += 1
            
            overs_bowled += 1
            
            if target_score and total_runs >= target_score:
                break
        
        # Update innings object
        innings_obj.total_runs = total_runs
        innings_obj.wickets_lost = total_wickets
        innings_obj.overs_bowled = Decimal(str(overs_bowled))
        innings_obj.save()
        
        return {
            'innings_obj': innings_obj,
            'total_runs': total_runs,
            'total_wickets': total_wickets,
            'overs_bowled': overs_bowled,
            'over_summaries': over_summaries,
            'batting_team': batting_team.name,
            'bowling_team': bowling_team.name
        }

    def simulate_ball_outcome(self, bowler: Player, batsman: Player, 
                            wicketkeeper: Optional[Player] = None, 
                            fielding_avg: int = 50) -> str:
        """Original ball outcome simulation (simplified for this example)"""
        base_weights = {
            "0": 35.9, "1": 36.9, "2": 4.7, "3": 0.3, "4": 9.6, "6": 4.1,
            "W": 4.5, "WD": 2.5, "NB": 0.5, "B": 0.25, "LB": 0.75
        }
        
        return random.choices(list(base_weights.keys()), weights=list(base_weights.values()))[0]

    def create_player_performances(self):
        """Create PlayerPerformance records for all players"""
        for player_id, stats in self.player_stats.items():
            if stats['balls_faced'] > 0 or stats['overs_bowled'] > 0 or stats['catches'] > 0:
                PlayerPerformance.objects.create(
                    match=self.match,
                    player=stats['player'],
                    team=stats['team'],
                    runs_scored=stats['runs_scored'],
                    balls_faced=stats['balls_faced'],
                    fours=stats['fours'],
                    sixes=stats['sixes'],
                    batting_position=stats['batting_position'],
                    how_out=stats['how_out'],
                    overs_bowled=Decimal(str(stats['overs_bowled'])),
                    runs_conceded=stats['runs_conceded'],
                    wickets_taken=stats['wickets_taken'],
                    maidens=stats['maidens'],
                    catches=stats['catches'],
                    stumpings=stats['stumpings'],
                    run_outs=stats['run_outs']
                )

    def simulate_match(self, max_overs: int = 20) -> Dict:
        """Simulate a complete match with detailed statistics"""
        
        # Toss
        first_batting = random.choice([self.team1, self.team2])
        second_batting = self.team2 if first_batting == self.team1 else self.team1
        
        # First innings
        first_innings = self.simulate_innings(
            first_batting, second_batting, 'FIRST', max_overs=max_overs
        )
        target_score = first_innings['total_runs'] + 1
        
        # Second innings
        second_innings = self.simulate_innings(
            second_batting, first_batting, 'SECOND', 
            target_score=target_score, max_overs=max_overs
        )
        
        # Determine winner
        winner = None
        margin = ""
        
        if second_innings['total_runs'] >= target_score:
            winner = second_batting
            wickets_left = 10 - second_innings['total_wickets']
            margin = f"by {wickets_left} wickets"
        else:
            winner = first_batting
            runs_margin = first_innings['total_runs'] - second_innings['total_runs']
            margin = f"by {runs_margin} runs"
        
        # Update match
        self.match.status = 'COMPLETED'
        self.match.winner = winner
        
        if first_batting == self.team1:
            self.match.team1_score = first_innings['total_runs']
            self.match.team1_wickets = first_innings['total_wickets']
            self.match.team1_overs = Decimal(str(first_innings['overs_bowled']))
            self.match.team2_score = second_innings['total_runs']
            self.match.team2_wickets = second_innings['total_wickets']
            self.match.team2_overs = Decimal(str(second_innings['overs_bowled']))
        else:
            self.match.team1_score = second_innings['total_runs']
            self.match.team1_wickets = second_innings['total_wickets']
            self.match.team1_overs = Decimal(str(second_innings['overs_bowled']))
            self.match.team2_score = first_innings['total_runs']
            self.match.team2_wickets = first_innings['total_wickets']
            self.match.team2_overs = Decimal(str(first_innings['overs_bowled']))
        
        self.match.save()
        
        # Create player performance records
        self.create_player_performances()
        
        # Update ratings
        rating_changes = RatingSystem.update_ratings_after_match(self.match)
        
        # Check achievements
        AchievementSystem.check_match_achievements(self.match)
        
        for user_id, (old_rating, new_rating) in rating_changes.items():
            from django.contrib.auth.models import User
            user = User.objects.get(id=user_id)
            AchievementSystem.check_rating_achievements(user, old_rating, new_rating)
        
        return {
            'match_id': self.match.id,
            'team1': self.team1.name,
            'team2': self.team2.name,
            'winner': winner.name,
            'margin': margin,
            'first_innings': first_innings,
            'second_innings': second_innings,
            'pitch_condition': self.pitch_condition.name if self.pitch_condition else None,
            'weather_condition': self.weather_condition.name if self.weather_condition else None,
            'rating_changes': {
                user_id: {'old': float(old), 'new': float(new)} 
                for user_id, (old, new) in rating_changes.items()
            },
            'player_performances': list(self.player_stats.values())
        }
