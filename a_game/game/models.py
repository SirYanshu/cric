from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User
from decimal import Decimal


class PitchCondition(models.Model):
    PITCH_TYPES = [
        ('DRY', 'Dry'),
        ('GREEN', 'Green'),
        ('DUSTY', 'Dusty'),
        ('FLAT', 'Flat'),
        ('BOUNCY', 'Bouncy'),
    ]
    
    name = models.CharField(max_length=50)
    condition = models.CharField(max_length=10, choices=PITCH_TYPES)
    
    # Help for different bowling types (0-100)
    spin = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    seam = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    swing = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    reverse_swing = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    boundary_size = models.IntegerField(default=70, validators=[MinValueValidator(50), MaxValueValidator(90)])
    
    class Meta:
        db_table = 'pitch_conditions'
    
    def __str__(self):
        return f"{self.name} ({self.get_condition_display()})"

class WeatherCondition(models.Model):
    WEATHER_TYPES = [
        ('SUNNY', 'Sunny'),
        ('OVERCAST', 'Overcast'),
        ('RAINY', 'Rainy'),
        ('HUMID', 'Humid'),
        ('WINDY', 'Windy'),
    ]
    
    name = models.CharField(max_length=50)
    condition = models.CharField(max_length=10, choices=WEATHER_TYPES)
    
    # Help for different bowling types (0-100)
    spin = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    swing = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    seam = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    humidity = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    class Meta:
        db_table = 'weather_conditions'
    
    def __str__(self):
        return f"{self.name} ({self.get_condition_display()})"

