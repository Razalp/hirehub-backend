# Candidate Applications API Design

This API covers how candidates submit job applications, upload CVs/resumes, and track their application statuses.

---

## 1. File Upload Strategy
Resumes are uploaded using the Express `multer` middleware. In production, this uploads files to cloud storage (e.g. AWS S3, Google Cloud Storage, or Azure Blob) and returns a URL. During development, it can save files locally in an `uploads/` directory.

- **Acceptable File Types**: `.pdf`, `.docx`, `.doc`.
- **Maximum File Size**: 5 MB.
- **Header**: Requests submitting files must use `Content-Type: multipart/form-data`.

---

## 2. API Endpoints Reference

### A. Apply for a Job
Submit a job application. The candidate can either supply a new resume file or request to use the resume from their profile.

* **Endpoint**: `POST /api/jobs/:id/apply`
* **Access**: Protected (Candidate role recommended, but allows optional guest submissions if authentication is not strictly enforced).
* **Request Format**: `multipart/form-data`
* **Request Fields**:
  - `name` (string, required): Full name of the applicant.
  - `email` (string, required): Email address.
  - `phone` (string, required): Phone number (e.g., `+91 98765 43210`).
  - `coverLetter` (string, optional): Cover letter statement.
  - `resume` (file, required unless using saved profile resume): Binary file of the PDF/Word document.
  - `useProfileResume` (boolean, optional): If `true`, the system ignores the uploaded file and pulls the resume URL from the Candidate's profile.

* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Application submitted successfully.",
    "application": {
      "id": "app-8d2a6b2c-b03a-4ef8-82ea-29a3a60a7e0a",
      "jobId": "1e1c7f51-df54-473d-82d6-4447ab08ad11",
      "candidateId": "c0e68e1a-c0b7-4c07-b844-42b78d212711",
      "name": "Rohit Mehta",
      "email": "rohit@mail.com",
      "phone": "+91 98765 43210",
      "resumeUrl": "https://s3.ap-south-1.amazonaws.com/hirehub-resumes/rohit_mehta_resume.pdf",
      "status": "PENDING",
      "createdAt": "2026-06-26T18:15:30.000Z"
    }
  }
  ```
* **Error Response (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "error": "You have already applied for this job."
  }
  ```
* **Error Response (`422 Unprocessable Entity` - File Upload error)**:
  ```json
  {
    "success": false,
    "error": "Unsupported file format. Only PDF and Word documents are allowed."
  }
  ```

---

### B. Get My Applications
Allows candidates to track jobs they've applied for.

* **Endpoint**: `GET /api/applications/my`
* **Access**: Protected (Candidate role required)
* **Headers**: `Authorization: Bearer <jwt_token>`
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "applications": [
      {
        "id": "app-8d2a6b2c-b03a-4ef8-82ea-29a3a60a7e0a",
        "status": "PENDING",
        "createdAt": "2026-06-26T18:15:30.000Z",
        "job": {
          "id": "1e1c7f51-df54-473d-82d6-4447ab08ad11",
          "title": "Senior Frontend Developer",
          "location": "Bangalore, India",
          "salary": "₹20 - 30 LPA",
          "company": {
            "name": "Google",
            "initial": "G",
            "color": "from-blue-500 to-red-500"
          }
        }
      }
    ]
  }
  ```

---

### C. Newsletter Subscription
Subscribe to the mailing list for job opportunities.

* **Endpoint**: `POST /api/newsletter/subscribe`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "candidate@gmail.com"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Subscribed successfully! Check your inbox for weekly curations."
  }
  ```
* **Error Response (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "error": "Email is already subscribed."
  }
  ```
