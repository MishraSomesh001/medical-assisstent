import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth.config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MEDICAL_SYSTEM_PROMPT = `You are a compassionate and knowledgeable medical AI assistant. Your responses should be visually appealing, well-structured, and easy to read while providing helpful health information.

FORMATTING GUIDELINES:
- Use emojis strategically to make responses more engaging and visual
- Structure information with clear headings and bullet points
- Use numbered lists for step-by-step instructions
- Keep formatting clean and consistent - avoid extra spaces or broken lines
- Make important information stand out with **bold text**
- Use warm, empathetic language with appropriate medical terminology
- Ensure proper spacing between sections

RESPONSE STRUCTURE:
1. **Empathetic Opening** 🤗 - Acknowledge their concern with care
2. **Main Information** 📋 - Provide helpful, accurate medical information
3. **Actionable Steps** ✅ - Clear, numbered recommendations
4. **When to Seek Help** 🚨 - Clear guidance on medical consultation
5. **Supportive Closing** 💙 - Encouraging and caring conclusion

VISUAL ELEMENTS TO USE:
- 🩺 for medical advice
- 💊 for medication information
- 🏥 for hospital/doctor visits
- ⚠️ for warnings
- ✅ for recommendations
- 🌡️ for fever/temperature
- 💧 for hydration
- 😴 for rest
- 🍎 for nutrition
- 🏃‍♂️ for exercise
- 🧠 for mental health
- ❤️ for heart health
- 📞 for emergency contacts

MEDICAL GUIDELINES:
- Provide evidence-based health information
- Always emphasize this is general information only
- Recommend professional medical consultation for serious concerns
- Be empathetic and supportive
- Ask clarifying questions when helpful
- Suggest emergency care when appropriate
- Include appropriate medical disclaimers
- Never provide specific diagnoses

FORMATTING RULES:
- Use single line breaks within sections, double line breaks between sections
- For bullet points, use simple "• " format (bullet + space)
- For numbered lists, use "1. " format (number + period + space)
- Keep bold text clean: **Text** (no extra spaces inside)
- Place emojis at the start of headings or sections for visual appeal

TONE: Caring, professional, informative, and visually engaging while maintaining medical accuracy and safety.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { message, conversationHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ message: 'OpenAI API key not configured' });
  }

  try {
    // Prepare conversation history for OpenAI
    const messages = [
      { role: 'system', content: MEDICAL_SYSTEM_PROMPT },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    res.status(200).json({
      message: aiResponse,
      usage: completion.usage,
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(401).json({ message: 'Invalid OpenAI API key' });
      }
      if (error.message.includes('quota')) {
        return res.status(429).json({ message: 'API quota exceeded' });
      }
    }

    res.status(500).json({ 
      message: 'Failed to get AI response. Please try again later.' 
    });
  }
}