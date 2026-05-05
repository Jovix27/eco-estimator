# GBAI Estimation

AI-first, cloud-native estimating platform for construction projects.

## Overview

GBAI Estimation automates accurate Quantity Takeoffs (QTOs) from 2D/3D drawings, keeps rates live, quantifies uncertainty, and delivers tender-ready BOQs with traceable audit trails and compliance for Indian construction standards.

## Core Value Propositions

1. **Save Estimator Time** - Automated QTO with quick manual correction
2. **Reduce Bid Risk** - ML uncertainty quantification + historic calibration  
3. **Close Procurement Loop** - Live supplier/rate feeds + exports/APIs

## Tech Stack

### Frontend (`/client`)
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS v4 for styling
- Lucide React for icons
- Framer Motion for animations

### Backend (`/server`)
- FastAPI (Python 3.10+)
- Supabase for database and auth
- PostgreSQL for data persistence
- Redis for caching (planned)

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Git

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd eco-estimator
```

2. Install frontend dependencies:
```bash
cd client
npm install
```

3. Install backend dependencies:
```bash
cd server
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

4. Configure environment:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Development

Start both servers:

```bash
# Terminal 1 - Frontend (http://localhost:5173)
cd client
npm run dev

# Terminal 2 - Backend (http://localhost:8000)
cd server
.\venv\Scripts\activate
uvicorn main:app --reload
```

## Project Structure

```
eco-estimator/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── stores/         # State management
│   │   └── utils/          # Utility functions
│   └── public/
├── server/                 # FastAPI backend
│   ├── api/                # API routes
│   ├── models/             # Pydantic models
│   ├── services/           # Business logic
│   ├── db/                 # Database utilities
│   └── ml/                 # ML/CV services
└── docs/                   # Documentation
```

## API Documentation

When running the backend, access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

© 2026 Green Build AI. All rights reserved.
