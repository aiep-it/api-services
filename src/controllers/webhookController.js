// api-services/controllers/webhookController.js
const { Webhook } = require('svix');
const { PrismaClient } = require('@prisma/client'); // ✅ Đúng
const prisma = new PrismaClient(); // ✅ Tạo instance
require('dotenv').config();

const webhookHandler = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  const headers = req.headers;
  const svix_id = headers['svix-id'];
  const svix_timestamp = headers['svix-timestamp'];
  const svix_signature = headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  const payload = req.body;
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  const { id, email_addresses, first_name, last_name } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    try {
      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email: email_addresses[0].email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          updatedAt: new Date(),
        },
        create: {
          clerkId: id,
          email: email_addresses[0].email_address,
          firstName: first_name || null,
          lastName: last_name || null,
        },
      });
      return res.status(200).json({ message: 'User created in database' });
    } catch (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to save user' });
    }
  }

  if (eventType === 'user.updated') {
  const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
  try {
    await prisma.user.update({
      where: { clerkId: id },
      data: {
        email: email_addresses[0].email_address,
        firstName: first_name || null,
        lastName: last_name || null,
        role: public_metadata.role || null,
        updatedAt: new Date(),
      },
    });
    return res.status(200).json({ message: 'User updated in database' });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

  return res.status(200).json({ message: 'Event processed' });
};

module.exports = { webhookHandler };