class UserProfile(models.Model):
    """Extended user profile for cricket career tracking"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cricket_profile')
    current_rating = models.DecimalField(max_digits=6, decimal_places=2, default=1000.00)
    peak_rating = models.DecimalField(max_digits=6, decimal_places=2, default=1000.00)
    career_matches = models.IntegerField(default=0)
    career_runs = models.IntegerField(default=0)
    career_wickets = models.IntegerField(default=0)
    career_wins = models.IntegerField(default=0)
    career_losses = models.IntegerField(default=0)
    tournaments_played = models.IntegerField(default=0)
    tournaments_won = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_profiles'
    
    def __str__(self):
        return f"{self.user.username} - Rating: {self.current_rating}"

class Tournament(models.Model):
    TOURNAMENT_TYPES = [
        ('LEAGUE', 'League'),
        ('KNOCKOUT', 'Knockout'),
        ('ROUND_ROBIN', 'Round Robin'),
        ('HYBRID', 'Hybrid'),
    ]
    
    TOURNAMENT_STATUS = [
        ('REGISTRATION', 'Registration Open'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    tournament_type = models.CharField(max_length=20, choices=TOURNAMENT_TYPES)
    status = models.CharField(max_length=20, choices=TOURNAMENT_STATUS, default='REGISTRATION')
    max_teams = models.IntegerField(default=8)
    current_teams = models.IntegerField(default=0)
    entry_fee = models.IntegerField(default=0)
    prize_pool = models.IntegerField(default=0)
    rating_factor = models.DecimalField(max_digits=4, decimal_places=2, default=1.0)  # Multiplier for rating changes
    
    registration_start = models.DateTimeField()
    registration_end = models.DateTimeField()
    tournament_start = models.DateTimeField()
    tournament_end = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tournaments'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name

class TournamentRegistration(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='registrations')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey('Team', on_delete=models.CASCADE)
    registered_at = models.DateTimeField(auto_now_add=True)
    rating_at_registration = models.DecimalField(max_digits=6, decimal_places=2)
    
    class Meta:
        db_table = 'tournament_registrations'
        unique_together = ['tournament', 'user']
    
    def __str__(self):
        return f"{self.user.username} - {self.tournament.name}"

# Update existing Team model
class Team(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_teams', null=True, blank=True)
    budget = models.IntegerField(default=1000000, validators=[MinValueValidator(0)])
    money_left = models.IntegerField(default=1000000, validators=[MinValueValidator(0)])
    tournament = models.ForeignKey(Tournament, on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'teams'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.owner.username})"
    

class Player(models.Model):
    PLAYER_TYPES = [
        ('BATSMAN', 'Batsman'),
        ('BOWLER', 'Bowler'),
        ('ALL_ROUNDER', 'All-Rounder'),
        ('WICKET_KEEPER', 'Wicket-Keeper'),
        ('WICKET_KEEPER_BATSMAN', 'Wicket-Keeper Batsman'),
    ]
    
    BATTING_HANDS = [
        ('RIGHT', 'Right-Handed'),
        ('LEFT', 'Left-Handed'),
    ]
    
    BOWLING_STYLES = [
        ('RIGHT_ARM_OFF_SPIN', 'Right-Arm Off-Spin'),
        ('LEFT_ARM_OFF_SPIN', 'Left-Arm Off-Spin'),
        ('RIGHT_ARM_LEG_SPIN', 'Right-Arm Leg-Spin'),
        ('LEFT_ARM_LEG_SPIN', 'Left-Arm Leg-Spin'),
        ('RIGHT_ARM_FAST', 'Right-Arm Fast'),
        ('LEFT_ARM_FAST', 'Left-Arm Fast'),
        ('RIGHT_ARM_MEDIUM', 'Right-Arm Medium'),
        ('LEFT_ARM_MEDIUM', 'Left-Arm Medium'),
    ]
    
    name = models.CharField(max_length=100)
    player_type = models.CharField(max_length=25, choices=PLAYER_TYPES)
    batting_hand = models.CharField(max_length=10, choices=BATTING_HANDS)
    bowling_style = models.CharField(max_length=25, choices=BOWLING_STYLES, null=True, blank=True)
    
    # Overall skills (0-100)
    overall_skill = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    batting = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    bowling = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    fielding = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    wicketkeeping = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    fitness = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    bio = models.TextField(blank=True, null=True)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='players')
    first_eleven = models.BooleanField(default=False)
    base_price = models.IntegerField(default=100000, validators=[MinValueValidator(0)])
    sold_price = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'players'
        ordering = ['-overall_skill', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_player_type_display()})"


class BowlingAttributes(models.Model):
    BOWLER_TYPES = [
        ('OFF_SPIN', 'Off-Spin'),
        ('LEG_SPIN', 'Leg-Spin'),
        ('FAST', 'Fast'),
        ('MEDIUM', 'Medium'),
    ]
    
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name='bowling_attributes')
    bowler_type = models.CharField(max_length=10, choices=BOWLER_TYPES, default='OFF_SPIN')
    
    # Off-Spin attributes
    off_break = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    arm_ball = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    doosra = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    carrom_ball = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Leg-Spin attributes
    leg_break = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    googly = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    slider = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    flipper = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    top_spin = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Fast bowling attributes
    pace = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    swing = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    seam = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    bouncer = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    yorkers = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Common attributes
    variation = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    control = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    class Meta:
        db_table = 'bowling_attributes'
    
    def __str__(self):
        return f"{self.player.name} - Bowling"

class WicketKeepingAttributes(models.Model):
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name='wicketkeeping_attributes')
    overall_skill = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    catching = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    stumping = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    reflexes = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    positioning = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    communication = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    class Meta:
        db_table = 'wicketkeeping_attributes'
    
    def __str__(self):
        return f"{self.player.name} - Wicket Keeping"

class FieldingAttributes(models.Model):
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name='fielding_attributes')
    catching = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    ground_fielding = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    throwing_accuracy = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    throwing_distance = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    class Meta:
        db_table = 'fielding_attributes'
    
    def __str__(self):
        return f"{self.player.name} - Fielding"

class BattingAttributes(models.Model):
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name='batting_attributes')
    
    # Attributes against different bowling types
    off_break = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    arm_ball = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    doosra = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    carrom_ball = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    leg_break = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    googly = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    slider = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    flipper = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    top_spin = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    pace = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    swing = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    seam = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    bouncer = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    yorkers = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # General batting attributes
    power_hitting = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    technique = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    footwork = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    shot_selection = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    class Meta:
        db_table = 'batting_attributes'
    
    def __str__(self):
        return f"{self.player.name} - Batting"

# Update existing Match model  
class Match(models.Model):
    MATCH_STATUS = [
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches', null=True, blank=True)
    team1 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='matches_as_team1')
    team2 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='matches_as_team2')
    pitch_condition = models.ForeignKey('PitchCondition', on_delete=models.SET_NULL, null=True)
    weather_condition = models.ForeignKey('WeatherCondition', on_delete=models.SET_NULL, null=True)
    
    status = models.CharField(max_length=15, choices=MATCH_STATUS, default='SCHEDULED')
    winner = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_matches')
    match_type = models.CharField(max_length=20, default='T20')  # T20, ODI, Test
    overs = models.IntegerField(default=20)
    
    # Match result details
    team1_score = models.IntegerField(default=0)
    team2_score = models.IntegerField(default=0)
    team1_wickets = models.IntegerField(default=0)
    team2_wickets = models.IntegerField(default=0)
    team1_overs = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    team2_overs = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    
    # Rating impact
    team1_rating_change = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    team2_rating_change = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'matches'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.team1.name} vs {self.team2.name} ({self.tournament.name})"

class Innings(models.Model):
    INNINGS_TYPES = [
        ('FIRST', 'First Innings'),
        ('SECOND', 'Second Innings'),
    ]
    
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='innings')
    batting_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='batting_innings')
    bowling_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='bowling_innings')
    innings_type = models.CharField(max_length=10, choices=INNINGS_TYPES)
    
    total_runs = models.IntegerField(default=0)
    wickets_lost = models.IntegerField(default=0)
    overs_bowled = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    extras = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'innings'
        unique_together = ['match', 'innings_type']
    
    def __str__(self):
        return f"{self.batting_team.name} - {self.total_runs}/{self.wickets_lost} ({self.overs_bowled})"

class PlayerPerformance(models.Model):
    """Individual player performance in a match"""
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='player_performances')
    player = models.ForeignKey('Player', on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    
    # Batting stats
    runs_scored = models.IntegerField(default=0)
    balls_faced = models.IntegerField(default=0)
    fours = models.IntegerField(default=0)
    sixes = models.IntegerField(default=0)
    batting_position = models.IntegerField(null=True, blank=True)
    how_out = models.CharField(max_length=100, blank=True)  # bowled, caught, lbw, etc.
    
    # Bowling stats
    overs_bowled = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    runs_conceded = models.IntegerField(default=0)
    wickets_taken = models.IntegerField(default=0)
    maidens = models.IntegerField(default=0)
    
    # Fielding stats
    catches = models.IntegerField(default=0)
    stumpings = models.IntegerField(default=0)
    run_outs = models.IntegerField(default=0)
    
    # Performance ratings (calculated)
    batting_rating = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    bowling_rating = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    fielding_rating = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overall_rating = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'player_performances'
        unique_together = ['match', 'player']
    
    def __str__(self):
        return f"{self.player.name} - {self.match}"

class Over(models.Model):
    """Ball-by-ball tracking"""
    innings = models.ForeignKey(Innings, on_delete=models.CASCADE, related_name='overs')
    over_number = models.IntegerField()
    bowler = models.ForeignKey('Player', on_delete=models.CASCADE, related_name='overs_bowled')
    runs_scored = models.IntegerField(default=0)
    wickets = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'overs'
        unique_together = ['innings', 'over_number']
    
    def __str__(self):
        return f"Over {self.over_number} - {self.bowler.name}"

class Ball(models.Model):
    BALL_OUTCOMES = [
        ('0', 'Dot Ball'),
        ('1', '1 Run'),
        ('2', '2 Runs'),
        ('3', '3 Runs'),
        ('4', 'Four'),
        ('6', 'Six'),
        ('W', 'Wicket'),
        ('WD', 'Wide'),
        ('NB', 'No Ball'),
        ('B', 'Bye'),
        ('LB', 'Leg Bye'),
    ]
    
    DISMISSAL_TYPES = [
        ('BOWLED', 'Bowled'),
        ('CAUGHT', 'Caught'),
        ('LBW', 'LBW'),
        ('STUMPED', 'Stumped'),
        ('RUN_OUT', 'Run Out'),
        ('HIT_WICKET', 'Hit Wicket'),
    ]
    
    over = models.ForeignKey(Over, on_delete=models.CASCADE, related_name='balls')
    ball_number = models.IntegerField()  # 1-6 (or more for extras)
    bowler = models.ForeignKey('Player', on_delete=models.CASCADE, related_name='balls_bowled')
    batsman = models.ForeignKey('Player', on_delete=models.CASCADE, related_name='balls_faced')
    
    outcome = models.CharField(max_length=3, choices=BALL_OUTCOMES)
    runs = models.IntegerField(default=0)
    is_wicket = models.BooleanField(default=False)
    dismissal_type = models.CharField(max_length=15, choices=DISMISSAL_TYPES, null=True, blank=True)
    fielder = models.ForeignKey('Player', on_delete=models.SET_NULL, null=True, blank=True, related_name='fielding_balls')
    
    class Meta:
        db_table = 'balls'
        unique_together = ['over', 'ball_number']
    
    def __str__(self):
        return f"Ball {self.ball_number} - {self.outcome}"

class RatingHistory(models.Model):
    """Track rating changes over time"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rating_history')
    match = models.ForeignKey(Match, on_delete=models.CASCADE, null=True, blank=True)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, null=True, blank=True)
    
    old_rating = models.DecimalField(max_digits=6, decimal_places=2)
    new_rating = models.DecimalField(max_digits=6, decimal_places=2)
    rating_change = models.DecimalField(max_digits=6, decimal_places=2)
    reason = models.CharField(max_length=200)  # "Won vs Team X", "Lost vs Team Y", etc.

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rating_history'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}: {self.old_rating} -> {self.new_rating}"

