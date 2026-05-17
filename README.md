# Service_Request_Board

A full-stack Mini Service Request Board built for the **GlobalTNA Full-Stack Developer Intern Technical Assessment**.

This application allows homeowners to post service requests and allows tradespeople to browse open requests, view job details, update job status, and delete requests. The frontend communicates with a separate Express backend API, and the backend connects to MongoDB.

---

# Project Overview

Service Request Board is a small full-stack web application where users can:

- Register and login
- Browse service job requests
- Search jobs by title or description
- Filter jobs by category
- View full job details
- Post a new service request
- Update job status
- Delete job requests
- Seed sample jobs
- Run backend API tests

The project follows a simple architecture:

Next.js Frontend  →  Express Backend API  →  MongoDB Database

# Tech Stack
  ## Frontend
    Next.js
    React
    App Router
    Plain CSS
  ## Backend
    Node.js
    Express.js
    MongoDB
    Mongoose
    JWT Authentication
    bcryptjs
  ## Testing
    Jest
    Supertest
    mongodb-memory-server
    
# Main Features
  ## Public Features
    View all service requests
    Search jobs by title or description
    Filter jobs by category
    View job details
    Sort jobs by newest or oldest
  ## Authentication Features
    User registration
    User login
    JWT token-based authentication
    Logout functionality
    Navbar updates based on login status
  ## Protected Features
  - Only logged-in users can:
    - Post a new job request
    - Update job status
    - Delete a job request
  - Bonus Features Included:
    - JWT-based authentication
    - Unit/API tests using Jest and Supertest
    - Seed script to insert sample jobs
    - Keyword search across title and description
    
# Folder Structure
  Service_Request_Board/
  │
  ├── backend/
  │   ├── __tests__/
  │   │   └── jobRoutes.test.js
  │   ├── config/
  │   │   └── db.js
  │   ├── controllers/
  │   │   ├── authController.js
  │   │   └── jobController.js
  │   ├── middleware/
  │   │   ├── authMiddleware.js
  │   │   └── errorHandler.js
  │   ├── models/
  │   │   ├── JobRequest.js
  │   │   └── User.js
  │   ├── routes/
  │   │   ├── authRoutes.js
  │   │   └── jobRoutes.js
  │   ├── seed/
  │   │   └── seed.js
  │   ├── app.js
  │   ├── server.js
  │   ├── package.json
  │   └── .env
  │
  ├── frontend/
  │   ├── app/
  │   │   ├── components/
  │   │   │   └── AuthNav.js
  │   │   ├── jobs/
  │   │   │   ├── new/
  │   │   │   │   └── page.js
  │   │   │   └── [id]/
  │   │   │       └── page.js
  │   │   ├── login/
  │   │   │   └── page.js
  │   │   ├── register/
  │   │   │   └── page.js
  │   │   ├── globals.css
  │   │   ├── layout.js
  │   │   └── page.js
  │   ├── package.json
  │   └── .env.local
  │
  ├── .gitignore
  └── README.md

# Prerequisites
Before running this project, install:
  - Node.js
  - npm
  - Git
  - MongoDB Atlas account or local MongoDB
  - VS Code or any code editor

Check Node.js and npm versions:
  - node -v
  - npm -v
  
# Environment Variables
- Environment files are not included in GitHub for security reasons.
- You need to create the following files manually.

# Backend Environment Variables
- Create a .env file inside the backend folder:
  - backend/.env
    - PORT=5000
    - MONGO_URI=your_mongodb_connection_string
    - CLIENT_URL=http://localhost:3000
    - JWT_SECRET=your_jwt_secret_key
    - JWT_EXPIRES_IN=7d

# Frontend Environment Variables
- Create a .env.local file inside the frontend folder:
  - frontend/.env.local
    - NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Set up Instructions
## Backend Setup Instructions
- Go to the backend folder:
  cd backend
- Install dependencies:
  npm install
- Start the backend development server:
  npm run dev
- The backend will run on:
  http://localhost:5000
- Test the backend root route:
  http://localhost:5000

## Frontend Setup Instructions
- Open a new terminal and go to the frontend folder:
  cd frontend
- Install dependencies:
  npm install
- Start the frontend development server:
  npm run dev
- The frontend will run on:
  http://localhost:3000

# API Endpoints
## Auth Routes
  - POST	/api/auth/register	Register a new user
  - POST	/api/auth/login	Login user
  - GET	/api/auth/me	Get logged-in user details
## Job Routes
  - GET	/api/jobs	Public	Get all jobs
  - GET	/api/jobs/:id	Public	Get single job
  - POST	/api/jobs	Protected	Create new job
  - PATCH	/api/jobs/:id	Protected	Update job status
  - DELETE	/api/jobs/:id	Protected	Delete job

# Seed script to insert sample jobs.
Run:
  - cd backend
  - npm run seed

# Running Backend Tests
Run tests:
  - cd backend
  - npm test

# Tested endpoints include:
  - GET /api/jobs
  - GET /api/jobs?category=Plumbing
  - POST /api/jobs without JWT token
  - POST /api/jobs with JWT token
  - PATCH /api/jobs/:id with JWT token
  - DELETE /api/jobs/:id with JWT token

# Authentication Flow
- The application uses JWT-based authentication.
- User registers or logs in.
- Backend returns a JWT token.
- Frontend stores the token in localStorage.
- Protected API requests send the token in the Authorization header.
- Backend verifies the token before allowing create, update, or delete operations.

# GitHub Repository
https://github.com/KaushaniHettiarachchige/Service_Request_Board

# Deployment
- backend
  - Use Railway
  - live url : https://servicerequestboard-production.up.railway.app/
    
- frontend
  - Use Vercel
  - live url : https://service-request-board-two.vercel.app/Use Vercel
