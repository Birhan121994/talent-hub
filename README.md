# TalentHub - Job Portal Platform
TalentHub is a modern, full-stack job portal platform that connects developers with employers. It features a Django REST Framework backend and a Next.js/React frontend with Tailwind CSS.
## 🚀 Features
### For Job Seekers (Developers)
- Browse and search job listings with advanced filtering
- Apply to jobs with cover letters and resume uploads
- Personalized job recommendations based on skills
- Resume builder with multiple templates
- Application tracking dashboard
- User profile management
### For Employers
- Create and manage job postings  
- Review applications and manage candidate pipeline  
- Update application status (applied, shortlisted, rejected, hired)  
- Company profile management  
- Analytics on job post performance
## ⚙️ Technical Features

- **JWT Authentication**
- **Real-time notifications**
- **Advanced search and filtering**
- **Pagination and sorting**
- **File upload** (resumes, documents)
- **Responsive design**
- **RESTful API architecture**

---

## 🛠️ Tech Stack

### 🔧 Backend

- **Framework**: Django 4.2.7 + Django REST Framework  
- **Database**: PostgreSQL  
- **Authentication**: JWT (Simple JWT)  
- **File Storage**: Django default (configurable for cloud storage)  
- **CORS**: `django-cors-headers`  
- **PDF Generation**: ReportLab

### 🎨 Frontend

- **Framework**: Next.js 14 with React 18  
- **Styling**: Tailwind CSS  
- **Icons**: Lucide React  
- **HTTP Client**: Axios  
- **Form Handling**: React Hook Form  
- **Notifications**: React Toastify  
- **State Management**: React Context API

---

## 📦 Installation & Setup

### 🔍 Prerequisites

- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js 16+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

---
## 🚀 Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Birhan121994/talent-hub
cd talent-hub/backend
```
---
### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Variables
Create a .env file in the backend directory:

```bash
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=talenthub
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
```
### 5. Database Setup

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver
```

## 💻 Frontend Setup
### 1. Navigate to Frontend Directory

```bash
cd talent-hub/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 4. Run Development Server

```bash
npm run dev
```

## 🗄️ Database Schema

### 🔑 Key Models

- **User**:  
  Extended Django `User` model with:
  - Role (developer/employer)
  - Profile information
  - Resume

- **Job**:  
  Represents job postings with:
  - Title
  - Description
  - Requirements
  - Salary
  - Other relevant fields

- **Application**:  
  Tracks job applications with:
  - Applicant
  - Associated job
  - Application status

- **Resume**:  
  Stores and manages user resumes

---

## 🔌 API Endpoints

### 🔐 Authentication

- `POST /api/auth/register/` – User registration  
- `POST /api/auth/login/` – User login

### 💼 Jobs

- `GET /api/jobs/` – List all jobs (with filtering)  
- `POST /api/jobs/` – Create new job (employers only)  
- `GET /api/jobs/{id}/` – Get job details  
- `PUT /api/jobs/{id}/` – Update job (owner/admin only)  
- `DELETE /api/jobs/{id}/` – Delete job (soft delete)

### 📄 Applications

- `GET /api/applications/` – Get user's applications  
- `POST /api/applications/` – Apply for a job  
- `GET /api/applications/{id}/` – Get application details  
- `PUT /api/applications/{id}/` – Update application status

### 👤 User Management

- `GET /api/users/me/` – Get current user profile  
- `PUT /api/users/resume/upload/` – Upload resume  
- `DELETE /api/users/resume/upload/` – Delete resume  
- `GET /api/users/resume/download/` – Download resume

### 🧾 Resume Generation

- `POST /api/resume/generate/` – Generate PDF resume

---

## 🎨 Frontend Components

### 🧱 Core Components

- **Navbar** – Responsive navigation bar with user menu  
- **JobCard** – Card layout for job listings  
- **RichTextEditor** – WYSIWYG editor for job descriptions  
- **ConfirmationModal** – Reusable modal for confirmations  
- **ProtectedRoute** – Route protection based on user roles

### 📄 Pages

- **Home** – Landing page with featured jobs and statistics  
- **Jobs** – Job listing page with search and filtering  
- **Job Details** – Individual job view with application form  
- **Dashboard** – Role-based dashboard (developer/employer)  
- **Login/Register** – Authentication pages  
- **Post Job** – Job creation form (employers only)  
- **Edit Job** – Job editing interface

## 🔧 Configuration

### ⚙️ Backend Settings

Key configuration files:

- `backend/core/settings.py` – Django settings  
- `backend/requirements.txt` – Python dependencies  
- `backend/build.sh` – Render build script

### 🎨 Frontend Configuration

Key configuration files:

- `frontend/next.config.js` – Next.js configuration  
- `frontend/tailwind.config.js` – Tailwind CSS configuration  
- `frontend/postcss.config.js` – PostCSS configuration

---
