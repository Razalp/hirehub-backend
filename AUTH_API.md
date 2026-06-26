# Authentication API Design

This API manages user credentials, registrations, logins (for candidates and admins), session verification, and profile association.

---

## 1. Auth Flow Overview

- Authentication is handled using **JSON Web Tokens (JWT)**.
- JWTs should be sent in an `Authorization: Bearer <token>` header or via HTTP-only Cookies (recommended for web clients).
- Passwords are encrypted using **bcrypt** (minimum 12 salt rounds).
- Public access is allowed for public endpoints, while protected endpoints use `authMiddleware` and `adminMiddleware` to verify authorization levels.

---

## 2. API Endpoints Reference

### A. Candidate Registration
Create a new candidate account.

* **Endpoint**: `POST /api/auth/register`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@company.com",
    "password": "SecurePassword123"
  }
  ```
* **Validation Rules**:
  - `name`: String, minimum 2 characters, required.
  - `email`: Valid email format, required, must be unique in database.
  - `password`: String, minimum 8 characters, containing at least one letter and number.
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Account created successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c0e68e1a-c0b7-4c07-b844-42b78d212711",
      "name": "Jane Doe",
      "email": "jane@company.com",
      "role": "CANDIDATE"
    }
  }
  ```
* **Error Response (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "error": "Email address already registered."
  }
  ```

---

### B. Candidate Login
Authenticate an existing candidate.

* **Endpoint**: `POST /api/auth/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "jane@company.com",
    "password": "SecurePassword123"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c0e68e1a-c0b7-4c07-b844-42b78d212711",
      "name": "Jane Doe",
      "email": "jane@company.com",
      "role": "CANDIDATE"
    }
  }
  ```
* **Error Response (`401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "error": "Invalid email or password."
  }
  ```

---

### C. Admin Login
Authenticate an administrative account.

* **Endpoint**: `POST /api/admin/auth/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "admin@hirehub.com",
    "password": "AdminSecretPassword"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "a90dfb22-823a-4ef8-82ea-29a3a60a7e0a",
      "name": "HireHub Admin",
      "email": "admin@hirehub.com",
      "role": "ADMIN"
    }
  }
  ```
* **Error Response (`403 Forbidden`)**:
  ```json
  {
    "success": false,
    "error": "Access denied. Insufficient administrative privileges."
  }
  ```

---

### D. Verify Current Session (Me)
Retrieve details of the currently logged-in user.

* **Endpoint**: `GET /api/auth/me`
* **Access**: Protected (Bearer Token)
* **Headers**: `Authorization: Bearer <jwt_token>`
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "c0e68e1a-c0b7-4c07-b844-42b78d212711",
      "name": "Jane Doe",
      "email": "jane@company.com",
      "role": "CANDIDATE",
      "profile": {
        "id": "3be55c0e-45ad-4d40-bfae-4f18b3ffb9e6",
        "phone": "+91 98765 43210",
        "resumeUrl": "https://s3.ap-south-1.amazonaws.com/hirehub-resumes/resume.pdf",
        "skills": ["React", "TypeScript", "Next.js"],
        "experienceLevel": "3-5 Years",
        "currentSalary": "₹20 - 30 LPA",
        "preferredLocation": "Bangalore, India",
        "jobType": "Full Time",
        "isRemoteOnly": true
      }
    }
  }
  ```
* **Error Response (`401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "error": "Token expired or invalid signature."
  }
  ```

---

## 3. JWT Payload Structure

The JWT token contains the following claim keys inside the payload:

```json
{
  "userId": "c0e68e1a-c0b7-4c07-b844-42b78d212711",
  "role": "CANDIDATE",
  "iat": 1782390000,
  "exp": 1782476400
}
```

- `userId`: maps to user's UUID.
- `role`: maps to standard role type enum (`CANDIDATE` or `ADMIN`).
- Token validation middleware checks if `role === 'ADMIN'` for accessing admin pathways.
