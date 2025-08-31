from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)
        return Response(
            {"token": token.key, "user_id": user.pk, "username": user.username}
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    """Token logout endpoint"""
    try:
        request.user.auth_token.delete()
        return Response(
            {"message": "Successfully logged out"}, status=status.HTTP_200_OK
        )
    except Exception:
        return Response(
            {"error": "Error logging out"}, status=status.HTTP_400_BAD_REQUEST
        )
