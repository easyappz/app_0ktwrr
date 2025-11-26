from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Member, AuthToken, Message
from .serializers import (
    MemberRegistrationSerializer,
    MemberLoginSerializer,
    MemberProfileSerializer,
    MemberProfileUpdateSerializer,
    HelloMessageSerializer,
    MessageSerializer,
    MessageCreateSerializer,
    MessageUpdateSerializer,
)
from .authentication import TokenAuthentication


class RegisterView(APIView):
    """
    Register a new user.
    POST /api/auth/register/
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = MemberRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            member = serializer.save()
            return Response(
                {
                    'id': member.id,
                    'username': member.username,
                    'message': 'User registered successfully'
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Authenticate user and return token.
    POST /api/auth/login/
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = MemberLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            try:
                member = Member.objects.get(username=username)
            except Member.DoesNotExist:
                return Response(
                    {'detail': 'Invalid credentials'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not member.check_password(password):
                return Response(
                    {'detail': 'Invalid credentials'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create new token
            token = AuthToken.objects.create(member=member)
            
            return Response({
                'token': token.key,
                'user': {
                    'id': member.id,
                    'username': member.username
                }
            })
        
        return Response(
            {'detail': 'Invalid credentials'},
            status=status.HTTP_400_BAD_REQUEST
        )


class LogoutView(APIView):
    """
    Logout user and invalidate token.
    POST /api/auth/logout/
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Delete the current token
        if hasattr(request, 'auth') and request.auth:
            request.auth.delete()
        
        return Response({'detail': 'Successfully logged out'})


class ProfileView(APIView):
    """
    Get or update user profile.
    GET /api/profile/
    PUT /api/profile/
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MemberProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = MemberProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            # Return full profile
            profile_serializer = MemberProfileSerializer(request.user)
            return Response(profile_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HelloView(APIView):
    """
    A simple API endpoint that returns a greeting message.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = HelloMessageSerializer(data)
        return Response(serializer.data)


class MessageListCreateView(APIView):
    """
    List all messages or create a new message.
    GET /api/messages/ - Get list of all chat messages
    POST /api/messages/ - Send a new message
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get list of all chat messages."""
        messages = Message.objects.all().select_related('author')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new message."""
        serializer = MessageCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            message = serializer.save()
            response_serializer = MessageSerializer(message)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessageUpdateDeleteView(APIView):
    """
    Update or delete a message.
    PUT /api/messages/{id}/ - Edit a message (only author)
    DELETE /api/messages/{id}/ - Delete a message (only author)
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        """Get message by id or return 404."""
        return get_object_or_404(Message, pk=pk)

    def check_author_permission(self, message, user):
        """Check if user is the author of the message."""
        return message.author.id == user.id

    def put(self, request, pk):
        """Update a message. Only the author can edit."""
        message = self.get_object(pk)
        
        if not self.check_author_permission(message, request.user):
            return Response(
                {'detail': 'Permission denied - not the author'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = MessageUpdateSerializer(data=request.data)
        if serializer.is_valid():
            updated_message = serializer.update(message, serializer.validated_data)
            response_serializer = MessageSerializer(updated_message)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete a message. Only the author can delete."""
        message = self.get_object(pk)
        
        if not self.check_author_permission(message, request.user):
            return Response(
                {'detail': 'Permission denied - not the author'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
