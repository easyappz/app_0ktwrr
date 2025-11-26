from django.contrib import admin
from .models import Member, AuthToken, Message


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'email', 'date_joined']
    search_fields = ['username', 'email']
    readonly_fields = ['date_joined', 'created_at']


@admin.register(AuthToken)
class AuthTokenAdmin(admin.ModelAdmin):
    list_display = ['key', 'member', 'created_at']
    search_fields = ['member__username']
    readonly_fields = ['key', 'created_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'content', 'created_at', 'is_edited']
    search_fields = ['content', 'author__username']
    readonly_fields = ['created_at', 'updated_at']
