# Jobs & Categories API Design

This API covers public job searches, filtering, category aggregations, individual listing details, and job bookmarking.

---

## 1. API Endpoints Reference

### A. List & Filter Jobs
Retrieve a list of jobs based on filters such as search keywords, location, salary, experience, categories, and tags.

* **Endpoint**: `GET /api/jobs`
* **Access**: Public
* **Query Parameters**:
  - `search` (string, optional): Keywords matching job titles, company names, skills, or descriptions.
  - `category` (string, optional): Filter by job category (e.g., `Frontend`, `Backend`, `DevOps`).
  - `experience` (string, optional): Filter by experience level (e.g., `Fresher`, `1-3 Years`, `3-5 Years`, `5-10 Years`, `10+ Years`).
  - `location` (string, optional): Location matching city, state, or country.
  - `type` (string, optional): Comma-separated list of job types (e.g., `FULL_TIME,CONTRACT`).
  - `remoteOnly` (boolean, optional): Set to `true` to filter for remote roles only.
  - `minSalary` (number, optional): Minimum budget range (in INR LPA or USD).
  - `maxSalary` (number, optional): Maximum budget range.
  - `sort` (string, optional): Sorting criteria. Options: `latest` (default), `popular` (by applicant count).
  - `page` (number, optional): Pagination index. Default is `1`.
  - `limit` (number, optional): Pagination capacity. Default is `10`.

* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "count": 1248,
    "pagination": {
      "currentPage": 1,
      "totalPages": 125,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "jobs": [
      {
        "id": "1e1c7f51-df54-473d-82d6-4447ab08ad11",
        "title": "Senior Frontend Developer",
        "company": {
          "name": "Google",
          "initial": "G",
          "color": "from-blue-500 to-red-500"
        },
        "location": "Bangalore, India",
        "experience": "3-5 Years",
        "salary": "₹20 - 30 LPA",
        "type": "FULL_TIME",
        "remote": "REMOTE",
        "skills": ["React", "TypeScript", "Next.js", "GraphQL"],
        "category": "Frontend",
        "featured": true,
        "postedAt": "2026-06-26T18:00:00.000Z",
        "applicantsCount": 134
      }
    ]
  }
  ```

---

### B. Featured Jobs
Get featured jobs for the landing page (Home).

* **Endpoint**: `GET /api/jobs/featured`
* **Access**: Public
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "jobs": [
      {
        "id": "1e1c7f51-df54-473d-82d6-4447ab08ad11",
        "title": "Senior Frontend Developer",
        "company": {
          "name": "Google",
          "initial": "G",
          "color": "from-blue-500 to-red-500"
        },
        "location": "Bangalore, India",
        "experience": "3-5 Years",
        "salary": "₹20 - 30 LPA",
        "type": "FULL_TIME",
        "remote": "REMOTE",
        "skills": ["React", "TypeScript", "Next.js"],
        "category": "Frontend",
        "featured": true,
        "postedAt": "2026-06-26T18:00:00.000Z",
        "applicantsCount": 134
      }
    ]
  }
  ```

---

### C. Browse by Category (Counts)
Get active job counts aggregated by category.

* **Endpoint**: `GET /api/jobs/categories`
* **Access**: Public
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "categories": [
      { "name": "Frontend", "count": 248, "icon": "Layout" },
      { "name": "Backend", "count": 312, "icon": "Server" },
      { "name": "Full Stack", "count": 186, "icon": "Layers" },
      { "name": "DevOps", "count": 94, "icon": "Cloud" },
      { "name": "AI & ML", "count": 142, "icon": "Brain" },
      { "name": "Mobile", "count": 88, "icon": "Smartphone" }
    ]
  }
  ```

---

### D. Get Job Details
Retrieve all fields for a specific job post, plus related recommended roles.

* **Endpoint**: `GET /api/jobs/:id`
* **Access**: Public
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "job": {
      "id": "1e1c7f51-df54-473d-82d6-4447ab08ad11",
      "title": "Senior Frontend Developer",
      "company": {
        "name": "Google",
        "initial": "G",
        "color": "from-blue-500 to-red-500",
        "industry": "Technology",
        "size": "10,000+",
        "website": "google.com"
      },
      "location": "Bangalore, India",
      "experience": "3-5 Years",
      "salary": "₹20 - 30 LPA",
      "type": "FULL_TIME",
      "remote": "REMOTE",
      "skills": ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Jest"],
      "category": "Frontend",
      "postedAt": "2026-06-26T18:00:00.000Z",
      "description": "Join Google's Search team to build elegant, performant interfaces used by billions...",
      "requirements": [
        "5+ years of React/TypeScript experience",
        "Deep understanding of modern web performance",
        "Strong design taste and CSS fundamentals",
        "Experience with SSR frameworks like Next.js"
      ],
      "responsibilities": [
        "Architect new product surfaces from idea to launch",
        "Collaborate with designers on motion and interaction",
        "Mentor engineers across the org",
        "Own observability and quality for your slice"
      ],
      "benefits": [
        "Equity",
        "Health, dental & vision",
        "Learning stipend",
        "Unlimited PTO"
      ],
      "applicantsCount": 134,
      "isBookmarked": false
    },
    "relatedJobs": [
      {
        "id": "3b2e5912-dfa4-473a-b851-4f18b3ffbc99",
        "title": "UI/UX Designer",
        "company": {
          "name": "Spotify",
          "initial": "S",
          "color": "from-green-500 to-green-700"
        },
        "location": "Bangalore, India",
        "experience": "2-4 Years",
        "salary": "₹12 - 18 LPA",
        "type": "FULL_TIME",
        "remote": "HYBRID",
        "category": "Design"
      }
    ]
  }
  ```
* **Error Response (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "error": "Job listing not found."
  }
  ```

---

### E. Bookmark / Unbookmark Job
Save jobs to the user profile or remove saved jobs.

* **Endpoints**: 
  - Save: `POST /api/jobs/:id/bookmark`
  - Remove: `DELETE /api/jobs/:id/bookmark`
* **Access**: Protected (Candidate Role required)
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Job bookmarked successfully."
  }
  ```
* **Error Response (`401 Unauthorized` / `404 Not Found`)**:
  - Missing token.
  - Job ID doesn't exist.
