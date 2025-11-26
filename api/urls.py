from django.urls import path
from .views import (
    HelloView,
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    MessageListCreateView,
    MessageUpdateDeleteView,
)

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("messages/", MessageListCreateView.as_view(), name="messages-list"),
    path("messages/<int:pk>/", MessageUpdateDeleteView.as_view(), name="messages-detail"),
]
