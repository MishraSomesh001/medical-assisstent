import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth.config';
import OpenAI from 'openai';
import clientPromise from '../../../lib/mongodb';
import { MongoClient } from 'mongodb';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MEDICAL_SYSTEM_PROMPT = `You are a compassionate and knowledgeable medical AI assistant. You must respond in valid JSON format only.

RESPONSE FORMAT:
You must respond with a JSON object containing these exact fields:
{
  "greeting": "Empathetic opening with emoji",
  "mainContent": {
    "summary": "Brief summary of the health topic",
    "keyPoints": ["Point 1", "Point 2", "Point 3"],
    "recommendations": [
      {
        "title": "Recommendation title",
        "description": "Detailed description",
        "icon": "🩺"
      }
    ]
  },
  "whenToSeekHelp": {
    "urgentSigns": ["Sign 1", "Sign 2"],
    "consultDoctor": ["Situation 1", "Situation 2"]
  },
  "disclaimer": "Medical disclaimer text",
  "supportiveClosing": "Encouraging message with emoji"
}

MEDICAL GUIDELINES:
- Provide evidence-based health information
- Always emphasize this is general information only
- Recommend professional medical consultation for serious concerns
- Be empathetic and supportive
- Ask clarifying questions when helpful
- Suggest emergency care when appropriate
- Include appropriate medical disclaimers
- Never provide specific diagnoses

ICONS TO USE:
🩺 medical advice, 💊 medication, 🏥 hospital, ⚠️ warnings, ✅ recommendations, 
🌡️ fever, 💧 hydration, 😴 rest, 🍎 nutrition, 🏃‍♂️ exercise, 🧠 mental health, 
❤️ heart health, 📞 emergency, 🤗 greeting, 💙 support

TONE: Caring, professional, informative, and supportive while maintaining medical accuracy and safety.

IMPORTANT: Your response must be valid JSON only. Do not include any text outside the JSON object.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;
  const client: MongoClient = await clientPromise;
  const db = client.db();
  const chatCollection = db.collection('chat_history');

  const { message, conversationHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key not configured');
    return res.status(500).json({ message: 'OpenAI API key not configured' });
  }

  if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.error('Invalid OpenAI API key format');
    return res.status(500).json({ message: 'Invalid OpenAI API key format' });
  }

  try {
    // Prepare conversation history for OpenAI - ensure all content is strings
    const messages = [
      { role: 'system', content: MEDICAL_SYSTEM_PROMPT },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      })),
      { role: 'user', content: message }
    ];

    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as any,
      max_tokens: 1500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
      
      // Validate required fields
      if (!parsedResponse.greeting || !parsedResponse.mainContent || !parsedResponse.disclaimer) {
        console.warn('Invalid JSON structure, falling back to text response');
        // Fallback to text response
        return res.status(200).json({
          message: aiResponse,
          usage: completion.usage,
          type: 'text'
        });
      }

      // Return structured JSON response
      try {
        await chatCollection.insertOne({
          userId,
          userMessage: message,
          conversationHistory,
          aiResponse: parsedResponse,
          createdAt: new Date(),
        });
      } catch (dbError) {
        console.error('Failed to save chat history:', dbError);
        // Don't block the response, but log the error
      }
      res.status(200).json({
        message: parsedResponse,
        usage: completion.usage,
        type: 'json'
      });

    } catch (parseError) {
      console.warn('JSON parse error, falling back to text response:', parseError);
      // Fallback to text response if JSON parsing fails
      res.status(200).json({
        message: aiResponse,
        usage: completion.usage,
        type: 'text'
      });
    }

  } catch (error: any) {
    console.error('OpenAI API error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      status: error.status
    });
    
    // Handle specific OpenAI errors
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        message: 'Invalid OpenAI API key. Please check your configuration.' 
      });
    }
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ 
        message: 'OpenAI API quota exceeded. Please check your usage limits.' 
      });
    }
    
    if (error.code === 'model_not_found') {
      return res.status(400).json({ 
        message: 'Model not available. Please try again later.' 
      });
    }
    
    if (error.message && error.message.includes('JSON')) {
      return res.status(500).json({ 
        message: 'AI response formatting error. Please try again.' 
      });
    }

    // Generic error response
    res.status(500).json({ 
      message: 'Failed to get AI response. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}