class Achievement(models.Model):
    ACHIEVEMENT_TYPES = [
        ('CENTURY', 'Century'),
        ('FIVE_WICKETS', 'Five Wickets'),
        ('HAT_TRICK', 'Hat Trick'),
        ('TOURNAMENT_WIN', 'Tournament Winner'),
        ('RATING_MILESTONE', 'Rating Milestone'),
        ('MATCH_WIN', 'Match Win'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    match = models.ForeignKey(Match, on_delete=models.SET_NULL, null=True, blank=True)
    tournament = models.ForeignKey(Tournament, on_delete=models.SET_NULL, null=True, blank=True)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'achievements'
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"



class Auction(models.Model):
    AUCTION_STATUS = [
        ('UPCOMING', 'Upcoming'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=15, choices=AUCTION_STATUS, default='UPCOMING')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    
    participating_teams = models.ManyToManyField(Team, related_name='auctions')
    players_pool = models.ManyToManyField(Player, related_name='auctions')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'auctions'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name

class Bid(models.Model):
    BID_STATUS = [
        ('ACTIVE', 'Active'),
        ('OUTBID', 'Outbid'),
        ('WON', 'Won'),
        ('WITHDRAWN', 'Withdrawn'),
    ]
    
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='bids')
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='bids')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='bids')
    
    amount = models.IntegerField(validators=[MinValueValidator(0)])
    status = models.CharField(max_length=15, choices=BID_STATUS, default='ACTIVE')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bids'
        ordering = ['-amount', '-created_at']
        unique_together = ['auction', 'player', 'team', 'amount']
    
    def __str__(self):
        return f"{self.team.name} - {self.player.name} - ${self.amount}"
