from django.urls import path
from .views import CustomAuthToken, logout_view

urlpatterns = [
    path("login/", CustomAuthToken.as_view(), name="api_token_auth"),
    path("logout/", logout_view, name="api_token_logout"),
]
