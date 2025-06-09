import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth.config';
import clientPromise from '../../../lib/mongodb';
import { MongoClient } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = session.user.id;
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db();
    const chatCollection = db.collection('chat_history');
    const history = await chatCollection.find({ userId }).sort({ createdAt: -1 }).limit(50).toArray();
    res.status(200).json({ history });
  } catch (err) {
    console.error('Failed to fetch chat history:', err);
    res.status(500).json({ message: 'Failed to fetch chat history.' });
  }
} 