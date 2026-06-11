# Roomies

Roomies is a student roommate-matching web app for Korea.

## Tech Stack

- Frontend: React + TypeScript
- Backend: Express + TypeScript
- Database/Auth/Storage: Supabase

## Prerequisites

Before running the project, make sure you have:

- Node.js 18 or later
- npm
- A Supabase project

## Project Structure

- `frontend/` - React app
- `backend/` - Express API

## Setup

### 1. Clone the project

```bash
git clone https://github.com/bmzX14/sw.git
cd sw
```

### 2. Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

## Environment Variables

Create these files before running the project.

### `backend/.env`

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Setup

This project depends on Supabase for:

- authentication
- database tables
- storage buckets

Use an existing Supabase project with the required tables, auth settings, and storage buckets already configured.

Note:

- The current repository does not include the full initial Supabase schema.
- After registration, users must verify their email before logging in.

You should also make sure the required storage buckets exist:

- `profile-photos`
- `student-id-docs`
- `room-photos`

## Kakao Maps

The frontend uses Kakao Maps for location display and geocoding.

If needed, replace the Kakao Maps app key in:

- `frontend/public/index.html`

## Run the Project

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a new terminal:

```bash
cd frontend
npm start
```

## Local URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Build

Backend:

```bash
cd backend
npm run build
```

Frontend:

```bash
cd frontend
npm run build
```
