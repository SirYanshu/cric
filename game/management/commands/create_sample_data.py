# game/management/commands/create_sample_data.py
from django.core.management.base import BaseCommand
from django.db import transaction
import random
from game.models import *

class Command(BaseCommand):
    help = 'Create sample data for cricket auction game'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--teams',
            type=int,
            default=8,
            help='Number of teams to create (default: 8)'
        )
        parser.add_argument(
            '--players',
            type=int,
            default=100,
            help='Number of players to create (default: 100)'
        )

    def handle(self, *args, **options):
        teams_count = options['teams']
        players_count = options['players']

        with transaction.atomic():
            self.create_teams(teams_count)
            self.create_players(players_count)
            self.create_conditions()
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created {teams_count} teams, {players_count} players, and conditions'
                )
            )

    def create_teams(self, count):
        team_names = [
            'Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers Bangalore',
            'Delhi Capitals', 'Kolkata Knight Riders', 'Punjab Kings',
            'Rajasthan Royals', 'Sunrisers Hyderabad', 'Gujarat Titans',
            'Lucknow Super Giants'
        ]
        
        for i in range(count):
            name = team_names[i] if i < len(team_names) else f'Team {i+1}'
            Team.objects.create(
                name=name,
                budget=10000000,  # 10 million
                money_left=10000000
            )
    
    def create_players(self, count):
        first_names = [
            'Virat', 'Rohit', 'MS', 'Hardik', 'KL', 'Rishabh', 'Shikhar', 'Ajinkya',
            'Ravindra', 'Jasprit', 'Mohammed', 'Yuzvendra', 'Ravichandran', 'Bhuvneshwar',
            'Umesh', 'Ishant', 'Prithvi', 'Shreyas', 'Dinesh', 'Suresh'
        ]
        
        last_names = [
            'Kohli', 'Sharma', 'Dhoni', 'Pandya', 'Rahul', 'Pant', 'Dhawan', 'Rahane',
            'Jadeja', 'Bumrah', 'Shami', 'Chahal', 'Ashwin', 'Kumar', 'Yadav', 'Sharma',
            'Shaw', 'Iyer', 'Karthik', 'Raina', 'Singh', 'Patel', 'Mishra', 'Thakur'
        ]
        
        player_types = ['BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER', 'WICKET_KEEPER_BATSMAN']
        batting_hands = ['RIGHT', 'LEFT']
        bowling_styles = [
            'RIGHT_ARM_OFF_SPIN', 'LEFT_ARM_OFF_SPIN', 'RIGHT_ARM_LEG_SPIN',
            'RIGHT_ARM_FAST', 'LEFT_ARM_FAST', 'RIGHT_ARM_MEDIUM'
        ]
        
        for i in range(count):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            name = f"{first_name} {last_name} {i+1}"
            
            player_type = random.choice(player_types)
            batting_hand = random.choice(batting_hands)
            bowling_style = random.choice(bowling_styles) if player_type in ['BOWLER', 'ALL_ROUNDER'] else None
            
            # Generate skills based on player type
            if player_type == 'BATSMAN':
                batting_skill = random.randint(70, 95)
                bowling_skill = random.randint(10, 30) if random.random() < 0.3 else None
                fielding_skill = random.randint(60, 85)
                wicketkeeping_skill = None
            elif player_type == 'BOWLER':
                batting_skill = random.randint(20, 50)
                bowling_skill = random.randint(70, 95)
                fielding_skill = random.randint(60, 85)
                wicketkeeping_skill = None
            elif player_type == 'ALL_ROUNDER':
                batting_skill = random.randint(60, 85)
                bowling_skill = random.randint(60, 85)
                fielding_skill = random.randint(70, 90)
                wicketkeeping_skill = None
            elif player_type in ['WICKET_KEEPER', 'WICKET_KEEPER_BATSMAN']:
                batting_skill = random.randint(50, 85) if 'BATSMAN' in player_type else random.randint(30, 60)
                bowling_skill = random.randint(20, 40) if random.random() < 0.2 else None
                fielding_skill = random.randint(70, 90)
                wicketkeeping_skill = random.randint(70, 95)
            
            # Calculate overall skill properly
            skills_to_average = [batting_skill, fielding_skill]
            if bowling_skill:
                skills_to_average.append(bowling_skill)
            if wicketkeeping_skill:
                skills_to_average.append(wicketkeeping_skill)
            
            overall_skill = sum(skills_to_average) // len(skills_to_average)
            
            player = Player.objects.create(
                name=name,
                player_type=player_type,
                batting_hand=batting_hand,
                bowling_style=bowling_style,
                overall_skill=overall_skill,
                batting=batting_skill,
                bowling=bowling_skill,
                fielding=fielding_skill,
                wicketkeeping=wicketkeeping_skill,
                fitness=random.randint(70, 95),
                bio=f"Talented {player_type.lower().replace('_', ' ')} with great potential.",
                base_price=random.choice([100000, 200000, 500000, 1000000, 2000000])
            )
            
            # Create batting attributes
            BattingAttributes.objects.create(
                player=player,
                off_break=random.randint(30, 90),
                arm_ball=random.randint(30, 90),
                doosra=random.randint(20, 80),
                carrom_ball=random.randint(20, 80),
                leg_break=random.randint(30, 90),
                googly=random.randint(20, 80),
                slider=random.randint(30, 85),
                flipper=random.randint(20, 75),
                top_spin=random.randint(25, 85),
                pace=random.randint(40, 90),
                swing=random.randint(35, 85),
                seam=random.randint(35, 85),
                bouncer=random.randint(30, 80),
                yorkers=random.randint(40, 85),
                power_hitting=random.randint(30, 95),
                technique=random.randint(40, 90),
                footwork=random.randint(35, 90),
                shot_selection=random.randint(40, 90)
            )
            
            # Create fielding attributes
            FieldingAttributes.objects.create(
                player=player,
                catching=random.randint(40, 95),
                ground_fielding=random.randint(40, 95),
                throwing_accuracy=random.randint(40, 90),
                throwing_distance=random.randint(40, 90)
            )
            
            # Create bowling attributes if player can bowl
            if bowling_skill and bowling_style:  # Check both conditions
                # Determine bowler type based on bowling style
                if 'OFF_SPIN' in bowling_style:
                    bowler_type = 'OFF_SPIN'
                elif 'LEG_SPIN' in bowling_style:
                    bowler_type = 'LEG_SPIN'
                elif 'FAST' in bowling_style:
                    bowler_type = 'FAST'
                else:
                    bowler_type = 'MEDIUM'
                
                BowlingAttributes.objects.create(
                    player=player,
                    bowler_type=bowler_type,
                    off_break=random.randint(50, 95) if bowler_type == 'OFF_SPIN' else random.randint(10, 40),
                    arm_ball=random.randint(40, 90) if bowler_type == 'OFF_SPIN' else random.randint(10, 40),
                    doosra=random.randint(30, 85) if bowler_type == 'OFF_SPIN' else random.randint(5, 30),
                    carrom_ball=random.randint(20, 80) if bowler_type == 'OFF_SPIN' else random.randint(5, 25),
                    leg_break=random.randint(50, 95) if bowler_type == 'LEG_SPIN' else random.randint(10, 40),
                    googly=random.randint(30, 85) if bowler_type == 'LEG_SPIN' else random.randint(5, 30),
                    slider=random.randint(40, 85) if bowler_type == 'LEG_SPIN' else random.randint(10, 40),
                    flipper=random.randint(25, 80) if bowler_type == 'LEG_SPIN' else random.randint(5, 25),
                    top_spin=random.randint(35, 85) if bowler_type == 'LEG_SPIN' else random.randint(10, 40),
                    pace=random.randint(70, 95) if bowler_type in ['FAST', 'MEDIUM'] else random.randint(20, 50),
                    swing=random.randint(60, 90) if bowler_type in ['FAST', 'MEDIUM'] else random.randint(10, 40),
                    seam=random.randint(60, 90) if bowler_type in ['FAST', 'MEDIUM'] else random.randint(10, 40),
                    bouncer=random.randint(50, 85) if bowler_type == 'FAST' else random.randint(10, 40),
                    yorkers=random.randint(60, 90) if bowler_type in ['FAST', 'MEDIUM'] else random.randint(20, 50),
                    variation=random.randint(50, 90),
                    control=random.randint(60, 95)
                )
            
            # Create wicketkeeping attributes if player is a wicketkeeper
            if wicketkeeping_skill:
                WicketKeepingAttributes.objects.create(
                    player=player,
                    overall_skill=wicketkeeping_skill,
                    catching=random.randint(70, 95),
                    stumping=random.randint(60, 90),
                    reflexes=random.randint(70, 95),
                    positioning=random.randint(65, 90),
                    communication=random.randint(60, 85)
                )

    def create_conditions(self):
        # Create pitch conditions
        pitch_conditions = [
            {'name': 'Wankhede Stadium', 'condition': 'FLAT', 'spin': 40, 'seam': 30, 'swing': 60, 'reverse_swing': 70, 'boundary_size': 65},
            {'name': 'Eden Gardens', 'condition': 'DUSTY', 'spin': 80, 'seam': 40, 'swing': 50, 'reverse_swing': 60, 'boundary_size': 75},
            {'name': 'Lord\'s', 'condition': 'GREEN', 'spin': 30, 'seam': 80, 'swing': 75, 'reverse_swing': 40, 'boundary_size': 80},
            {'name': 'SCG', 'condition': 'BOUNCY', 'spin': 50, 'seam': 70, 'swing': 60, 'reverse_swing': 50, 'boundary_size': 70},
            {'name': 'Chepauk', 'condition': 'DRY', 'spin': 90, 'seam': 20, 'swing': 30, 'reverse_swing': 80, 'boundary_size': 68}
        ]

        for pitch_data in pitch_conditions:
            PitchCondition.objects.create(**pitch_data)

        # Create weather conditions
        weather_conditions = [
            {'name': 'Clear Sky', 'condition': 'SUNNY', 'spin': 40, 'swing': 30, 'seam': 40, 'humidity': 30},
            {'name': 'Cloudy', 'condition': 'OVERCAST', 'spin': 50, 'swing': 80, 'seam': 70, 'humidity': 70},
            {'name': 'High Humidity', 'condition': 'HUMID', 'spin': 60, 'swing': 75, 'seam': 60, 'humidity': 85},
            {'name': 'Windy', 'condition': 'WINDY', 'spin': 30, 'swing': 85, 'seam': 50, 'humidity': 40},
            {'name': 'Light Rain', 'condition': 'RAINY', 'spin': 20, 'swing': 90, 'seam': 80, 'humidity': 95}
        ]

        for weather_data in weather_conditions:
            WeatherCondition.objects.create(**weather_data)
