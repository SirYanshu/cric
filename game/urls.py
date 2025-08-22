from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'teams', views.TeamViewSet)
router.register(r'players', views.PlayerViewSet)
router.register(r'matches', views.MatchViewSet)
router.register(r'auctions', views.AuctionViewSet)
router.register(r'bids', views.BidViewSet)
router.register(r'pitch-conditions', views.PitchConditionViewSet)
router.register(r'weather-conditions', views.WeatherConditionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
