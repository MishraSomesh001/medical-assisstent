# OpenAI GPT-4o Integration Setup

## Overview
This medical assistant uses OpenAI's GPT-4o model to provide intelligent, context-aware responses to health-related questions.

## Features
- ✅ GPT-4o powered medical chat
- ✅ Context retention across conversation
- ✅ Medical-specific system prompts
- ✅ Quick action buttons for common queries
- ✅ Real-time streaming responses
- ✅ Comprehensive medical disclaimers

## Setup Instructions

### 1. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### 2. Add API Key to Environment
Update your `.env.local` file:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Verify Setup
The system will automatically validate the API key when you try to use the chat feature.

## Usage

### Accessing the Chat
1. Sign in to your account
2. Go to Dashboard
3. Click "Start Chat" in the AI Assistant section
4. Or navigate directly to `/chat`

### Quick Actions
The chat interface includes quick action buttons for:
- 🩺 Symptom Checker
- 💪 Wellness Tips  
- 🥗 Nutrition Advice
- 🏃‍♂️ Exercise Guidance
- 🧠 Mental Health
- 💊 Medication Info

### Chat Features
- **Context Awareness**: The AI remembers previous messages in the conversation
- **Medical Focus**: Specialized prompts for health-related discussions
- **Safety First**: Built-in disclaimers and recommendations to consult professionals
- **Real-time**: Instant responses with loading indicators

## API Configuration

### Model Settings
- **Model**: GPT-4o (latest OpenAI model)
- **Max Tokens**: 1000 per response
- **Temperature**: 0.7 (balanced creativity/accuracy)
- **Context Window**: Last 10 messages for conversation history

### System Prompt
The AI is configured with a comprehensive medical system prompt that:
- Emphasizes it's for general information only
- Recommends professional medical consultation
- Provides empathetic, helpful responses
- Asks clarifying questions when needed
- Suggests emergency services when appropriate

## Security & Privacy

### Data Handling
- Messages are not stored permanently
- Conversation history is limited to current session
- No personal health data is retained
- API calls are made server-side for security

### Rate Limiting
- Built-in error handling for API limits
- Graceful degradation when service is unavailable
- User-friendly error messages

## Cost Management

### Token Usage
- Responses limited to 1000 tokens
- Context limited to last 10 messages
- Efficient prompt engineering to minimize costs

### Monitoring
- Usage statistics available in API responses
- Error logging for debugging
- Performance monitoring

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Check your `.env.local` file
   - Ensure the key starts with `sk-`
   - Restart your development server

2. **"Invalid OpenAI API key"**
   - Verify the key is correct
   - Check if the key has been revoked
   - Ensure you have sufficient credits

3. **"API quota exceeded"**
   - Check your OpenAI usage limits
   - Upgrade your OpenAI plan if needed
   - Wait for quota reset

4. **Slow responses**
   - Normal for GPT-4o (higher quality takes time)
   - Check your internet connection
   - Monitor OpenAI status page

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## Medical Disclaimer

⚠️ **Important**: This AI assistant provides general health information only and should never replace professional medical advice. Always consult qualified healthcare professionals for:

- Medical diagnosis
- Treatment decisions  
- Medication advice
- Emergency situations
- Serious health concerns

## Future Enhancements

Planned features:
- Voice input/output
- Medical image analysis
- Symptom tracking integration
- Appointment scheduling
- Health metrics correlation
- Multi-language support