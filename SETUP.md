# LMS Platform Setup Guide

## Prerequisites

1. Docker Desktop installed and running
2. API keys for AI models (at least one):
   - Google Gemini API key
   - AWS credentials (for Bedrock)
   - Mistral API key

## Step-by-Step Setup

### 1. Get API Keys

#### Google Gemini (Recommended - Free tier available)
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key

#### AWS Bedrock (Optional)
1. Create AWS account
2. Enable Bedrock in us-east-1 region
3. Request access to Nova and Claude models
4. Create IAM user with Bedrock permissions
5. Generate access keys

#### Mistral AI (Optional)
1. Go to https://console.mistral.ai/
2. Create account and generate API key

### 2. Configure Environment

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```
   GEMINI_API_KEY=your_actual_gemini_key_here
   AWS_ACCESS_KEY_ID=your_aws_key (optional)
   AWS_SECRET_ACCESS_KEY=your_aws_secret (optional)
   MISTRAL_API_KEY=your_mistral_key (optional)
   ```

### 3. Start the Application

Run the startup script:

Windows:
```bash
start.bat
```

Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

Or manually:
```bash
docker-compose up -d --build
```

### 4. Access the Application

Wait 30-60 seconds for services to start, then open:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 5. First Time Use

1. Open http://localhost:3000
2. Enter your name and email on the landing page
3. Click "Start Learning"
4. You'll be taken to the dashboard with:
   - AI Assistant chat
   - Course catalog
   - Your enrollments

## Troubleshooting

### Database Connection Issues

If backend fails to start:
```bash
docker-compose down -v
docker-compose up -d --build
```

### View Logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Reset Everything

```bash
docker-compose down -v
docker volume rm lms-platform_postgres_data
docker-compose up -d --build
```

### Port Already in Use

If ports 3000, 5432, or 8000 are in use:

1. Stop the conflicting service
2. Or edit `docker-compose.yml` to use different ports

## Using the Platform

### Chat with AI Assistant

1. Go to "AI Assistant" tab
2. Select your preferred model (Gemini 2.5 Flash Lite is default)
3. Ask questions like:
   - "What courses do you offer?"
   - "I want to learn Docker"
   - "Show me beginner AI courses"
   - "Enroll me in Kubernetes course"

### Browse Courses

1. Go to "Course Catalog" tab
2. Filter by category (AI, DevOps, Docker, Kubernetes)
3. Click "Enroll Now" on any course

### Track Progress

1. Go to "My Enrollments" tab
2. View all enrolled courses
3. See progress and completion status

## Available AI Models

- **Gemini 2.5 Flash Lite** (Default) - Fast, efficient
- **Gemini 2.5 Flash** - Balanced performance
- **Gemini 2.5 Pro** - Most capable
- **AWS Bedrock Nova** - Amazon's model
- **AWS Bedrock Sonnet** - Claude 3.5 Sonnet
- **Mistral** - Mistral Large

## Stopping the Application

```bash
docker-compose down
```

To also remove data:
```bash
docker-compose down -v
```
