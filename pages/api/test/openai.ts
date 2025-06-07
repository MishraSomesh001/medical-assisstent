import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      success: false,
      message: 'OpenAI API key not configured',
      setup: 'Add OPENAI_API_KEY to your .env.local file'
    });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Test with a simple completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "OpenAI connection successful!" and nothing else.' }
      ],
      max_tokens: 50,
    });

    const response = completion.choices[0]?.message?.content;

    res.status(200).json({
      success: true,
      message: 'OpenAI connection successful!',
      response: response,
      model: completion.model,
      usage: completion.usage,
    });

  } catch (error: any) {
    console.error('OpenAI test error:', error);
    
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;

    if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid OpenAI API key';
      statusCode = 401;
    } else if (error.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded';
      statusCode = 429;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.code || 'unknown_error',
    });
  }
}