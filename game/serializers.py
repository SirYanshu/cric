from rest_framework import serializers
from .models import *

class TeamSerializer(serializers.ModelSerializer):
    players_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'budget', 'money_left', 'players_count', 'created_at']
    
    def get_players_count(self, obj):
        return obj.players.count()

class BowlingAttributesSerializer(serializers.ModelSerializer):
    class Meta:
        model = BowlingAttributes
        fields = '__all__'

class BattingAttributesSerializer(serializers.ModelSerializer):
    class Meta:
        model = BattingAttributes
        fields = '__all__'

class WicketKeepingAttributesSerializer(serializers.ModelSerializer):
    class Meta:
        model = WicketKeepingAttributes
        fields = '__all__'

class FieldingAttributesSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldingAttributes
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    bowling_attributes = BowlingAttributesSerializer(read_only=True)
    batting_attributes = BattingAttributesSerializer(read_only=True)
    wicketkeeping_attributes = WicketKeepingAttributesSerializer(read_only=True)
    fielding_attributes = FieldingAttributesSerializer(read_only=True)
    
    class Meta:
        model = Player
        fields = [
            'id', 'name', 'player_type', 'batting_hand', 'bowling_style',
            'overall_skill', 'batting', 'bowling', 'fielding', 'wicketkeeping', 'fitness',
            'bio', 'team', 'team_name', 'first_eleven', 'base_price', 'sold_price',
            'bowling_attributes', 'batting_attributes', 'wicketkeeping_attributes', 'fielding_attributes',
            'created_at'
        ]

class PlayerCreateUpdateSerializer(serializers.ModelSerializer):
    bowling_attributes = BowlingAttributesSerializer(required=False)
    batting_attributes = BattingAttributesSerializer(required=False)
    wicketkeeping_attributes = WicketKeepingAttributesSerializer(required=False)
    fielding_attributes = FieldingAttributesSerializer(required=False)
    
    class Meta:
        model = Player
        fields = [
            'name', 'player_type', 'batting_hand', 'bowling_style',
            'overall_skill', 'batting', 'bowling', 'fielding', 'wicketkeeping', 'fitness',
            'bio', 'team', 'first_eleven', 'base_price', 'sold_price',
            'bowling_attributes', 'batting_attributes', 'wicketkeeping_attributes', 'fielding_attributes'
        ]
    
    def create(self, validated_data):
        # Extract nested attributes
        bowling_data = validated_data.pop('bowling_attributes', None)
        batting_data = validated_data.pop('batting_attributes', None)
        wicketkeeping_data = validated_data.pop('wicketkeeping_attributes', None)
        fielding_data = validated_data.pop('fielding_attributes', None)
        
        # Create player
        player = Player.objects.create(**validated_data)
        
        # Create related attributes
        if bowling_data:
            BowlingAttributes.objects.create(player=player, **bowling_data)
        if batting_data:
            BattingAttributes.objects.create(player=player, **batting_data)
        if wicketkeeping_data:
            WicketKeepingAttributes.objects.create(player=player, **wicketkeeping_data)
        if fielding_data:
            FieldingAttributes.objects.create(player=player, **fielding_data)
        
        return player

class PitchConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PitchCondition
        fields = '__all__'

class WeatherConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherCondition
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    team1_name = serializers.CharField(source='team1.name', read_only=True)
    team2_name = serializers.CharField(source='team2.name', read_only=True)
    winner_name = serializers.CharField(source='winner.name', read_only=True)
    pitch_condition_name = serializers.CharField(source='pitch_condition.name', read_only=True)
    weather_condition_name = serializers.CharField(source='weather_condition.name', read_only=True)
    
    class Meta:
        model = Match
        fields = [
            'id', 'team1', 'team1_name', 'team2', 'team2_name', 
            'pitch_condition', 'pitch_condition_name',
            'weather_condition', 'weather_condition_name',
            'status', 'winner', 'winner_name',
            'team1_score', 'team2_score', 'team1_wickets', 'team2_wickets',
            'created_at', 'updated_at'
        ]

class AuctionSerializer(serializers.ModelSerializer):
    participating_teams_count = serializers.SerializerMethodField()
    players_pool_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Auction
        fields = [
            'id', 'name', 'status', 'start_time', 'end_time',
            'participating_teams_count', 'players_pool_count', 'created_at'
        ]
    
    def get_participating_teams_count(self, obj):
        return obj.participating_teams.count()
    
    def get_players_pool_count(self, obj):
        return obj.players_pool.count()

class BidSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    player_name = serializers.CharField(source='player.name', read_only=True)
    auction_name = serializers.CharField(source='auction.name', read_only=True)
    
    class Meta:
        model = Bid
        fields = [
            'id', 'auction', 'auction_name', 'player', 'player_name', 
            'team', 'team_name', 'amount', 'status', 'created_at'
        ]
