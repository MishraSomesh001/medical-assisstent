import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth.config';
import clientPromise from '../../../lib/mongodb';
import { MongoClient } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = session.user.id;
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db();
    const collection = db.collection('health_metrics');

    if (req.method === 'POST') {
      const { type, value, date, notes, systolic, diastolic } = req.body;
      if (!type || (!value && type !== 'blood_pressure') || !date) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      let entry;
      if (type === 'blood_pressure') {
        if (!systolic || !diastolic) {
          return res.status(400).json({ message: 'Missing systolic/diastolic for blood pressure' });
        }
        entry = { userId, type, systolic, diastolic, date: new Date(date), notes: notes || '' };
      } else {
        entry = { userId, type, value: parseFloat(value), date: new Date(date), notes: notes || '' };
      }
      await collection.insertOne(entry);
      return res.status(201).json({ message: 'Metric added' });
    }

    if (req.method === 'GET') {
      const { type } = req.query;
      const query: { [key: string]: any } = { userId };
      if (type) query.type = type;
      const metrics = await collection.find(query).sort({ date: 1 }).toArray();
      return res.status(200).json({ metrics });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('Failed to process metrics request:', err);
    return res.status(500).json({ message: 'Failed to process metrics request.' });
  }
} 