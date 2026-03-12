# Office API Documentation

Base path for all endpoints:

/office/

**Authentication:**
All endpoints require an authenticated user.

---

## Endpoints Overview

| Method | Endpoint                        | Description                   | Permission   |
| ------ | ------------------------------- | ----------------------------- | ------------ |
| GET    | /office/emails/                 | List all user emails          | Office Staff |
| POST   | /office/staff/                  | Create staff                  | Office Staff |
| GET    | /office/staff/                  | List staff                    | Office Staff |
| DELETE | /office/staff/                  | Delete staff                  | Office Staff |
| POST   | /office/staff/make-admin/       | Promote staff to admin        | Office Admin |
| GET    | /office/brand-types/            | List brand types              | Office Staff |
| GET    | /office/brands/                 | List brands (grouped by type) | Office Staff |
| POST   | /office/brands/                 | Create brand                  | Office Staff |
| POST   | /office/brands/{brand_id}/edit/ | Edit brand                    | Office Staff |

---

## 1. Get All Emails

---

## 2. Staff Management

### GET

/office/emails/

### Response

```
[
  {
    "name": "John Doe",
    "username": "john",
    "email": "john@email.com",
    "is_staff": true,
    "is_me": false
  }
]
```

---

## 2. Staff Management

### 2.1 Create Staff

### POST

/office/staff/

### Request Body

```
{
  "email": "staff@email.com",
  "designation": "Manager"
}
```

### Fields

| Field       | Type   | Required |
| ----------- | ------ | -------- |
| email       | string | yes      |
| designation | string | yes      |

### Response

```
{
  ...staff_details
}
```

---

### 2.2 Get All Staff

### GET

/office/staff/

### Response

```
[
  {
    ...staff_details
  }
]
```

---

### 2.3 Delete Staff

### DELETE

/office/staff/

### Request Body

```
{
  "staff_id": 5
}
```

### Response

```
200 OK
```

---

## 3. Brand Management

### 3.1 Get All Brands

### GET

/office/brands/

Returns a JSON object where keys are brand type names and values are arrays of brand records.
Each brand has the following shape:

```
{
    "brand_id": 9,
    "brand_type": "Shoes",
    "brand_type_id": 2,
    "name": "Dexter",
    "formal_name": "Dexter",
    "logo_url": "https://..."
}
```

Example:

```
{
  "Shoes": [ { ... }, { ... } ],
  "Apparels": [ { ... } ],
  "Balls": [ { ... } ],
  "Accessories": [ { ... } ],
  "Business Sponsors": [ { ... } ]
}
```

```
200 OK
```

---

### 2.4 Get Self Profile

### GET

/office/staff/self-profile

Fetches the profile information for the currently authenticated staff user. The response includes the staff's designation along with embedded `user` data.

### Response Example

```
{
    "staff_id": 1,
    "user": { ... },
    "designation": "VP of Tech"
}
```

---

### 2.5 Change Own Designation

### POST

/office/staff/change-designation

Allows a staff user to update their own `designation` string.

### Request Body

```
{
    "designation": "VP of Tech"
}
```

### Response

```
{
    "staff_id": 1,
    "designation": "VP of Tech"
}
```

---

## 3. Make Staff Office Admin

### POST

/office/staff/make-admin/

### Request Body

```
{
  "staff_id": 5
}
```

### Response

```
200 OK
```

---

## 4. Brand Types

### GET

/office/brand-types/

### Response

```
[
  {
    ...brand_type_details
  }
]
```

---

## 5. Brands

### 5.1 Get All Brands

### GET

/office/brands/

### Response

```
[
  {
    ...brand_details
  }
]
```

---

### 5.2 Create Brand

### POST

/office/brands/

### Request Body

```
{
  "brand_type_id": 1,
  "brand_data": {
    "name": "Nike",
    "formal_name": "Nike Inc.",
    "logo_url": "https://example.com/logo.png"
  }
}
```

### `brand_data` Fields

| Field       | Type   | Required |
| ----------- | ------ | -------- |
| name        | string | yes      |
| formal_name | string | yes      |
| logo_url    | string | yes      |

### Response

```
{
  ...brand_details
}
```

---

### 5.3 Edit Brand

### POST

/office/brands/{brand_id}/edit/

### Request Body

```
{
  "brand_type_id": 1,
  "brand_data": {
    "name": "Nike",
    "formal_name": "Nike Corporation",
    "logo_url": "https://example.com/logo.png"
  }
}
```

### Response

```
{
  ...brand_details
}
```

---

## Permission Summary

| Endpoint    | Required Role |
| ----------- | ------------- |
| Emails      | Office Staff  |
| Staff CRUD  | Office Staff  |
| Make Admin  | Office Admin  |
| Brand Types | Office Staff  |
| Brands      | Office Staff  |
