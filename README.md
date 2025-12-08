# SSIS--Web-Application

# Student Management System

**Full-stack Student / College / Program Management**  
Backend: Flask + PostgreSQL  
Frontend: React + Bootstrap

---

## Table of Contents

1. [Project Overview](#project-overview)  
2. [Requirements](#requirements)  
3. [Environment variables](#environment-variables)  
4. [Database — PostgreSQL setup & schema](#database---postgresql-setup--schema)  
   - Schema SQL  
   - ERD (ASCII)  
5. [Backend (Flask) — Setup & Run](#backend-flask---setup--run)  
6. [Frontend (React) — Setup & Run](#frontend-react---setup--run)  
7. [API Documentation (summary table)](#api-documentation-summary-table)  
8. [Uploads / Static files](#uploads--static-files)  
9. [Troubleshooting & Notes](#troubleshooting--notes)  
10. [Useful links](#useful-links)  
11. [License](#license)

---

## Project Overview

This repository contains a small student management system split into two parts:

- `backend/` — Flask API that serves students, colleges, programs and users, stores uploaded profile images, and connects to PostgreSQL.
- `frontend/` — React (Create React App) SPA providing UI for managing students, colleges, programs.

Key features:
- Create / Read / Update / Delete (CRUD) for Students, Colleges, Programs, Users
- File upload for student profile images (served from `/uploads/<filename>`)
- Case-insensitive uniqueness checks on codes/names
- Pagination, search and sorting on frontend tables
- Simple authentication endpoint (plain text passwords in current code — **not** production-safe)

---

## Requirements

- Node.js (v14+ recommended) — for frontend
- npm (comes with Node.js) or Yarn
- Python 3.9+ (3.10/3.11 recommended)
- pipenv (used in this project; optional — you may use venv + pip)
- PostgreSQL (12+ recommended)
- Git

Useful installers:
- PostgreSQL: https://www.postgresql.org/download/
- Node.js: https://nodejs.org/
- pipenv: https://pipenv.pypa.io/en/latest/ (`pip install pipenv`)
- Bootstrap: https://getbootstrap.com

---

## Environment variables

Backend expects a `.env` file in the backend project root with the following values:

```env
DB_HOST=localhost
DB_NAME=student_system
DB_USER=bd_user_name
DB_PASSWORD=bd_password
DB_PORT=5432
JWT_SECRET_KEY=some_long_secret_here
FRONT_ORIGIN=http://127.0.0.1:3000

Frontend expects a `.env` file in the backend project root with the following values:

```env
DANGEROUSLY_DISABLE_HOST_CHECK=true

Database — PostgreSQL setup & schema

##Install PostgreSQL and create a database and user matching your .env values (or edit .env to match your DB). Example psql commands:
-- run as postgres superuser
```Query

CREATE DATABASE student_system;
CREATE USER postgres WITH PASSWORD 'password321';
GRANT ALL PRIVILEGES ON DATABASE student_system TO postgres;

##Connect to the database and create the tables. Example schema SQL (save as backend/schema.sql and run psql -d student_system -f backend/schema.sql):

```Query
-- backend/schema.sql
CREATE TABLE colleges (
  college_code TEXT PRIMARY KEY,
  college_name TEXT NOT NULL
);

CREATE TABLE programs (
  program_code TEXT PRIMARY KEY,
  program_name TEXT NOT NULL,
  college TEXT REFERENCES colleges(college_code) ON DELETE SET NULL
);

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT,
  year_level TEXT,
  course TEXT REFERENCES programs(program_code) ON DELETE SET NULL,
  college_code TEXT REFERENCES colleges(college_code) ON DELETE SET NULL,
  profile_image TEXT
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff'
);

Backend (Flask) — Setup & Run

Assuming you have Python and pipenv installed.

Open terminal and go to backend/ folder:

cd backend


Install dependencies and enter pipenv shell:

pipenv install
pipenv shell


If your project uses requirements.txt instead, use:

python -m venv venv
# Windows
.\venv\Scripts\activate
# macOS / Linux
source venv/bin/activate
pip install -r requirements.txt


Create .env in backend/ with the DB values (see Environment variables above).

Create tables (use the schema SQL above) and then start the server:

python app.py


This will run the Flask server (dev mode). Backend listens on port 5000 by default in this project.

Notes:

The backend registers blueprints under /api (e.g. /api/colleges, /api/programs, /api/students, /api/users).

Uploaded images are saved to an uploads/ directory in the backend root; ensure the server process has write permission.

Frontend (React) — Setup & Run

Open terminal and go to frontend/ folder:

cd frontend


Install dependencies:

npm install


Development server:

npm start


Production build:

npm run build


Notes:

If you use a proxy for API calls in package.json, make sure backend is running or adjust proxy settings.

If you changed the backend port or host, update fetch URLs in the frontend code (search for 127.0.0.1:5000 or /api/...).
