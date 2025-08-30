from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    budget = models.IntegerField(default=1000000, validators=[MinValueValidator(0)])
    money_left = models.IntegerField(default=1000000, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'teams'
        ordering = ['name']
    
    def __str__(self):
        return self.name

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

class Match(models.Model):
    MATCH_STATUS = [
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    team1 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='matches_as_team1')
    team2 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='matches_as_team2')
    pitch_condition = models.ForeignKey(PitchCondition, on_delete=models.SET_NULL, null=True)
    weather_condition = models.ForeignKey(WeatherCondition, on_delete=models.SET_NULL, null=True)
    
    status = models.CharField(max_length=15, choices=MATCH_STATUS, default='SCHEDULED')
    winner = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_matches')
    
    team1_score = models.IntegerField(default=0)
    team2_score = models.IntegerField(default=0)
    team1_wickets = models.IntegerField(default=0)
    team2_wickets = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'matches'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.team1.name} vs {self.team2.name}"

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
