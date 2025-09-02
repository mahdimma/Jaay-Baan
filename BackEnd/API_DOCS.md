# Jaay-Baan Backend API Documentation

سامانه مدیریت ذخیره‌سازی اشیاء فیزیکی - مستندات API

## نصب و راه‌اندازی

### پیش‌نیازها

- Python 3.13+
- PostgreSQL
- uv (برای مدیریت dependencies)

### نصب

```bash
# کلون کردن پروژه
git clone <repository-url>
cd BackEnd

# نصب dependencies
uv sync

# ایجاد فایل .env
cp .env.example .env
# ویرایش فایل .env و تنظیم متغیرهای محیط

# اجرای migrations
uv run python jaaybaanbackend/manage.py migrate

# ایجاد superuser
uv run python jaaybaanbackend/manage.py createsuperuser

# ایجاد داده‌های نمونه (اختیاری)
uv run python jaaybaanbackend/manage.py create_sample_data

# اجرای سرور
uv run python jaaybaanbackend/manage.py runserver
```

## Authentication

همه API endpoint ها نیاز به authentication دارند (به جز login).

### Login

```http
POST /api/v1/auth/login/
Content-Type: application/json

{
    "username": "your_username",
    "password": "your_password"
}
```

Response:

```json
{
  "token": "your_auth_token",
  "user_id": 1,
  "username": "your_username"
}
```

### استفاده از Token

```http
Authorization: Token your_auth_token
```

### Logout

```http
POST /api/v1/auth/logout/
Authorization: Token your_auth_token
```

## Locations API

### فهرست مکان‌ها

#### دریافت لیست مکان‌ها

```http
GET /api/v1/locations/
```

#### Query Parameters:

- `parent_id`: فیلتر براساس parent (استفاده از "root" برای root nodes)
- `location_type`: فیلتر براساس نوع مکان
- `page`: شماره صفحه
- `page_size`: تعداد آیتم در هر صفحه

Response:

```json
{
  "count": 20,
  "next": "http://localhost:8000/api/v1/locations/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "خانه من",
      "location_type": "house",
      "description": "خانه اصلی",
      "is_container": true,
      "barcode": null,
      "quantity": 1,
      "value": null,
      "cleaned_time": "2025-01-01T10:00:00Z",
      "cleaned_duration": 30,
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-01T10:00:00Z",
      "breadcrumb": "خانه من",
      "children_count": 3,
      "needs_cleaning": false,
      "images": []
    }
  ]
}
```

### ایجاد مکان جدید

```http
POST /api/v1/locations/
Content-Type: application/json

{
    "name": "اتاق خواب",
    "location_type": "room",
    "description": "اتاق خواب اصلی",
    "is_container": true,
    "parent_id": 1
}
```

### دریافت جزئیات یک مکان

```http
GET /api/v1/locations/{id}/
```

### ویرایش مکان

#### ویرایش کامل مکان (PUT)

برای به‌روزرسانی کامل یک مکان، همه فیلدهای موجود باید ارسال شوند:

```http
PUT /api/v1/locations/{id}/
Content-Type: application/json
Authorization: Token your_auth_token

{
    "name": "اتاق خواب اصلی",
    "location_type": "room",
    "description": "اتاق خواب بزرگ با کمد دیواری",
    "is_container": true,
    "barcode": "ROOM_001",
    "quantity": 1,
    "value": 500000,
    "cleaned_duration": 45
}
```

#### ویرایش جزئی مکان (PATCH)

برای به‌روزرسانی فیلدهای خاص، فقط فیلدهای مورد نظر را ارسال کنید:

```http
PATCH /api/v1/locations/{id}/
Content-Type: application/json
Authorization: Token your_auth_token

{
    "name": "اتاق خواب اصلاح شده",
    "description": "توضیحات جدید"
}
```

#### نمونه‌های کاربردی ویرایش

**تغییر نام مکان:**

```http
PATCH /api/v1/locations/5/
Content-Type: application/json

{
    "name": "نام جدید مکان"
}
```

**اضافه کردن بارکد:**

```http
PATCH /api/v1/locations/5/
Content-Type: application/json

{
    "barcode": "BC_12345"
}
```

**تغییر نوع مکان:**

```http
PATCH /api/v1/locations/5/
Content-Type: application/json

{
    "location_type": "shelf",
    "is_container": true
}
```

**تنظیم مقدار و مدت زمان تمیزکاری:**

