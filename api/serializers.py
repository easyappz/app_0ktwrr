from rest_framework import serializers
from .models import Member, Message


class MemberRegistrationSerializer(serializers.Serializer):
    """Serializer for user registration."""
    username = serializers.CharField(max_length=150, min_length=1)
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_username(self, value):
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        member = Member(
            username=validated_data['username']
        )
        member.set_password(validated_data['password'])
        member.save()
        return member


class MemberLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    username = serializers.CharField(max_length=150, min_length=1)
    password = serializers.CharField(min_length=1, write_only=True)


class MemberProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    
    class Meta:
        model = Member
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'username', 'date_joined']


class MemberProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = Member
        fields = ['email', 'first_name', 'last_name']


class HelloMessageSerializer(serializers.Serializer):
    """Serializer for hello endpoint."""
    message = serializers.CharField(max_length=200)
    timestamp = serializers.DateTimeField(read_only=True)


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for Message model.
    Returns: id, content, author (username), created_at, updated_at, is_edited
    """
    author = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'content', 'author', 'created_at', 'updated_at', 'is_edited']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'is_edited']


class MessageCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a new message.
    Accepts: content
    """
    content = serializers.CharField(min_length=1)

    def create(self, validated_data):
        author = self.context['request'].user
        message = Message.objects.create(
            content=validated_data['content'],
            author=author
        )
        return message


class MessageUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating a message.
    Accepts: content
    """
    content = serializers.CharField(min_length=1)

    def update(self, instance, validated_data):
        instance.content = validated_data['content']
        instance.is_edited = True
        instance.save()
        return instance
