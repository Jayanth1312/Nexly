## Features

- Health check endpoint
- AI-powered search functionality
- Session management
- Memory service
- Groq integration

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Data models
├── prompts/         # AI prompts
├── routes/          # API routes
├── services/        # Business logic services
├── utils/           # Utility functions
├── package.json     # Dependencies and scripts
└── server.js        # Main server file
```

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

## Running the Application

```bash
cd backend
npm start
```

## API Endpoints

- `GET /health` - Health check endpoint
- Additional endpoints for search and session management

## Technologies Used

- Node.js
- Express.js
- Langchain
- Groq AI
- Exa Services
