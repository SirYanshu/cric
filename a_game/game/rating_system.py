# rating_system.py - ELO-based rating system for cricket tournaments

import math
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Tuple
from django.contrib.auth.models import User
from .models import UserProfile, Match, Tournament, RatingHistory, PlayerPerformance

class RatingSystem:
    """
    ELO-based rating system adapted for cricket tournaments.
    Factors in individual performance, team performance, and tournament importance.
    """
    
    BASE_K_FACTOR = 32  # Standard ELO K-factor
    PERFORMANCE_WEIGHT = 0.3  # How much individual performance affects rating
    TEAM_WEIGHT = 0.7  # How much team result affects rating
    
    @classmethod
    def calculate_expected_score(cls, rating_a: float, rating_b: float) -> float:
        """Calculate expected score using ELO formula"""
        return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))
    
    @classmethod
    def calculate_performance_score(cls, performance: PlayerPerformance) -> float:
        """
        Calculate individual performance score (0-1) based on match statistics.
        Higher score = better performance.
        """
        batting_score = 0
        bowling_score = 0
        fielding_score = 0
        
        # Batting performance (0-1 scale)
        if performance.balls_faced > 0:
            strike_rate = (performance.runs_scored / performance.balls_faced) * 100
            runs_contribution = min(performance.runs_scored / 100, 1.0)  # Cap at 100 runs
            batting_score = (runs_contribution * 0.6) + (min(strike_rate / 150, 1.0) * 0.4)
        
        # Bowling performance (0-1 scale)
        if performance.overs_bowled > 0:
            economy = performance.runs_conceded / float(performance.overs_bowled)
            wicket_contribution = min(performance.wickets_taken / 5, 1.0)  # Cap at 5 wickets
            economy_score = max(0, 1 - (economy / 10))  # Better economy = higher score
            bowling_score = (wicket_contribution * 0.6) + (economy_score * 0.4)
        
        # Fielding performance (0-1 scale)
        total_fielding = performance.catches + performance.stumpings + performance.run_outs
        fielding_score = min(total_fielding / 3, 1.0)  # Cap at 3 fielding contributions
        
        # Weight the scores based on player involvement
        total_score = 0
        weights = 0
        
        if performance.balls_faced > 0:
            total_score += batting_score * 0.5
            weights += 0.5
        
        if performance.overs_bowled > 0:
            total_score += bowling_score * 0.4
            weights += 0.4
        
        if total_fielding > 0:
            total_score += fielding_score * 0.1
            weights += 0.1
        
        return total_score / weights if weights > 0 else 0.5
    
    @classmethod
    def update_ratings_after_match(cls, match: Match) -> Dict[int, Tuple[Decimal, Decimal]]:
        """
        Update user ratings after a match.
        Returns dict of user_id -> (old_rating, new_rating)
        """
        if match.status != 'COMPLETED' or not match.winner:
            return {}
        
        tournament = match.tournament
        k_factor = cls.BASE_K_FACTOR * float(tournament.rating_factor)
        
        # Get team owners and their ratings
        team1_user = match.team1.owner
        team2_user = match.team2.owner
        
        team1_profile = team1_user.cricket_profile
        team2_profile = team2_user.cricket_profile
        
        team1_old_rating = float(team1_profile.current_rating)
        team2_old_rating = float(team2_profile.current_rating)
        
        # Calculate expected scores
        team1_expected = cls.calculate_expected_score(team1_old_rating, team2_old_rating)
        team2_expected = 1 - team1_expected
        
        # Determine actual scores (1 for win, 0 for loss)
        team1_actual = 1.0 if match.winner == match.team1 else 0.0
        team2_actual = 1.0 - team1_actual
        
        # Get individual performances
        team1_performances = match.player_performances.filter(team=match.team1)
        team2_performances = match.player_performances.filter(team=match.team2)
        
        # Calculate average performance scores
        team1_perf_avg = sum(cls.calculate_performance_score(p) for p in team1_performances) / len(team1_performances) if team1_performances else 0.5
        team2_perf_avg = sum(cls.calculate_performance_score(p) for p in team2_performances) / len(team2_performances) if team2_performances else 0.5
        
        # Combine team result and individual performance
        team1_combined_score = (cls.TEAM_WEIGHT * team1_actual) + (cls.PERFORMANCE_WEIGHT * team1_perf_avg)
        team2_combined_score = (cls.TEAM_WEIGHT * team2_actual) + (cls.PERFORMANCE_WEIGHT * team2_perf_avg)
        
        # Calculate rating changes
        team1_rating_change = k_factor * (team1_combined_score - team1_expected)
        team2_rating_change = k_factor * (team2_combined_score - team2_expected)
        
        team1_new_rating = Decimal(str(team1_old_rating + team1_rating_change)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        team2_new_rating = Decimal(str(team2_old_rating + team2_rating_change)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        # Update profiles
        team1_profile.current_rating = team1_new_rating
        team2_profile.current_rating = team2_new_rating
        
        # Update peak ratings if needed
        if team1_new_rating > team1_profile.peak_rating:
            team1_profile.peak_rating = team1_new_rating
        if team2_new_rating > team2_profile.peak_rating:
            team2_profile.peak_rating = team2_new_rating
        
        # Update career stats
        team1_profile.career_matches += 1
        team2_profile.career_matches += 1
        
        if match.winner == match.team1:
            team1_profile.career_wins += 1
            team2_profile.career_losses += 1
        else:
            team1_profile.career_losses += 1
            team2_profile.career_wins += 1
        
        team1_profile.save()
        team2_profile.save()
        
        # Create rating history records
        RatingHistory.objects.create(
            user=team1_user,
            match=match,
            tournament=tournament,
            old_rating=Decimal(str(team1_old_rating)),
            new_rating=team1_new_rating,
            rating_change=Decimal(str(team1_rating_change)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            reason=f"{'Won' if match.winner == match.team1 else 'Lost'} vs {match.team2.name}"
        )
        
        RatingHistory.objects.create(
            user=team2_user,
            match=match,
            tournament=tournament,
            old_rating=Decimal(str(team2_old_rating)),
            new_rating=team2_new_rating,
            rating_change=Decimal(str(team2_rating_change)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            reason=f"{'Won' if match.winner == match.team2 else 'Lost'} vs {match.team1.name}"
        )
        
        # Update match with rating changes
        match.team1_rating_change = Decimal(str(team1_rating_change)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        match.team2_rating_change = Decimal(str(team2_rating_change)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        match.save()
        
        return {
            team1_user.id: (Decimal(str(team1_old_rating)), team1_new_rating),
            team2_user.id: (Decimal(str(team2_old_rating)), team2_new_rating)
        }

class AchievementSystem:
    """System for tracking and awarding achievements"""
    
    @classmethod
    def check_match_achievements(cls, match: Match):
        """Check for achievements after a match"""
        from .models import Achievement
        
        for performance in match.player_performances.all():
            user = performance.team.owner
            
            # Century achievement
            if performance.runs_scored >= 100:
                Achievement.objects.get_or_create(
                    user=user,
                    achievement_type='CENTURY',
                    match=match,
                    defaults={
                        'title': f'Century - {performance.runs_scored} runs',
                        'description': f'Scored {performance.runs_scored} runs in {match.team1.name} vs {match.team2.name}',
                        'tournament': match.tournament
                    }
                )
            
            # Five wickets achievement
            if performance.wickets_taken >= 5:
                Achievement.objects.get_or_create(
                    user=user,
                    achievement_type='FIVE_WICKETS',
                    match=match,
                    defaults={
                        'title': f'Five-wicket haul - {performance.wickets_taken} wickets',
                        'description': f'Took {performance.wickets_taken} wickets in {match.team1.name} vs {match.team2.name}',
                        'tournament': match.tournament
                    }
                )
            
            # Check for hat-trick (would need ball-by-ball data)
            # This is simplified - in reality you'd check consecutive wickets
            if performance.wickets_taken >= 3:
                # Placeholder for hat-trick logic
                pass
    
    @classmethod
    def check_rating_achievements(cls, user: User, old_rating: Decimal, new_rating: Decimal):
        """Check for rating milestone achievements"""
        from .models import Achievement
        
        milestones = [1200, 1400, 1600, 1800, 2000, 2200]
        
        for milestone in milestones:
            if old_rating < milestone <= new_rating:
                Achievement.objects.get_or_create(
                    user=user,
                    achievement_type='RATING_MILESTONE',
                    defaults={
                        'title': f'Rating Milestone: {milestone}',
                        'description': f'Reached a rating of {milestone} points'
                    }
                )

class StatisticsCalculator:
    """Calculate various cricket statistics"""
    
    @classmethod
    def calculate_batting_average(cls, user: User) -> float:
        """Calculate career batting average"""
        performances = PlayerPerformance.objects.filter(team__owner=user, runs_scored__gt=0)
        if not performances.exists():
            return 0.0
        
        total_runs = sum(p.runs_scored for p in performances)
        dismissals = sum(1 for p in performances if p.how_out and p.how_out != 'not out')
        
        return total_runs / dismissals if dismissals > 0 else float(total_runs)
    
    @classmethod
    def calculate_bowling_average(cls, user: User) -> float:
        """Calculate career bowling average"""
        performances = PlayerPerformance.objects.filter(team__owner=user, wickets_taken__gt=0)
        if not performances.exists():
            return 0.0
        
        total_runs = sum(p.runs_conceded for p in performances)
        total_wickets = sum(p.wickets_taken for p in performances)
        
        return total_runs / total_wickets if total_wickets > 0 else 0.0
    
    @classmethod
    def calculate_strike_rate(cls, user: User) -> float:
        """Calculate career strike rate"""
        performances = PlayerPerformance.objects.filter(team__owner=user, balls_faced__gt=0)
        if not performances.exists():
            return 0.0
        
        total_runs = sum(p.runs_scored for p in performances)
        total_balls = sum(p.balls_faced for p in performances)
        
        return (total_runs / total_balls) * 100 if total_balls > 0 else 0.0
    
    @classmethod
    def get_career_stats(cls, user: User) -> Dict:
        """Get comprehensive career statistics"""
        profile = user.cricket_profile
        
        return {
            'rating': {
                'current': float(profile.current_rating),
                'peak': float(profile.peak_rating),
            },
            'matches': {
                'played': profile.career_matches,
                'won': profile.career_wins,
                'lost': profile.career_losses,
                'win_percentage': (profile.career_wins / profile.career_matches * 100) if profile.career_matches > 0 else 0
            },
            'tournaments': {
                'played': profile.tournaments_played,
                'won': profile.tournaments_won
            },
            'batting': {
                'average': cls.calculate_batting_average(user),
                'strike_rate': cls.calculate_strike_rate(user),
                'total_runs': profile.career_runs
            },
            'bowling': {
                'average': cls.calculate_bowling_average(user),
                'total_wickets': profile.career_wickets
            }
        }
