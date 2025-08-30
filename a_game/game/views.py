# game/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import *
from .serializers import *
from .match_engine import MatchEngine

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    
    @action(detail=True, methods=['get'])
    def players(self, request, pk=None):
        """Get all players in a team"""
        team = self.get_object()
        players = team.players.all()
        serializer = PlayerSerializer(players, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def playing_eleven(self, request, pk=None):
        """Get the playing eleven for a team"""
        team = self.get_object()
        players = team.players.filter(first_eleven=True)
        if players.count() < 11:
            # Add more players based on overall skill
            additional_players = team.players.filter(first_eleven=False).order_by('-overall_skill')[:11-players.count()]
            players = list(players) + list(additional_players)
        elif players.count() > 11:
            players = players.order_by('-overall_skill')[:11]
        
        serializer = PlayerSerializer(players, many=True)
        return Response(serializer.data)

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all().select_related(
        'team', 'bowling_attributes', 'batting_attributes', 
        'wicketkeeping_attributes', 'fielding_attributes'
    )
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PlayerCreateUpdateSerializer
        return PlayerSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        team_id = self.request.query_params.get('team', None)
        player_type = self.request.query_params.get('type', None)
        available = self.request.query_params.get('available', None)
        
        if team_id:
            queryset = queryset.filter(team_id=team_id)
        if player_type:
            queryset = queryset.filter(player_type=player_type)
        if available == 'true':
            queryset = queryset.filter(team__isnull=True)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get all available players (not assigned to any team)"""
        players = self.queryset.filter(team__isnull=True)
        serializer = PlayerSerializer(players, many=True)
        return Response(serializer.data)

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all().select_related(
        'team1', 'team2', 'winner', 'pitch_condition', 'weather_condition'
    )
    serializer_class = MatchSerializer
    
    @action(detail=True, methods=['post'])
    def simulate(self, request, pk=None):
        """Simulate a match"""
        match = self.get_object()
        
        if match.status != 'SCHEDULED':
            return Response(
                {'error': 'Match must be in scheduled state to simulate'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get max overs from request (default 20)
        max_overs = request.data.get('max_overs', 20)
        
        try:
            # Initialize match engine and simulate
            engine = MatchEngine(match)
            result = engine.simulate_match(max_overs=max_overs)
            
            return Response(result)
        except Exception as e:
            return Response(
                {'error': f'Simulation failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def simulate_ball(self, request, pk=None):
        """Simulate a single ball"""
        match = self.get_object()
        
        # Get players from request
        bowler_id = request.data.get('bowler_id')
        batsman_id = request.data.get('batsman_id')
        wicketkeeper_id = request.data.get('wicketkeeper_id')
        
        if not bowler_id or not batsman_id:
            return Response(
                {'error': 'bowler_id and batsman_id are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            bowler = Player.objects.get(id=bowler_id)
            batsman = Player.objects.get(id=batsman_id)
            wicketkeeper = Player.objects.get(id=wicketkeeper_id) if wicketkeeper_id else None
            
            engine = MatchEngine(match)
            outcome = engine.simulate_ball_outcome(bowler, batsman, wicketkeeper)
            
            return Response({
                'outcome': outcome,
                'bowler': bowler.name,
                'batsman': batsman.name,
                'wicketkeeper': wicketkeeper.name if wicketkeeper else None
            })
        except Player.DoesNotExist:
            return Response(
                {'error': 'Player not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Ball simulation failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AuctionViewSet(viewsets.ModelViewSet):
    queryset = Auction.objects.all().prefetch_related('participating_teams', 'players_pool')
    serializer_class = AuctionSerializer
    
    @action(detail=True, methods=['post'])
    def add_team(self, request, pk=None):
        """Add a team to the auction"""
        auction = self.get_object()
        team_id = request.data.get('team_id')
        
        try:
            team = Team.objects.get(id=team_id)
            auction.participating_teams.add(team)
            return Response({'message': f'{team.name} added to auction'})
        except Team.DoesNotExist:
            return Response(
                {'error': 'Team not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def add_player(self, request, pk=None):
        """Add a player to the auction pool"""
        auction = self.get_object()
        player_id = request.data.get('player_id')
        
        try:
            player = Player.objects.get(id=player_id)
            auction.players_pool.add(player)
            return Response({'message': f'{player.name} added to auction pool'})
        except Player.DoesNotExist:
            return Response(
                {'error': 'Player not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def current_bids(self, request, pk=None):
        """Get current bids for all players in auction"""
        auction = self.get_object()
        
        # Get highest bid for each player
        bids = Bid.objects.filter(auction=auction, status='ACTIVE').order_by('player', '-amount').distinct('player')
        serializer = BidSerializer(bids, many=True)
        return Response(serializer.data)

class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all().select_related('auction', 'player', 'team')
    serializer_class = BidSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new bid"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        auction = serializer.validated_data['auction']
        player = serializer.validated_data['player']
        team = serializer.validated_data['team']
        amount = serializer.validated_data['amount']
        
        # Check if team has enough budget
        if team.money_left < amount:
            return Response(
                {'error': 'Insufficient budget'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if bid is higher than current highest bid
        current_highest = Bid.objects.filter(
            auction=auction, player=player, status='ACTIVE'
        ).order_by('-amount').first()
        
        if current_highest and amount <= current_highest.amount:
            return Response(
                {'error': f'Bid must be higher than current highest bid of ${current_highest.amount}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark previous bids as outbid
        Bid.objects.filter(
            auction=auction, player=player, status='ACTIVE'
        ).update(status='OUTBID')
        
        # Create new bid
        bid = serializer.save()
        
        return Response(BidSerializer(bid).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        """Finalize a bid (assign player to team)"""
        bid = self.get_object()
        
        if bid.status != 'ACTIVE':
            return Response(
                {'error': 'Only active bids can be finalized'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Assign player to team
        player = bid.player
        team = bid.team
        amount = bid.amount
        
        player.team = team
        player.sold_price = amount
        player.save()
        
        # Update team budget
        team.money_left -= amount
        team.save()
        
        # Update bid status
        bid.status = 'WON'
        bid.save()
        
        # Mark other bids for this player as outbid
        Bid.objects.filter(
            auction=bid.auction, player=player
        ).exclude(id=bid.id).update(status='OUTBID')
        
        return Response({
            'message': f'{player.name} sold to {team.name} for ${amount}',
            'player': PlayerSerializer(player).data
        })

class PitchConditionViewSet(viewsets.ModelViewSet):
    queryset = PitchCondition.objects.all()
    serializer_class = PitchConditionSerializer

class WeatherConditionViewSet(viewsets.ModelViewSet):
    queryset = WeatherCondition.objects.all()
    serializer_class = WeatherConditionSerializer
