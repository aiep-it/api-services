const prisma = require('../../lib/prisma');
const { sendEmail } = require('./mailer.service');

// Optional: fallback lấy email từ Clerk nếu DB không có
let clerkUsers = null;
try {
  ({ users: clerkUsers } = require('@clerk/backend'));
} catch (_) {
  // không bắt buộc cài @clerk/backend nếu bạn đã lưu email trong bảng User
}

/**
 * Tạo notification trong DB
 */
async function createNotification({ userId, title, message, link }) {
  return prisma.notification.create({
    data: { userId, title, message, link },
  });
}

/**
 * Lấy email & tên giáo viên:
 *  - ưu tiên từ bảng User (đã có trong DB của bạn)
 *  - nếu không có mà có clerkId & đã cài @clerk/backend => lấy từ Clerk
 */
async function resolveTeacherContact(userId) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true, firstName: true, lastName: true, clerkId: true },
  });

  let email = u?.email || null;
  let name =
    u?.fullName ||
    ((u?.firstName && u?.lastName) ? `${u.firstName} ${u.lastName}` : null) ||
    'Thầy/Cô';

  if (!email && u?.clerkId && clerkUsers) {
    try {
      const cu = await clerkUsers.getUser(u.clerkId);
      email = cu?.emailAddresses?.[0]?.emailAddress || email;
      if (!name) {
        name = (cu?.firstName && cu?.lastName)
          ? `${cu.firstName} ${cu.lastName}`
          : cu?.username || name;
      }
    } catch (e) {
      // bỏ qua nếu Clerk lỗi
      console.error('Clerk lookup failed:', e?.message || e);
    }
  }

  return { email, name };
}

/**
 * Thông báo khi giáo viên được thêm vào lớp
 * - Ghi notification vào DB
 * - (tùy chọn) bắn realtime nếu truyền hàm realtimeTrigger
 * - (tùy chọn) gửi email nếu cấu hình Resend
 */
async function notifyTeacherAdded({ teacherUserId, classId, className, classLink, realtimeTrigger }) {
  const link = classLink || `${process.env.APP_URL || ''}/teacher/classes/${classId}`;

  // 1) In-app notification
  await createNotification({
    userId: teacherUserId,
    title: 'Bạn đã được thêm vào lớp học',
    message: `Bạn vừa được thêm vào lớp ${className}.`,
    link,
  });

  // 2) Realtime (nếu có)
  if (typeof realtimeTrigger === 'function') {
    await realtimeTrigger(`user-${teacherUserId}`, 'notification:new', {
      title: 'Bạn đã được thêm vào lớp học',
      message: `Bạn vừa được thêm vào lớp ${className}.`,
      link,
    });
  }

  // 3) Email (nếu cấu hình)
  try {
    const { email, name } = await resolveTeacherContact(teacherUserId);
    if (email) {
      await sendEmail({
        to: email,
        subject: 'Bạn đã được thêm vào lớp học',
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6">
            <p>Chào ${name || 'Thầy/Cô'},</p>
            <p>Bạn vừa được thêm vào lớp <b>${className}</b>.</p>
            <p><a href="${link}">Xem chi tiết lớp</a></p>
            <hr/>
            <p>Trân trọng,</p>
            <p>Hệ thống</p>
          </div>
        `,
      });
    }
  } catch (e) {
    console.error('Send email failed:', e?.message || e);
  }
}

module.exports = {
  createNotification,
  notifyTeacherAdded,
};
