# game/match_engine.py
import random
from typing import Dict, List, Tuple, Optional
from .models import (
    Player, Team, BowlingAttributes, BattingAttributes, 
    WicketKeepingAttributes, FieldingAttributes,
    PitchCondition, WeatherCondition, Match
)

class MatchEngine:
    """
    MatchEngine class to handle cricket match simulation.
    
    This class simulates matches between two teams based on their players' attributes,
    pitch conditions, and weather conditions.
    """
    
    IMPACT_FACTORS = {
        'bowling': {
            "0": 0.23, "1": 0.05, "2": -0.2, "3": -0.5, "4": -0.75, "6": -1,
            "W": 1.0, "Wide": -0.8, "No Ball": -1, "Bye": 0.0, "Leg Bye": 0.0
        },
        'batting': {
            "0": -0.238, "1": -0.0115, "2": 0.2, "3": 0.5, "4": 0.75, "6": 1.0,
            "W": -1.0, "Wide": 0, "No Ball": 0, "Bye": 0, "Leg Bye": 0
        },
        'pitch': {
            "0": 0.01, "1": -0.0109, "2": -0.05, "3": 0.0, "4": -0.05, "6": -0.1,
            "W": 0.2, "Wide": 0.1, "No Ball": 0.0, "Bye": 0.1, "Leg Bye": -0.01
        },
        'weather': {
            "0": 0.01, "1": -0.0109, "2": -0.05, "3": 0.0, "4": -0.05, "6": -0.1,
            "W": 0.2, "Wide": 0.1, "No Ball": 0.0, "Bye": 0.1, "Leg Bye": -0.01
        },
        'fielding': {
            "0": 0.01, "1": -0.0109, "2": 0.0, "3": 0.0, "4": -0.05, "6": -0.05,
            "W": 0.1, "Wide": 0.0, "No Ball": 0.0, "Bye": 0.0, "Leg Bye": 0.0
        },
        'wicketkeeping': {
            "0": 0.0, "1": 0.0, "2": 0.0, "3": 0.0, "4": -0.005, "6": 0.0,
            "W": 0.05, "Wide": -0.1, "No Ball": 0.0, "Bye": -0.1, "Leg Bye": -0.1
        }
    }
    
    DELIVERY_TYPES = {
        'OFF_SPIN': ['off_break', 'arm_ball', 'doosra', 'carrom_ball'],
        'LEG_SPIN': ['leg_break', 'googly', 'slider', 'flipper', 'top_spin'],
        'FAST': ['pace', 'swing', 'seam', 'bouncer', 'yorkers'],
        'MEDIUM': ['pace', 'swing', 'seam', 'yorkers']
    }
    
    def __init__(self, match: Match):
        self.match = match
        self.team1 = match.team1
        self.team2 = match.team2
        self.pitch_condition = match.pitch_condition
        self.weather_condition = match.weather_condition
    
    def get_playing_eleven(self, team: Team) -> List[Player]:
        """
        Get the playing eleven from the team.
        
        Returns the best 11 players based on first_eleven flag and overall_skill.
        """
        players = list(team.players.all())
        
        if not players:
            raise ValueError(f"Team {team.name} has no players")
        
        playing_eleven = [p for p in players if p.first_eleven]
        
        if len(playing_eleven) < 11:
            # Fill remaining slots with highest skilled players
            remaining_players = sorted(
                [p for p in players if not p.first_eleven],
                key=lambda p: p.overall_skill,
                reverse=True
            )[:11 - len(playing_eleven)]
            playing_eleven.extend(remaining_players)
        elif len(playing_eleven) > 11:
            # Keep only top 11 by skill
            playing_eleven = sorted(
                playing_eleven, 
                key=lambda p: p.overall_skill, 
                reverse=True
            )[:11]
        
        # Ensure we have at least some players
        if not playing_eleven and players:
            # Take top 11 or all available players
            playing_eleven = sorted(players, key=lambda p: p.overall_skill, reverse=True)[:11]
        
        if not playing_eleven:
            raise ValueError(f"Could not form playing eleven for team {team.name}")
            
        return playing_eleven
    
    def simulate_ball_outcome(self, bowler: Player, batsman: Player, 
                            wicketkeeper: Optional[Player] = None, 
                            fielding_avg: int = 50) -> str:
        """
        Simulate the outcome of a single ball.
        
        Args:
            bowler: The bowling player
            batsman: The batting player  
            wicketkeeper: The wicketkeeping player (optional)
            fielding_avg: Average fielding skill of the team
            
        Returns:
            String representing the outcome (e.g., "0", "4", "6", "W", etc.)
        """
        # Base probabilities from real cricket statistics
        base_weights = {
            "0": 35.9,
            "1": 36.9, 
            "2": 4.7,
            "3": 0.3,
            "4": 9.6,
            "6": 4.1,
            "W": 4.5,
            "Wide": 2.5,
            "No Ball": 0.5,
            "Bye": 0.25,
            "Leg Bye": 0.75
        }
        
        # Get player attributes - using try/except for safer access
        try:
            bowling_attr = bowler.bowling_attributes
        except:
            bowling_attr = None
            
        try:
            batting_attr = batsman.batting_attributes
        except:
            batting_attr = None
            
        try:
            wicketkeeping_attr = wicketkeeper.wicketkeeping_attributes if wicketkeeper else None
        except:
            wicketkeeping_attr = None
        
        if not bowling_attr or not batting_attr:
            # Fallback to random selection if attributes missing
            return random.choices(list(base_weights.keys()), weights=list(base_weights.values()))[0]
        
        # Adjust weights based on player skills and conditions
        adjusted_weights = self._adjust_outcome_weights(
            base_weights, bowling_attr, batting_attr, 
            wicketkeeping_attr, fielding_avg
        )
        
        # Select outcome
        outcome = random.choices(
            list(adjusted_weights.keys()),
            weights=list(adjusted_weights.values())
        )[0]
        
        # Handle byes and leg byes
        if outcome in ["Bye", "Leg Bye"]:
            runs = random.choices(["1", "2", "3", "4"], weights=[0.5, 0.3, 0.05, 0.15])[0]
            outcome = f"{outcome} {runs}"
        
        return outcome
    
    def _adjust_outcome_weights(self, weights: Dict[str, float], 
                              bowling: BowlingAttributes,
                              batting: BattingAttributes,
                              wicketkeeping: Optional[WicketKeepingAttributes],
                              fielding_avg: int) -> Dict[str, float]:
        """
        Adjust outcome probabilities based on player attributes and conditions.
        """
        adjusted_weights = weights.copy()
        
        # Determine bowler type and select delivery
        delivery_type, delivery_skill, batting_skill = self._select_delivery(bowling, batting)
        
        # Apply impact factors
        factors_and_skills = [
            (self.IMPACT_FACTORS['bowling'], delivery_skill),
            (self.IMPACT_FACTORS['batting'], batting_skill),
        ]
        
        if self.pitch_condition:
            pitch_help = self._get_pitch_help(delivery_type)
            factors_and_skills.append((self.IMPACT_FACTORS['pitch'], pitch_help))
        
        if self.weather_condition:
            weather_help = self._get_weather_help(delivery_type)
            factors_and_skills.append((self.IMPACT_FACTORS['weather'], weather_help))
        
        if wicketkeeping:
            factors_and_skills.append((self.IMPACT_FACTORS['wicketkeeping'], wicketkeeping.overall_skill))
        
        factors_and_skills.append((self.IMPACT_FACTORS['fielding'], fielding_avg))
        
        # Apply all factors
        for outcome in adjusted_weights:
            for impact_factors, skill in factors_and_skills:
                if outcome in impact_factors:
                    adjusted_weights[outcome] = self._calculate_new_probability(
                        skill, impact_factors[outcome], adjusted_weights[outcome]
                    )
        
        return adjusted_weights
    
    def _select_delivery(self, bowling: BowlingAttributes, batting: BattingAttributes) -> Tuple[str, int, int]:
        """
        Select delivery type based on bowler skills and batsman weaknesses.
        
        Returns:
            Tuple of (delivery_type, bowling_skill, batting_skill)
        """
        bowler_type = bowling.bowler_type
        deliveries = self.DELIVERY_TYPES.get(bowler_type, ['variation'])
        
        # Get skills for all possible deliveries
        delivery_options = []
        for delivery in deliveries:
            bowl_skill = getattr(bowling, delivery, 50) or 50
            bat_skill = getattr(batting, delivery, 50) or 50
            
            # Weight by bowler skill advantage over batsman
            weight = bowl_skill - bat_skill + 50  # Normalize to positive
            delivery_options.append((delivery, bowl_skill, bat_skill, max(1, weight)))
        
        # Select delivery based on weights
        deliveries, bowl_skills, bat_skills, weights = zip(*delivery_options)
        selected_idx = random.choices(range(len(deliveries)), weights=weights)[0]
        
        return bowler_type, bowl_skills[selected_idx], bat_skills[selected_idx]
    
    def _get_pitch_help(self, delivery_type: str) -> int:
        """Get pitch assistance for delivery type."""
        if not self.pitch_condition:
            return 50
            
        if delivery_type in ['OFF_SPIN', 'LEG_SPIN']:
            return self.pitch_condition.spin
        elif delivery_type == 'FAST':
            return (self.pitch_condition.seam + self.pitch_condition.swing) // 2
        else:
            return self.pitch_condition.seam
    
    def _get_weather_help(self, delivery_type: str) -> int:
        """Get weather assistance for delivery type."""
        if not self.weather_condition:
            return 50
            
        if delivery_type in ['OFF_SPIN', 'LEG_SPIN']:
            return self.weather_condition.spin
        else:
            return (self.weather_condition.swing + self.weather_condition.seam) // 2
    
    def _calculate_new_probability(self, skill: int, impact: float, weight: float) -> float:
        """
        Calculate adjusted probability based on skill and impact factor.
        
        Args:
            skill: Skill level (0-100, 50 is average)
            impact: Impact factor (-1 to 1)
            weight: Initial probability weight
            
        Returns:
            Adjusted probability weight
        """
        skill_factor = (skill - 50) / 50  # Normalize skill to -1 to 1
        adjustment = skill_factor * impact * weight
        return max(0.01, weight + adjustment)  # Ensure positive probability
    
    def simulate_over(self, bowler: Player, batsman: Player, 
                     wicketkeeper: Optional[Player] = None,
                     fielding_avg: int = 50) -> Dict:
        """
        Simulate a complete over (6 valid balls).
        
        Returns:
            Dictionary with over summary
        """
        balls = []
        runs = 0
        wickets = 0
        valid_balls = 0
        
        while valid_balls < 6:
            outcome = self.simulate_ball_outcome(bowler, batsman, wicketkeeper, fielding_avg)
            balls.append(outcome)
            
            # Count runs
            if outcome.isdigit():
                runs += int(outcome)
                valid_balls += 1
            elif outcome in ['Wide', 'No Ball']:
                runs += 1  # Penalty runs
                # Don't increment valid_balls for wides/no-balls
            elif outcome == 'W':
                wickets += 1
                valid_balls += 1
            elif outcome.startswith('Bye') or outcome.startswith('Leg Bye'):
                # Extract runs from bye/leg bye
                run_part = outcome.split()[-1]
                if run_part.isdigit():
                    runs += int(run_part)
                valid_balls += 1
        
        return {
            'balls': balls,
            'runs': runs,
            'wickets': wickets,
            'bowler': bowler.name,
            'batsman': batsman.name
        }
    
    def simulate_innings(self, batting_team: Team, bowling_team: Team, 
                        target_score: Optional[int] = None, 
                        max_overs: int = 20) -> Dict:
        """
        Simulate a complete innings.
        
        Args:
            batting_team: Team that's batting
            bowling_team: Team that's bowling
            target_score: Target score to chase (optional)
            max_overs: Maximum overs to bowl
            
        Returns:
            Dictionary with innings summary
        """
        try:
            batting_eleven = self.get_playing_eleven(batting_team)
            bowling_eleven = self.get_playing_eleven(bowling_team)
        except ValueError as e:
            raise ValueError(f"Cannot form teams: {e}")
        
        if not batting_eleven or not bowling_eleven:
            raise ValueError("Could not form complete teams")
        
        # Get wicketkeeper
        wicketkeeper = None
        for p in bowling_eleven:
            if p.wicketkeeping and p.wicketkeeping > 0:
                wicketkeeper = p
                break
        
        # Calculate average fielding - with safety check
        if bowling_eleven:
            fielding_scores = [p.fielding for p in bowling_eleven if p.fielding is not None]
            fielding_avg = sum(fielding_scores) // len(fielding_scores) if fielding_scores else 50
        else:
            fielding_avg = 50
        
        # Initialize innings
        total_runs = 0
        total_wickets = 0
        overs_bowled = 0
        current_batsman_idx = 0
        over_summaries = []
        
        # Get bowlers (players with bowling skills)
        bowlers = []
        for p in bowling_eleven:
            if p.bowling and p.bowling > 0:
                bowlers.append(p)
        
        # Fallback if no proper bowlers
        if not bowlers:
            bowlers = bowling_eleven[:6]  # Use first 6 players as bowlers
        
        if not bowlers:
            raise ValueError("No bowlers available for bowling team")
        
        while (overs_bowled < max_overs and 
               total_wickets < 10 and 
               current_batsman_idx < len(batting_eleven) and
               (target_score is None or total_runs < target_score)):
            
            # Select bowler (rotate every over)
            bowler = bowlers[overs_bowled % len(bowlers)]
            
            # Select current batsman
            if current_batsman_idx < len(batting_eleven):
                batsman = batting_eleven[current_batsman_idx]
            else:
                break  # No more batsmen
            
            # Simulate over
            over_summary = self.simulate_over(bowler, batsman, wicketkeeper, fielding_avg)
            over_summaries.append(over_summary)
            
            total_runs += over_summary['runs']
            total_wickets += over_summary['wickets']
            
            # Move to next batsman if wicket fell
            if over_summary['wickets'] > 0:
                current_batsman_idx += 1
            
            overs_bowled += 1
            
            # Check if target reached
            if target_score and total_runs >= target_score:
                break
        
        return {
            'total_runs': total_runs,
            'total_wickets': total_wickets,
            'overs_bowled': overs_bowled,
            'over_summaries': over_summaries,
            'batting_team': batting_team.name,
            'bowling_team': bowling_team.name
        }
    
    def simulate_match(self, max_overs: int = 20) -> Dict:
        """
        Simulate a complete match between two teams.
        
        Args:
            max_overs: Maximum overs per innings
            
        Returns:
            Dictionary with complete match summary
        """
        # Validate teams have players
        team1_players = list(self.team1.players.all())
        team2_players = list(self.team2.players.all())
        
        if not team1_players:
            raise ValueError(f"Team {self.team1.name} has no players")
        if not team2_players:
            raise ValueError(f"Team {self.team2.name} has no players")
        
        # Toss (randomly decide who bats first)
        first_batting = random.choice([self.team1, self.team2])
        second_batting = self.team2 if first_batting == self.team1 else self.team1
        
        # First innings
        first_innings = self.simulate_innings(first_batting, second_batting, max_overs=max_overs)
        target_score = first_innings['total_runs'] + 1
        
        # Second innings  
        second_innings = self.simulate_innings(
            second_batting, first_batting, 
            target_score=target_score, 
            max_overs=max_overs
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
        
        # Update match object
        self.match.status = 'COMPLETED'
        self.match.winner = winner
        
        if first_batting == self.team1:
            self.match.team1_score = first_innings['total_runs']
            self.match.team1_wickets = first_innings['total_wickets']
            self.match.team2_score = second_innings['total_runs']
            self.match.team2_wickets = second_innings['total_wickets']
        else:
            self.match.team1_score = second_innings['total_runs']
            self.match.team1_wickets = second_innings['total_wickets']
            self.match.team2_score = first_innings['total_runs']
            self.match.team2_wickets = first_innings['total_wickets']
        
        self.match.save()
        
        return {
            'match_id': self.match.id,
            'team1': self.team1.name,
            'team2': self.team2.name,
            'winner': winner.name,
            'margin': margin,
            'first_innings': first_innings,
            'second_innings': second_innings,
            'pitch_condition': self.pitch_condition.name if self.pitch_condition else None,
            'weather_condition': self.weather_condition.name if self.weather_condition else None
        }
