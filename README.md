# AI Model Battle

A production-ready MERN stack application where two AI models compete on the same prompt and a third AI judge declares the winner.

## Features

- **Authentication** — JWT + bcrypt signup/login with protected routes
- **Dashboard** — total battles, win rate, most accurate AI, total tokens used, recent battles
- **AI Battle** — pick two models, enter a prompt, both generate answers side-by-side, a judge model scores them on accuracy, completeness, clarity, and creativity
- **File Upload** — upload a PDF or image; both models analyze the content before judging
- **Battle History** — every battle saved to MongoDB, searchable, deletable, exportable as TXT
- **Settings** — edit profile, change password, sign out
- **UI** — dark/light mode, glassmorphism, Framer Motion animations, skeleton loaders, copy buttons, winner/loser badges, fully responsive

## Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, React Router, Sonner, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcryptjs |
| AI | OpenAI API (with built-in demo fallback) |

## Project Structure

```
AI-Model-Battle/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
├── README.md
└── .gitignore
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Backend

```bash
cd backend
npm install
```

Edit `backend/.env`:

```
MONGO_URI=mongodb://127.0.0.1:27017/ai_model_battle
JWT_SECRET=change_this_to_a_long_random_secret_string
OPENAI_API_KEY=sk-your-key-here
```

> If you don't have an OpenAI key yet, leave the placeholder — the app runs in **demo mode** with simulated responses so you can explore the full UI immediately. Add a real key later to get genuine model answers.

Start the backend:

```bash
npm run dev
```

Server runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
```

`frontend/.env` is preconfigured to point at the local backend:

```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

App runs on `http://localhost:5173`.

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/signup` | — | Create account, returns JWT |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✓ | Current user |
| POST | `/api/battles` | ✓ | Run a battle (multipart: prompt + optional file) |
| GET | `/api/battles/stats` | ✓ | Dashboard stats |
| GET | `/api/history` | ✓ | List battles (`?q=` to search) |
| GET | `/api/history/:id` | ✓ | Single battle |
| DELETE | `/api/history/:id` | ✓ | Delete one battle |
| DELETE | `/api/history` | ✓ | Clear all history |
| PUT | `/api/users/profile` | ✓ | Update name |
| PUT | `/api/users/password` | ✓ | Change password |

## How the AI battle works

1. You enter a prompt and optionally upload a PDF or image.
2. The backend sends the prompt to **Model A** and **Model B** in parallel via the OpenAI API.
3. Both responses come back with latency and token counts.
4. The **Judge model** receives both responses plus the original prompt and returns structured JSON: per-criterion scores (0–10), a winner (`A`, `B`, or `tie`), and a written explanation.
5. The battle (prompt, both responses, scores, verdict, tokens) is saved to MongoDB.
6. The frontend renders the side-by-side arena, animated score bars, winner badges, and the judge's explanation.

## License

MIT — use it, fork it, put it in your portfolio.
