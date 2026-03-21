# Gemini AI Integration Setup Guide

## Overview
The DietAmigo app now uses Google's Gemini AI models for intelligent diet recommendations with automatic fallback support between Gemini Pro and Flash 2.5 models.

## Features Implemented

### 🤖 AI Models Support
- **Primary Model**: `gemini-2.5-pro` - Advanced reasoning and comprehensive responses
- **Fallback Model**: `gemini-2.5-flash` - Faster responses when Pro is unavailable
- **Automatic Fallback**: Seamlessly switches between models based on availability

### 🔧 API Configuration
- RESTful API endpoint: `/api/chat`
- POST requests with user profile and conversation context
- GET requests for health checks
- Environment variable configuration

### 🛡️ Error Handling
- Network error resilience
- Model availability detection
- Graceful degradation to offline calculations
- User-friendly error messaging

### 🎯 Smart Context Management
- User profile integration (BMI, BMR, dietary restrictions)
- Conversation history for contextual responses
- Personalized diet recommendations
- Follow-up question handling

## Setup Instructions

### 1. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the generated key

### 2. Configure Environment Variables
1. Open `.env.local` file
2. Add your API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

### 3. Test the Integration
1. Start the development server: `npm run dev`
2. Navigate to `/diet-recommender`
3. Look for the green "AI Online" indicator in the header
4. Test with sample user input

## API Endpoints

### POST /api/chat
**Request Body:**
```json
{
  "message": "User's question or request",
  "userProfile": {
    "weight": 70,
    "height": 1.75,
    "age": 25,
    "activityLevel": "moderate",
    "dietaryRestrictions": ["vegetarian"]
  },
  "conversationHistory": [
    {
      "sender": "user",
      "text": "Previous message",
      "timestamp": "2025-10-03T..."
    }
  ]
}
```

**Response:**
```json
{
  "response": "AI generated response",
  "model": "gemini-2.5-pro",
  "timestamp": "2025-10-03T..."
}
```

### GET /api/chat
Health check endpoint returning service status and available models.

## UI Features

### Status Indicator
- 🟢 **Green**: AI Online (Gemini models available)
- 🟡 **Yellow**: Connecting... (API request in progress)
- 🟠 **Orange**: Fallback Mode (Using offline calculations)
- 🔴 **Red**: Offline (Service unavailable)

### Fallback Behavior
When AI services are unavailable:
- Basic BMI/BMR calculations still work
- Provides general dietary guidelines
- Suggests trying again later
- Maintains full UI functionality

## Model Configuration

Both models use optimized settings:
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Top P**: 0.8 (focused on likely responses)
- **Top K**: 40 (reasonable vocabulary breadth)
- **Max Tokens**: 2048 (comprehensive responses)

## Security Notes
- API keys are server-side only (not exposed to client)
- Request validation on all endpoints
- Error messages don't expose sensitive information
- Rate limiting ready for implementation

## Troubleshooting

### Common Issues
1. **"AI Service Temporarily Unavailable"**
   - Check API key configuration
   - Verify internet connection
   - Check Google AI Studio for service status

2. **"Gemini API key not configured"**
   - Ensure `.env.local` has `GEMINI_API_KEY`
   - Restart development server after adding key

3. **Slow Responses**
   - Normal for complex diet analysis
   - Pro model prioritized for quality
   - Flash model used for faster fallback

### Testing Without API Key
The app gracefully degrades to offline mode, providing:
- BMI/BMR calculations
- Basic diet guidelines
- Full UI functionality
- Encouraging retry messages

## Future Enhancements
- Response caching for repeated questions
- User preference learning
- Integration with nutrition databases
- Recipe suggestions with ingredients
- Meal planning calendar integration