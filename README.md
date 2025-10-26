# LMS Platform - AI-Powered Learning Management System

A modern Learning Management System with AI-powered chat assistance for courses in AI, DevOps, Docker, and Kubernetes.

## 📸 Screenshots

### Landing Page

![Landing Page](screenshots/1.jpg)
_Clean, modern landing page with "Get Started" button_

### AI Chat Assistant

![AI Chat Interface](screenshots/2.jpg)
_Natural language chat interface with multiple AI models_

### Course Catalog

![Course Catalog](screenshots/3.jpg)
_Browse and filter courses by category and difficulty_

### My Enrollments

![My Enrollments](screenshots/4.jpg)
_Track your enrolled courses and progress_

## ✨ Features

- 🤖 **AI-Powered Chat Assistant** - Use natural language to discover and enroll in courses
- 🎯 **Smart Enrollment** - Simply say "enroll me in Docker" and the AI handles it
- 📚 **Course Catalog** - 10 pre-loaded courses in AI, DevOps, Docker, and Kubernetes
- 🎓 **Progress Tracking** - Monitor your learning journey with visual progress bars
- 💬 **Multi-Model Support** - Choose from Gemini, AWS Bedrock, or Mistral AI
- 🐳 **Fully Containerized** - One command to start everything with Docker
- 🎨 **Modern UI** - Clean, dark theme with excellent readability

## Tech Stack

### Backend

- FastAPI
- LangGraph for AI agent orchestration
- Tortoise ORM with Aerich migrations
- PostgreSQL database
- Multi-model AI support:
  - Google Gemini (2.5-pro, 2.5-flash, 2.5-flash-lite)
  - AWS Bedrock (Nova, Claude Sonnet)
  - Mistral AI

### Frontend

- Next.js 14
- TypeScript
- Tailwind CSS
- Axios for API calls

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed
- At least one AI API key (Gemini recommended - free tier available)

### Setup in 3 Steps

1. **Clone and configure**

   ```bash
   git clone <repository-url>
   cd lms-platform
   cp .env.example .env
   ```

2. **Add your API keys to `.env`**

   ```env
   GEMINI_API_KEY=your_key_here
   AWS_ACCESS_KEY_ID=your_key_here (optional)
   AWS_SECRET_ACCESS_KEY=your_key_here (optional)
   MISTRAL_API_KEY=your_key_here (optional)
   ```

3. **Start everything**
   ```bash
   docker-compose up -d --build
   ```

### Access Points

- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs

## 💡 How to Use

1. **Get Started** - Click the "Get Started" button on the landing page
2. **Enter Details** - Provide your name and email
3. **Chat with AI** - Ask questions like:
   - "What courses do you offer?"
   - "I want to learn Docker"
   - "Enroll me in Introduction to AI"
4. **Browse Courses** - Explore the course catalog and filter by category
5. **Track Progress** - View your enrollments and monitor your learning journey

## Database Migrations

Initialize database (first time only):

```bash
docker-compose exec backend aerich init-db
```

## API Endpoints

- `GET /api/courses` - List all courses
- `GET /api/courses/{id}` - Get course details
- `POST /api/students` - Create student
- `POST /api/enrollments` - Enroll in course
- `POST /api/chat` - Send message to AI assistant
- `GET /api/chat/models` - List available AI models

## Project Structure

```
lms-platform/
├── backend/
│   ├── ai/              # LangGraph agent and models
│   ├── api/             # FastAPI routes
│   ├── models.py        # Tortoise ORM models
│   ├── database.py      # DB initialization
│   └── main.py          # FastAPI app
├── frontend/
│   ├── app/             # Next.js pages
│   ├── components/      # React components
│   └── lib/             # API client
└── docker-compose.yml
```

## Development

To run in development mode with hot reload:

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## License

MIT
