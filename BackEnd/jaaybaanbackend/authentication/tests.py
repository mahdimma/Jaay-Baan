from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from rest_framework import status


class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )

    def test_login_success(self):
        """Test successful login returns token"""
        data = {"username": "testuser", "password": "testpass123"}
        response = self.client.post("/api/auth/login/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        self.assertIn("user_id", response.data)
        self.assertIn("username", response.data)
        self.assertEqual(response.data["username"], "testuser")

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        data = {"username": "testuser", "password": "wrongpassword"}
        response = self.client.post("/api/auth/login/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_success(self):
        """Test successful logout"""
        token = Token.objects.get(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token.key)

        response = self.client.post("/api/auth/logout/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)

    def test_token_created_on_user_creation(self):
        """Test that token is automatically created when user is created"""
        new_user = User.objects.create_user(username="newuser", password="newpass123")

        self.assertTrue(Token.objects.filter(user=new_user).exists())
