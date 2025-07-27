# Hallo - Alzheimer's Caregiver Assistant 

## Project Overview

**Hallo** is an innovative AI-powered companion designed specifically for elderly patients with Alzheimer's disease and their caregivers. This application combines technology with compassionate care to provide 24/7 support, medication reminders, and emotional companionship.

## Technical Aspects

### AI Integration
- **Gemini AI Integration**: Utilizes Google's Gemini model for contextual, empathetic conversations
- **Bidirectional Voice Interface**: Real-time Speech-to-Text and Text-to-Speech using Gemini AI APIs
- **Contextual Memory**: AI remembers patient details, family members, and personal history for personalized interactions
- **Sentiment Analysis**: Tracks emotional states and conversation patterns for caregiver insights

### Backend Architecture
- **MongoDB**: Cloud-native database with user authentication and data persistence
- **RESTful API**: Express.js backend with JWT authentication and comprehensive error handling
- **Real-time Reminders**: Medication scheduling with timezone awareness
- **Analytics Dashboard**: Conversation logging and interaction analytics for caregivers

### Frontend Stack
- **React 18 + TypeScript**:
- **Tailwind CSS**: 
- **Real-time Audio Processing**: 

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### Environment Setup
1. Clone the repository
2. Fill in your credentials in `.env`:
```bash
# Backend Configuration
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key

# Frontend Configuration
VITE_API_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Installation & Running
```bash
# Install dependencies for both frontend and backend
npm install
cd server && npm install && cd ..

# Run both frontend and backend concurrently
npm run dev:full

# Or run separately:
npm run dev:server  
npm run dev         
```
