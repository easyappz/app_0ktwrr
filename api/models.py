from django.db import models
from django.contrib.auth.hashers import make_password, check_password as django_check_password


class Member(models.Model):
    """
    Custom user model for the application.
    Compatible with Django REST Framework authentication.
    """
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    email = models.EmailField(max_length=254, blank=True, default='')
    first_name = models.CharField(max_length=150, blank=True, default='')
    last_name = models.CharField(max_length=150, blank=True, default='')
    date_joined = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_member'
        verbose_name = 'Member'
        verbose_name_plural = 'Members'

    def __str__(self):
        return self.username

    @property
    def is_authenticated(self):
        """Always return True for authenticated users."""
        return True

    @property
    def is_anonymous(self):
        """Always return False for authenticated users."""
        return False

    def set_password(self, raw_password):
        """Hash and set the password."""
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """Check if the provided password matches the stored hash."""
        return django_check_password(raw_password, self.password)

    def has_perm(self, perm, obj=None):
        """Return True if the user has the specified permission."""
        return True

    def has_module_perms(self, app_label):
        """Return True if the user has permissions to view the app."""
        return True


class Message(models.Model):
    """
    Chat message model.
    """
    content = models.TextField()
    author = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_edited = models.BooleanField(default=False)

    class Meta:
        db_table = 'api_message'
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['created_at']

    def __str__(self):
        return f"Message by {self.author.username} at {self.created_at}"
