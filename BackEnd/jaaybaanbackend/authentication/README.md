# Authentication API

این ماژول Token Authentication را برای Django REST Framework پیاده‌سازی می‌کند.

## Endpoints

### Login

- **URL**: `/api/v1/auth/login/`
- **Method**: `POST`
- **Body**:

```json
{
  "username": "your_username",
  "password": "your_password"
}
```

- **Response**:

```json
{
  "token": "your_auth_token",
  "user_id": 1,
  "username": "your_username"
}
```

### Logout

- **URL**: `/api/v1/auth/logout/`
- **Method**: `POST`
- **Headers**: `Authorization: Token your_auth_token`
- **Response**:

```json
{
  "message": "Successfully logged out"
}
```

## استفاده از Token

برای دسترسی به API های محافظت شده، token را در header درخواست قرار دهید:

```
Authorization: Token your_auth_token
```

## Management Commands

### تولید Token برای کاربر موجود

```bash
python manage.py generate_token username
```

## تنظیمات

Token Authentication در `settings.py` فعال شده است:

```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}
```

## ویژگی‌ها

- Token به‌طور خودکار هنگام ایجاد کاربر جدید تولید می‌شود
- Token ها منقضی نمی‌شوند (مناسب برای سیستم تک‌کاربره)
- امکان logout و حذف token
- Test های کامل شامل
