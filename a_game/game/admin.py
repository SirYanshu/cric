from django.contrib import admin
from .models import *

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'budget', 'money_left', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']

class BowlingAttributesInline(admin.StackedInline):
    model = BowlingAttributes
    extra = 0

class BattingAttributesInline(admin.StackedInline):
    model = BattingAttributes
    extra = 0

class WicketKeepingAttributesInline(admin.StackedInline):
    model = WicketKeepingAttributes
    extra = 0

class FieldingAttributesInline(admin.StackedInline):
    model = FieldingAttributes
    extra = 0

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ['name', 'player_type', 'team', 'overall_skill', 'first_eleven', 'sold_price']
    list_filter = ['player_type', 'team', 'first_eleven', 'batting_hand']
    search_fields = ['name', 'bio']
    inlines = [BowlingAttributesInline, BattingAttributesInline, WicketKeepingAttributesInline, FieldingAttributesInline]

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['team1', 'team2', 'status', 'winner', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['team1__name', 'team2__name']

@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'start_time', 'created_at']
    list_filter = ['status', 'start_time']
    search_fields = ['name']
    filter_horizontal = ['participating_teams', 'players_pool']

@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ['auction', 'player', 'team', 'amount', 'status', 'created_at']
    list_filter = ['status', 'auction', 'created_at']
    search_fields = ['player__name', 'team__name']

@admin.register(PitchCondition)
class PitchConditionAdmin(admin.ModelAdmin):
    list_display = ['name', 'condition', 'spin', 'seam', 'swing']
    list_filter = ['condition']

@admin.register(WeatherCondition)
class WeatherConditionAdmin(admin.ModelAdmin):
    list_display = ['name', 'condition', 'spin', 'swing', 'humidity']
    list_filter = ['condition']
