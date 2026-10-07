# NTP CRM

A full stack sales CRM to manage leads, contacts, notes and tasks, with a drag-and-drop sales pipeline, an analytics dashboard and AI-powered lead summaries, email drafts and sales insights (Google Gemini).

Built with the MERN stack: React (Vite) on the frontend, Node.js + Express + MongoDB on the backend.

## Features

- **Authentication:** register and login with JWT, protected routes, profile update
- **Leads:** create, edit, delete and filter leads with status, priority, source, deal value, tags and notes
- **Pipeline:** Kanban board (New, Qualified, Proposal, Won, Lost) with drag-and-drop reordering
- **Contacts, Notes and Tasks:** full CRUD, with task status (Pending, In Progress, Completed), priority and due dates
- **Dashboard:** stat cards and charts for the last six months, built from live data
- **AI assistant (Google Gemini):**
  - Lead summary with a risk score, suggested priority and next best action
  - Email draft generator (subject and body)
  - Sales insights with a headline, insights, recommendations and a health score
- **Per-user data:** every record belongs to its owner, so users only see their own data
- **UI:** responsive layout with reusable components, dialogs, skeleton loaders and toast notifications

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React (Vite), Tailwind CSS, React Router, React Hook Form, Axios, dnd-kit, Lucide icons, Sonner, date-fns |
| Backend | Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, CORS, Morgan |
| AI | Google Gemini API (`@google/genai`) with structured JSON responses |

## Project Structure

```
ntp-crm/
├── backend/
│   ├── server.js
│   └── src/
│       ├── config/        # MongoDB connection
│       ├── controllers/   # auth, leads, contacts, notes, tasks, analytics, ai
│       ├── middleware/    # auth (JWT) and error handling
│       ├── models/        # User, Lead, Contact, Note, Task
│       ├── routes/
│       ├── services/      # Gemini AI service
│       └── utils/         # ApiError, asyncHandler, generateToken
└── frontend/
    └── src/
        ├── components/    # ui, layout, leads, ai, common, dashboard
        ├── context/       # AuthContext
        ├── lib/           # api client, services, helpers
        └── pages/         # Dashboard, Leads, Pipeline, Contacts, Notes, Tasks, Settings, auth
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- A MongoDB database (local or MongoDB Atlas)
- A Google Gemini API key (optional, only needed for the AI features)

### 1. Clone the repository

```bash
git clone https://github.com/nishdev28/ntp-crm.git
cd ntp-crm
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `backend/.env` file:

```env
PORT=8000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ntp-crm
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional: enables the AI features
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash
```

Start the server:

```bash
npm run dev
```

The API runs at `http://localhost:8000`. Check `GET /api/health` to confirm.

### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create a `frontend/.env` file (optional, this is the default):

```env
VITE_API_URL=http://localhost:8000/api
```

Start the app:

```bash
npm run dev
```

Open `http://localhost:5173`, create an account and start adding leads.

## Environment Variables

| Variable | Where | Description |
| --- | --- | --- |
| `PORT` | backend | Server port (default `8000`) |
| `NODE_ENV` | backend | `development` enables request logging |
| `MONGO_URI` | backend | MongoDB connection string |
| `JWT_SECRET` | backend | Secret used to sign tokens |
| `JWT_EXPIRES_IN` | backend | Token lifetime, for example `7d` |
| `CLIENT_URL` | backend | Allowed CORS origin (default `http://localhost:5173`) |
| `GEMINI_API_KEY` | backend | Gemini API key for the AI features |
| `GEMINI_MODEL` | backend | Gemini model name |
| `VITE_API_URL` | frontend | Base URL of the API |

If `GEMINI_API_KEY` is missing, the AI endpoints return a clear error and the rest of the app keeps working.

## API Reference

All routes except register and login require the header `Authorization: Bearer <token>`.

| Resource | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/me` |
| Leads | `GET /api/leads`, `GET /api/leads/:id`, `POST /api/leads`, `PUT /api/leads/:id`, `DELETE /api/leads/:id`, `PATCH /api/leads/reorder` |
| Contacts | `GET /api/contacts`, `GET /api/contacts/:id`, `POST /api/contacts`, `PUT /api/contacts/:id`, `DELETE /api/contacts/:id` |
| Notes | `GET /api/notes`, `POST /api/notes`, `PUT /api/notes/:id`, `DELETE /api/notes/:id` |
| Tasks | `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id` |
| Analytics | `GET /api/analytics/overview` |
| AI | `GET /api/ai/status`, `POST /api/ai/lead-summary`, `POST /api/ai/generate-email`, `POST /api/ai/sales-insights` |
| Health | `GET /api/health` |

## Roadmap

- Role-based access for team members
- Email sending from the app
- Automated tests and CI

## Author

**Nireeksha Shetty**, Full Stack Developer
[LinkedIn](https://linkedin.com/in/nireeksha-shetty-a74137185) | [GitHub](https://github.com/nishdev28)