```http
PATCH /api/v1/locations/5/
Content-Type: application/json

{
    "value": 250000,
    "cleaned_duration": 30
}
```

#### Response موفق:

```json
{
  "id": 5,
  "name": "اتاق خواب اصلی",
  "location_type": "room",
  "description": "اتاق خواب بزرگ با کمد دیواری",
  "is_container": true,
  "barcode": "ROOM_001",
  "quantity": 1,
  "value": 500000,
  "cleaned_time": "2025-01-01T10:00:00Z",
  "cleaned_duration": 45,
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T12:30:00Z",
  "breadcrumb": "خانه من > اتاق خواب اصلی",
  "children_count": 0,
  "needs_cleaning": false,
  "images": []
}
```

#### خطاهای رایج:

**400 Bad Request - داده نامعتبر:**

```json
{
  "location_type": [
    "Invalid choice. Choose from: house, room, storage, shelf, container, box, item, other"
  ]
}
```

**400 Bad Request - تغییر وضعیت container غیرمجاز:**

```json
{
  "is_container": [
    "Cannot change container status to non-container when location has children. Please move or delete all child locations first."
  ]
}
```

**404 Not Found - مکان پیدا نشد:**

```json
{
  "detail": "Not found."
}
```

#### نکات مهم:

- برای PUT، ارسال همه فیلدها الزامی است
- برای PATCH، فقط فیلدهای تغییر یافته را ارسال کنید
- فیلد `parent_id` از طریق endpoint جابجایی تغییر می‌کند نه ویرایش
- تغییر `is_container` از true به false فقط زمانی امکان‌پذیر است که مکان فرزند نداشته باشد

### حذف مکان

```http
DELETE /api/v1/locations/{id}/
Authorization: Token your_auth_token
```

#### Response موفق:

**Status Code:** `204 No Content` (حذف موفق بدون محتوای response)

#### خطاهای رایج:

**400 Bad Request - مکان دارای فرزند است:**

```json
{
  "detail": "Cannot delete location that has child locations. Please delete or move all child locations first.",
  "children_count": 3
}
```

**404 Not Found - مکان پیدا نشد:**

```json
{
  "detail": "Not found."
}
```

**401 Unauthorized - عدم احراز هویت:**

```json
{
  "detail": "Authentication credentials were not provided."
}
```

#### نکات مهم:

- برای حذف مکان، ابتدا تمام فرزندان آن باید حذف یا جابجا شوند
- حذف مکان منجر به حذف تمام تصاویر مرتبط با آن نیز می‌شود
- این عمل غیرقابل بازگشت است

## Navigation و Tree Structure

### دریافت درخت کامل مکان‌ها

```http
GET /api/v1/locations/tree/
```

### دریافت زیردرخت یک مکان

```http
GET /api/v1/locations/tree/?parent_id={id}
```

### دریافت breadcrumb یک مکان

```http
GET /api/v1/locations/{id}/breadcrumb/
```

Response:

```json
[
  { "id": 1, "name": "خانه من", "location_type": "house" },
  { "id": 2, "name": "اتاق نشیمن", "location_type": "room" },
  { "id": 3, "name": "قفسه تلویزیون", "location_type": "shelf" }
]
```

## Operations

### جابجایی مکان

```http
POST /api/v1/locations/{id}/move/
Content-Type: application/json

{
    "new_parent_id": 5
}
```

**برای جابجایی به root (بدون parent):**

```http
POST /api/v1/locations/{id}/move/
Content-Type: application/json
```

**یا**

```http
POST /api/v1/locations/{id}/move/
Content-Type: application/json
{
    "new_parent_id": null,
}
```

**نکات مهم:**

- سیستم به صورت خودکار موقعیت مناسب را براساس ترتیب الفبایی نام‌ها تعیین می‌کند
- مکان‌ها به صورت خودکار براساس نام مرتب می‌شوند
- نمی‌توان مکان را به خودش جابجا کرد
- نمی‌توان مکان را به یکی از فرزندانش جابجا کرد
- فقط می‌توان به مکان‌های container جابجا کرد

#### خطاهای احتمالی:

**400 Bad Request - تلاش برای جابجایی به خودش:**

```json
{
  "error": "Cannot move location to itself"
}
```

**400 Bad Request - تلاش برای جابجایی به فرزند:**

```json
{
  "error": "Cannot move location to its own descendant"
}
```

**400 Bad Request - تلاش برای جابجایی به مکان غیر container:**

```json
{
  "error": "Cannot move to a non-container location"
}
```

