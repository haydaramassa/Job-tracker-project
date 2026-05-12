# Job Tracker Project

A full-stack web application for tracking job applications in a clean, organized, and professional way.

## Live Demo

[Open Live Demo](https://haydara-job-tracker-demo.netlify.app)

> Note: The backend is hosted on Render free tier.  
> The first login or registration request may take 30–60 seconds if the server is sleeping.  
> If you see a temporary error, wait a moment and try again.

---

## Project Status

The project is deployed and the core features are working.

Current production setup:

- Frontend: React / Vite deployed on Netlify
- Backend: Spring Boot deployed on Render
- API routing: Netlify proxy redirects `/api/*` requests to the Render backend

---

## Features

- User registration
- User login
- Password strength validation
- Local user session using `localStorage`
- Add job applications
- View job applications by logged-in user
- Edit job applications
- Delete job applications
- Mark jobs as favorite
- Archive and unarchive jobs
- Search by company or position
- Filter by status and priority
- Sort job applications
- Dashboard statistics
- Kanban board
- Analytics page
- Responsive and clean UI

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- React Router DOM

### Backend

- Java
- Spring Boot
- Spring Data JPA
- Spring Security Crypto

### Database

- MySQL
- H2 used in development/demo configuration

### Deployment

- Netlify for frontend hosting
- Render for backend hosting
- Netlify proxy redirects for API requests

---

## Project Structure

```txt
job-tracker-project
├── job-tracker-backend
└── job-tracker-frontend
ذ
```

## Pages

- Authentication Page
- Dashboard Page
- Job Details Page
- Kanban Board Page
- Analytics Page

---

## Authentication

The application includes:

- Register
- Login
- Password validation
- Password strength feedback
- Session persistence with `localStorage`

After a successful login, the user is redirected to the dashboard.

---

## Job Management

Each logged-in user can:

- Create job applications
- View only their own jobs
- Edit their own jobs
- Delete their own jobs
- Mark jobs as favorite
- Archive and unarchive jobs

---

## Job Fields

Each job application contains:

- Company
- Position
- Status
- Priority
- Source
- Company Link
- Date Applied
- Interview Date
- Follow Up Date
- Notes

---

## Status Options

- Applied
- Interview
- Accepted
- Rejected

---

## UI Features

- Sidebar navigation
- Dashboard summary cards
- Search and filter section
- Sort options
- Styled job cards
- Color-coded status badges
- Priority badges
- Scroll-to-top button
- Friendly validation messages
- Empty states
- Notes preview

---

## Dashboard Widgets

- Upcoming Interviews
- Upcoming Follow-ups
- Overdue Follow-ups
- Recent Activity

---

## API Proxy Setup

The frontend uses a Netlify proxy so the browser calls:

```txt
/api/auth/register
/api/auth/login
```

Netlify redirects these requests to the backend on Render:

```txt
https://job-tracker-backend-gftl.onrender.com
```

This avoids CORS issues in production.

---

## Screenshots

### Login Page

![Login Page](./Login.png)

### Registration Page

![Registration Page](./registration.png)

### Dashboard

![Dashboard 1](./Dashboard1.png)

![Dashboard 2](./Dashboard2.png)

![Dashboard 3](./Dashboard3.png)

### Analytics

![Analytics](./Analytics.png)

### Kanban Board

![Kanban Board](./KanbanBoard.png)

---

## Future Improvements

- JWT authentication
- Better backend validation
- Email reminders
- Drag-and-drop Kanban board
- Docker support
- Persistent production database improvements
- Better error messages for login and registration

---

## Author

**Haydara Massa**

GitHub: [@haydaramassa](https://github.com/haydaramassa)
