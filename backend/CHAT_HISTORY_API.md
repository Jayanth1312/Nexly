# Chat History API Documentation

## Overview

The chat history feature saves all conversations to MongoDB and provides endpoints to retrieve, search, and manage chat history.

## New API Endpoints

### 1. Get Chat History

**GET** `/chat-history/:sessionId`

Retrieve the complete chat history for a specific session.

**Parameters:**

- `sessionId` (path): The session identifier
- `limit` (query, optional): Maximum number of messages to return (default: 50)

**Example Request:**

```bash
curl -X GET "http://localhost:3001/chat-history/user-123?limit=20"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "user-123",
    "userId": "anonymous",
    "messages": [
      {
        "role": "user",
        "content": "What is machine learning?",
        "timestamp": "2025-07-19T10:30:00.000Z"
      },
      {
        "role": "assistant",
        "content": "Machine learning is a subset of artificial intelligence...",
        "timestamp": "2025-07-19T10:30:02.000Z",
        "sources": [],
        "responseType": "direct"
      }
    ],
    "totalMessages": 2,
    "createdAt": "2025-07-19T10:30:00.000Z",
    "lastActivity": "2025-07-19T10:30:02.000Z"
  },
  "timestamp": "2025-07-19T10:30:05.000Z"
}
```

### 2. Get User Sessions

**GET** `/sessions`

Retrieve all sessions for a user.

**Parameters:**

- `userId` (query, optional): User identifier (default: "anonymous")
- `limit` (query, optional): Maximum number of sessions to return (default: 20)

**Example Request:**

```bash
curl -X GET "http://localhost:3001/sessions?userId=user-123&limit=10"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "sessions": [
      {
        "sessionId": "session-1",
        "createdAt": "2025-07-19T10:00:00.000Z",
        "lastActivity": "2025-07-19T10:30:00.000Z",
        "totalMessages": 6
      }
    ],
    "totalSessions": 1
  },
  "timestamp": "2025-07-19T10:35:00.000Z"
}
```

### 3. Delete Chat History

**DELETE** `/chat-history/:sessionId`

Delete all chat history for a specific session.

**Parameters:**

- `sessionId` (path): The session identifier

**Example Request:**

```bash
curl -X DELETE "http://localhost:3001/chat-history/user-123"
```

**Example Response:**

```json
{
  "success": true,
  "message": "Chat history for session user-123 deleted successfully",
  "timestamp": "2025-07-19T10:40:00.000Z"
}
```

### 4. Search Messages

**GET** `/chat-history/:sessionId/search`

Search for specific messages within a session's chat history.

**Parameters:**

- `sessionId` (path): The session identifier
- `q` (query): Search query string
- `limit` (query, optional): Maximum number of results to return (default: 10)

**Example Request:**

```bash
curl -X GET "http://localhost:3001/chat-history/user-123/search?q=machine%20learning&limit=5"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "user-123",
    "searchQuery": "machine learning",
    "results": [
      {
        "role": "user",
        "content": "What is machine learning?",
        "timestamp": "2025-07-19T10:30:00.000Z",
        "sources": []
      }
    ],
    "totalResults": 1
  },
  "timestamp": "2025-07-19T10:45:00.000Z"
}
```

### 5. Get Chat Statistics

**GET** `/chat-stats`

Get overall statistics about the chat system.

**Example Request:**

```bash
curl -X GET "http://localhost:3001/chat-stats"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "totalSessions": 150,
    "totalMessages": 1250,
    "activeSessions": 25,
    "timestamp": "2025-07-19T10:50:00.000Z"
  },
  "timestamp": "2025-07-19T10:50:00.000Z"
}
```

## Updated Search Endpoint

The existing `/search` endpoint now accepts an optional `userId` parameter and automatically saves conversations to the database.

**POST** `/search`

**Updated Request Body:**

```json
{
  "query": "What is the weather like today?",
  "sessionId": "user-123",
  "userId": "user-456" // New optional parameter
}
```

## Database Schema

### ChatHistory Collection

```javascript
{
  sessionId: String,        // Session identifier
  userId: String,           // User identifier (default: "anonymous")
  messages: [{
    role: String,           // "user" or "assistant"
    content: String,        // Message content
    timestamp: Date,        // When the message was sent
    sources: [{             // Sources for assistant responses
      title: String,
      url: String
    }],
    responseType: String,   // "direct" or "search"
    processingTime: String  // How long the response took
  }],
  createdAt: Date,         // When the session was created
  updatedAt: Date,         // When the session was last updated
  metadata: {
    totalMessages: Number,  // Total number of messages
    lastActivity: Date,     // Last activity timestamp
    ipAddress: String,      // Client IP address
    userAgent: String       // Client user agent
  }
}
```

## Features

1. **Automatic Conversation Saving**: All conversations are automatically saved to MongoDB
2. **Session Management**: Each session maintains its own conversation history
3. **Search Functionality**: Search through messages within a session
4. **User Sessions**: Retrieve all sessions for a specific user
5. **Statistics**: Get overall chat system statistics
6. **Automatic Cleanup**: Old sessions (30+ days) are automatically cleaned up
7. **Fallback Support**: If database is unavailable, the system continues to work with in-memory storage
8. **Context Loading**: AI can load previous conversation context from the database

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

- **400**: Bad request (missing parameters, invalid data)
- **404**: Resource not found (session doesn't exist)
- **500**: Internal server error (database connection issues, etc.)

## Environment Variables

Make sure your `.env` file includes:

```env
MONGODB_URI="your-mongodb-connection-string"
```

The MongoDB URI is now a required environment variable. The application will not start without it.
