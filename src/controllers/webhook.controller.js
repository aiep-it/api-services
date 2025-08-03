// api-services/controllers/webhookController.js
const { Webhook } = require('svix');
const prisma = require('../../lib/prisma'); 
require('dotenv').config();

const webhookHandler = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;



  if (!WEBHOOK_SECRET) {
    console.error('Webhook secret not configured in environment variables.');
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing Svix headers in webhook request:', {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature ? '*** (present)' : '*** (missing)', // Không log toàn bộ signature
      allHeaders: req.headers // Log toàn bộ headers để debug 
    });
    return res.status(400).json({ error: 'Missing Svix headers' });
  }


  let body;

  if (Buffer.isBuffer(req.body)) {
    body = req.body.toString('utf-8'); 
  } else if (typeof req.body === 'object') {

    body = JSON.stringify(req.body);
  } else {
    body = String(req.body);
  }


  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {

    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err.message);

    return res.status(400).json({ error: `Webhook verification failed: ${err.message}` });
  }

  // Log sự kiện sau khi xác minh thành công
  // console.log('Webhook received and verified successfully:', { eventType: evt.type, dataId: evt.data.id || 'N/A' });
  // console.log('Full event data:', JSON.stringify(evt, null, 2)); // Ghi log toàn bộ event (chỉ cho debug, có thể quá lớn)


  const { id, email_addresses, first_name, last_name } = evt.data;
  const eventType = evt.type;
  const public_metadata = evt.data.public_metadata || {}; // Đảm bảo public_metadata là object
  const email = email_addresses?.[0]?.email_address; // Sử dụng optional chaining để an toàn

  if (!email) {
    console.error('No primary email provided in webhook payload for user ID:', id);
    return res.status(400).json({ error: 'No primary email provided in webhook payload.' });
  }

  if (eventType === 'user.created') {
    try {
      // Tìm kiếm user bằng email để xử lý trường hợp email đã tồn tại nhưng clerkId khác
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUserByEmail && existingUserByEmail.clerkId !== id) {
        console.warn('Conflict: Email already exists in DB with a different ClerkId. Skipping user creation/update for:', {
          clerkIdFromClerk: id,
          email: email,
          existingClerkIdInDB: existingUserByEmail.clerkId,
        });
        // Trả về 200 OK vì webhook đã được xử lý (không tạo mới, nhưng đã ghi nhận conflict)
        return res.status(200).json({ message: 'User with this email already exists, skipping creation.' });
      }

      const user = await prisma.user.upsert({
        where: { clerkId: id }, // Tìm kiếm user theo clerkId
        update: { // Dữ liệu để cập nhật nếu user đã tồn tại (clerkId trùng khớp)
          email: email,
          firstName: first_name || null,
          lastName: last_name || null,
          role: public_metadata.role || 'user', // Cập nhật role từ public_metadata, mặc định 'user'
          updatedAt: new Date(),
        },
        create: { 
          clerkId: id,
          email: email,
          firstName: first_name || null,
          lastName: last_name || null,
          role: public_metadata.role || 'user', 
          createdAt: new Date(), 
        },
      });

      // Create a default "My Word Space" roadmap for the new user
      const wordSpace = await prisma.roadmap.create({
        data: {
          name: 'My Word Space',
          isWordSpace: true,
          userId: user.id,
        },
      });

      // Bookmark the new roadmap for the user
      await prisma.UserRoadmap.create({
        data: {
          userId: user.id,
          roadmapId: wordSpace.id,
        },
      });
      console.log('User created/synced successfully:', { clerkId: user.clerkId, email: user.email, role: user.role });
      return res.status(200).json({ message: 'User created in database' });
    } catch (err) {
      console.error('Database error on user.created/upsert:', {
        error: err.message,
        code: err.code, 
        meta: err.meta,
        clerkId: id,
        email: email
      });
      if (err.code === 'P2002') { 
        return res.status(409).json({ error: `Unique constraint failed on ${err.meta?.target || 'unknown target'}. Email: ${email}` });
      }
      return res.status(500).json({ error: 'Failed to save user due to database error.' });
    }
  }

  if (eventType === 'user.updated') {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: id },
      });

      if (!user) {
        console.warn('User not found in DB for update event. User ID from Clerk:', id);
        return res.status(404).json({ error: 'User not found in database for update.' });
      }

      const updatedUser = await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email,
          firstName: first_name || null,
          lastName: last_name || null,
          role: public_metadata.role || 'user',
          updatedAt: new Date(),
        },
      });
      console.log('User updated/synced successfully:', { clerkId: updatedUser.clerkId, email: updatedUser.email, role: updatedUser.role });
      return res.status(200).json({ message: 'User updated in database' });
    } catch (err) {
      console.error('Database error on user.updated:', {
        error: err.message,
        code: err.code,
        meta: err.meta,
        clerkId: id,
        email: email
      });
      return res.status(500).json({ error: 'Failed to update user due to database error.' });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: id },
      });

      if (!user) {
        console.warn('User not found in DB for deletion event. User ID from Clerk:', id);
        return res.status(404).json({ error: 'User not found in database for deletion.' });
      }

      await prisma.user.delete({ where: { clerkId: id } });
      console.log('User deleted successfully:', id);
      return res.status(200).json({ message: 'User deleted from database' });
    } catch (err) {
      console.error('Database error on user.deleted:', {
        error: err.message,
        code: err.code,
        meta: err.meta,
        clerkId: id
      });
      return res.status(500).json({ error: 'Failed to delete user due to database error.' });
    }
  }


  console.log('Unhandled webhook event type:', eventType);
  return res.status(200).json({ message: 'Event processed (type unhandled)' });
};

module.exports = { webhookHandler };