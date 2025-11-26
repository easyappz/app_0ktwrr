from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import AuthToken


class TokenAuthentication(BaseAuthentication):
    """
    Custom token authentication for Member model.
    Token should be passed in Authorization header as: Token <token>
    """
    keyword = 'Token'

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            return None
        
        parts = auth_header.split()
        
        if len(parts) != 2:
            return None
        
        if parts[0] != self.keyword:
            return None
        
        token_key = parts[1]
        
        try:
            token = AuthToken.objects.select_related('member').get(key=token_key)
        except AuthToken.DoesNotExist:
            raise AuthenticationFailed('Invalid token')
        
        return (token.member, token)

    def authenticate_header(self, request):
        return self.keyword
