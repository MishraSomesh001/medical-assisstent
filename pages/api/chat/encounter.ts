import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth.config';
import clientPromise from '../../../lib/mongodb';
import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = session.user.id;
  const { messages, encounterId } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'No messages to save' });
  }
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db();
    const chatCollection = db.collection('chat_history');
    if (encounterId) {
      const existing = await chatCollection.findOne({ userId, encounterId });
      const createdAt = existing?.createdAt || new Date();
      await chatCollection.updateOne(
        { userId, encounterId },
        { $set: { messages, updatedAt: new Date(), createdAt } },
        { upsert: true }
      );
      return res.status(200).json({ message: 'Encounter updated' });
    } else {
      await chatCollection.insertOne({
        userId,
        messages,
        encounterId: new ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return res.status(201).json({ message: 'Encounter saved' });
    }
  } catch (err) {
    console.error('Failed to save or update encounter:', err);
    return res.status(500).json({ message: 'Failed to save or update encounter.' });
  }
} 