### علامت‌گذاری به عنوان تمیز شده

```http
POST /api/v1/locations/{id}/mark-cleaned/
```

## Search و Filtering

### جستجوی پیشرفته

```http
GET /api/v1/locations/search/?query=ریموت&location_type=item&has_barcode=true
```

### Query Parameters:

- `query`: متن جستجو (در name, description, barcode)
- `location_type`: نوع مکان
- `needs_cleaning`: true/false
- `has_barcode`: true/false
- `parent_id`: جستجو در یک مکان خاص

### مکان‌هایی که نیاز به تمیزکاری دارند

```http
GET /api/v1/locations/needing-cleaning/
```

## Statistics

### آمار کلی سیستم

```http
GET /api/v1/locations/statistics/
```

Response:

```json
{
  "total_locations": 50,
  "containers": 20,
  "items": 30,
  "locations_needing_cleaning": 5,
  "locations_with_images": 10,
  "locations_with_barcode": 15,
  "by_type": {
    "house": { "name": "House", "count": 1 },
    "room": { "name": "Room", "count": 5 },
    "item": { "name": "Item", "count": 30 }
  }
}
```

## Bulk Operations

### عملیات گروهی

```http
POST /api/v1/locations/bulk-operations/
Content-Type: application/json

{
    "operation": "mark_cleaned",
    "location_ids": [1, 2, 3, 4]
}
```

Operations:

- `mark_cleaned`: علامت‌گذاری به عنوان تمیز
- `delete`: حذف (فقط مکان‌های بدون فرزند)
- `move_to_parent`: جابجایی به parent جدید (نیاز به `new_parent_id`)

**نمونه جابجایی گروهی:**

```http
POST /api/v1/locations/bulk-operations/
Content-Type: application/json

{
    "operation": "move_to_parent",
    "location_ids": [1, 2, 3, 4],
    "new_parent_id": 5
}
```

**نکته:** مکان‌ها به صورت خودکار براساس نام مرتب می‌شوند.

## Images

### اضافه کردن تصویر به مکان

```http
POST /api/v1/locations/{location_id}/images/
Content-Type: multipart/form-data

image: [file]
description: "توضیحات تصویر"
is_primary: true
```

### دریافت تصاویر یک مکان

```http
GET /api/v1/locations/{location_id}/images/
```

### حذف تصویر

```http
DELETE /api/v1/locations/{location_id}/images/{image_id}/
```

## Data Management

### Export کردن داده‌ها

```http
GET /api/v1/locations/export/
```

**Response:**

```json
{
  "count": 6,
  "data": [
    {
      "id": 6,
      "name": "fff",
      "location_type": "house",
      "description": "dfdfd",
      "is_container": true,
      "barcode": "ff",
      "quantity": 1,
      "value": "75.00",
      "cleaned_duration": 30,
      "breadcrumb_path": "fff",
      "parent_name": null,
      "images_count": 0,
      "created_at": "2025-08-31T17:14:03.322849Z"
    },
    {
      "id": 8,
      "name": "ff",
      "location_type": "room",
      "description": "ef",
      "is_container": false,
      "barcode": null,
      "quantity": 1,
      "value": null,
      "cleaned_duration": 30,
      "breadcrumb_path": "fff > ff",
      "parent_name": "fff",
      "images_count": 0,
      "created_at": "2025-08-31T17:17:18.806985Z"
    }
  ],
  "exported_at": "2025-09-01T14:35:28.039402Z"
}
```

## Response Codes

- `200 OK`: درخواست موفق
- `201 Created`: ایجاد موفق
- `400 Bad Request`: داده‌های نامعتبر
- `401 Unauthorized`: نیاز به authentication
- `404 Not Found`: منبع پیدا نشد
- `500 Internal Server Error`: خطای سرور

## Location Types

- `house`: خانه
- `room`: اتاق
- `storage`: انبار
- `shelf`: قفسه
- `container`: ظرف/جعبه
- `box`: جعبه
- `item`: آیتم
- `other`: سایر

## Notes

- همه مکان‌ها دارای ساختار درختی هستند
- فقط container ها می‌توانند فرزند داشته باشند
- مکان‌ها به صورت خودکار براساس نام (الفبایی) مرتب می‌شوند
- هنگام جابجایی مکان‌ها، موقعیت به صورت خودکار تعیین می‌شود
- تمام تاریخ‌ها در فرمت ISO 8601 UTC هستند
- تصاویر در مسیر `/media/location_images/` ذخیره می‌شوند
