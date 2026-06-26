# Admin API Design

This API covers endpoints accessible only to users with the `ADMIN` role. It includes the dashboard analytics engine, job listings creation and management, and candidate applications tracking.

---

## 1. Middleware Authorization
All admin endpoints must route through an authorization pipeline check:
1. `authMiddleware`: Extracts the JWT, validates it, and loads the user.
2. `adminMiddleware`: Assures that `req.user.role === 'ADMIN'`. If false, returns `403 Forbidden`.

---

## 2. API Endpoints Reference

### A. Dashboard Metrics & Analytics
Aggregates summary statistics, charts, history feeds, and lists.

* **Endpoint**: `GET /api/admin/dashboard/stats`
* **Access**: Protected (Admin only)
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "metrics": {
      "totalJobs": 1248,
      "activeJobs": 894,
      "totalUsers": 24580,
      "totalApplications": 8432,
      "changes": {
        "totalJobs": "+12%",
        "activeJobs": "+8%",
        "totalUsers": "+22%",
        "totalApplications": "+34%"
      }
    },
    "weeklyTrend": [
      { "day": "Mon", "value": 120 },
      { "day": "Tue", "value": 180 },
      { "day": "Wed", "value": 150 },
      { "day": "Thu", "value": 220 },
      { "day": "Fri", "value": 280 },
      { "day": "Sat", "value": 210 },
      { "day": "Sun", "value": 320 }
    ],
    "jobsByCategory": [
      { "category": "Frontend", "value": 248 },
      { "category": "Backend", "value": 312 },
      { "category": "Full Stack", "value": 186 },
      { "category": "DevOps", "value": 94 },
      { "category": "AI & ML", "value": 142 },
      { "category": "Mobile", "value": 88 }
    ],
    "recentActivity": [
      { "type": "JOB_POSTED", "description": "Spotify · UI/UX Designer", "timeAgo": "2m ago" },
      { "type": "APPLICATION_ACCEPTED", "description": "Karan Verma → Backend Engineer", "timeAgo": "1h ago" },
      { "type": "USER_SIGNUP", "description": "Sara Lee joined", "timeAgo": "3h ago" },
      { "type": "JOB_CLOSED", "description": "Google · Senior PM (filled)", "timeAgo": "5h ago" }
    ],
    "latestApplications": [
      {
        "id": "app-a1",
        "name": "Rohit Mehta",
        "job": "Senior Frontend Developer",
        "status": "Pending"
      },
      {
        "id": "app-a2",
        "name": "Sara Lee",
        "job": "ML Research Engineer",
        "status": "Reviewed"
      }
    ]
  }
  ```

---

### B. List Admin Jobs
Returns all jobs (including drafts and closed ones) with applicant counts.

* **Endpoint**: `GET /api/admin/jobs`
* **Access**: Protected (Admin only)
* **Query Parameters**: `search`, `category`, `experience`, `page`, `limit`
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "count": 6,
    "jobs": [
      {
        "id": "1",
        "title": "Senior Frontend Developer",
        "company": "Google",
        "companyColor": "from-blue-500 to-red-500",
        "companyInitial": "G",
        "category": "Frontend",
        "experience": "3-5 Years",
        "salary": "₹20 - 30 LPA",
        "status": "ACTIVE",
        "postedAt": "2026-06-26T18:00:00.000Z",
        "applicantsCount": 134
      }
    ]
  }
  ```

---

### C. Create Job Post
Publish a new job or save it as a draft.

* **Endpoint**: `POST /api/admin/jobs`
* **Access**: Protected (Admin only)
* **Request Body**:
  ```json
  {
    "companyName": "Linear",
    "title": "Senior Frontend Engineer",
    "category": "Frontend",
    "experience": "3-5 Years",
    "salary": "₹20 - 30 LPA",
    "location": "Bangalore, India",
    "type": "FULL_TIME",
    "remote": "REMOTE",
    "description": "Tell candidates what makes this role exciting...",
    "requirements": [
      "5+ years in React",
      "Strong design sense"
    ],
    "skills": ["React", "TypeScript", "Next.js"],
    "benefits": ["Equity", "Health", "Learning stipend"],
    "status": "ACTIVE" // Options: "ACTIVE" (publish) or "DRAFT" (save draft)
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Job listing created successfully.",
    "jobId": "8f3b7912-dfa4-473a-b851-4f18b3ffbc99"
  }
  ```

---

### D. Edit Job Post
Modify details of an existing job post.

* **Endpoint**: `PUT /api/admin/jobs/:id`
* **Access**: Protected (Admin only)
* **Request Body**: (Same structure as creation, partial parameters allowed for patching)
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Job listing updated successfully."
  }
  ```

---

### E. Delete Job Post
Permanently remove a job post.

* **Endpoint**: `DELETE /api/admin/jobs/:id`
* **Access**: Protected (Admin only)
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Job listing and associated applications deleted."
  }
  ```

---

### F. List Applications
Retrieve candidate applications for review.

* **Endpoint**: `GET /api/admin/applications`
* **Access**: Protected (Admin only)
* **Query Parameters**: `search`, `status`, `page`, `limit`
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "applications": [
      {
        "id": "app-a1",
        "name": "Rohit Mehta",
        "email": "rohit@mail.com",
        "phone": "+91 98765 43210",
        "job": "Senior Frontend Developer",
        "resumeUrl": "https://s3.ap-south-1.amazonaws.com/hirehub-resumes/rohit_mehta_resume.pdf",
        "status": "PENDING",
        "date": "2026-06-26T19:00:00.000Z"
      }
    ]
  }
  ```

---

### G. Change Application Status
Update the candidate's screening phase (e.g. from Pending to Reviewed, Accepted, or Rejected).

* **Endpoint**: `PATCH /api/admin/applications/:id/status`
* **Access**: Protected (Admin only)
* **Request Body**:
  ```json
  {
    "status": "ACCEPTED" // Options: "PENDING", "REVIEWED", "ACCEPTED", "REJECTED"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Application status updated to ACCEPTED."
  }
  ```
* **Error Response (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "error": "Invalid status value. Must be PENDING, REVIEWED, ACCEPTED, or REJECTED."
  }
  ```
