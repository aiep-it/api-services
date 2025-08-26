const prisma = require("../../lib/prisma");
const { sendEmail } = require("./mailer.service");

let clerkUsers = null;
try { ({ users: clerkUsers } = require("@clerk/backend")); } catch (_) {}

async function createNotification({ userId, classId, title, message, link }) {
  const safe = {
    userId: String(userId),
    classId: classId ? String(classId) : null,
    title: String(title ?? ""),
    message: String(message ?? ""),
    link: link == null ? null : String(link),
  };
  try {
    return await prisma.notification.create({ data: safe });
  } catch (e) {
    console.error("Create notification failed:", e?.message || e);
    return null;
  }
}

async function resolveUserContact(userId, fallbackName = "Bạn") {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true, firstName: true, lastName: true, clerkId: true },
  });
  let email = u?.email || null;
  let name =
    u?.fullName ||
    (u?.firstName && u?.lastName ? `${u.firstName} ${u.lastName}` : null) ||
    fallbackName;

  if (!email && u?.clerkId && clerkUsers) {
    try {
      const cu = await clerkUsers.getUser(u.clerkId);
      email = cu?.emailAddresses?.[0]?.emailAddress || email;
      if (!name) name = (cu?.firstName && cu?.lastName) ? `${cu.firstName} ${cu.lastName}` : (cu?.username || fallbackName);
    } catch (e) {
      console.error("Clerk lookup failed:", e?.message || e);
    }
  }
  return { email, name };
}

async function notifyTeacherAdded({ teacherUserId, classId, className, classLink, realtimeTrigger }) {
  try {
    const link = classLink || `${process.env.APP_URL || ""}/class-room/${classId}`;
    await createNotification({
      userId: teacherUserId, classId, title: "Bạn đã được thêm vào lớp học",
      message: `Bạn vừa được thêm vào lớp ${className}.`, link: link || null,
    });
    if (typeof realtimeTrigger === "function") {
      await realtimeTrigger(`user-${teacherUserId}`, "notification:new", {
        title: "Bạn đã được thêm vào lớp học",
        message: `Bạn vừa được thêm vào lớp ${className}.`,
        link, classId,
      });
    }
    try {
      const { email, name } = await resolveUserContact(teacherUserId, "Thầy/Cô");
      if (email) {
        await sendEmail({
          to: email,
          subject: "Bạn đã được thêm vào lớp học",
          html: `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6">
                   <p>Chào ${name || "Thầy/Cô"},</p>
                   <p>Bạn vừa được thêm vào lớp <b>${className}</b>.</p>
                   <p><a href="${link}">Xem chi tiết lớp</a></p>
                   <hr/><p>Trân trọng,</p><p>Hệ thống</p>
                 </div>`,
        });
      }
    } catch (e) { console.error("Send email failed:", e?.message || e); }
  } catch (e) {
    console.error("notifyTeacherAdded failed:", e?.message || e);
  }
}

async function notifyAddedToClass({ userId, classId, className, classLink, realtimeTrigger }) {
  try {
    const link = classLink || `${process.env.APP_URL || ""}/class-room/${classId}`;
    await createNotification({
      userId, classId, title: "Bạn đã được thêm vào lớp học",
      message: `Bạn vừa được thêm vào lớp ${className}.`, link: link || null,
    });
    if (typeof realtimeTrigger === "function") {
      await realtimeTrigger(`user-${userId}`, "notification:new", {
        title: "Bạn đã được thêm vào lớp học",
        message: `Bạn vừa được thêm vào lớp ${className}.`,
        link, classId,
      });
    }
    try {
      const { email, name } = await resolveUserContact(userId, "bạn");
      if (email) {
        await sendEmail({
          to: email,
          subject: "Bạn đã được thêm vào lớp học",
          html: `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6">
                   <p>Chào ${name || "bạn"},</p>
                   <p>Bạn vừa được thêm vào lớp <b>${className}</b>.</p>
                   <p><a href="${link}">Xem chi tiết lớp</a></p>
                   <hr/><p>Trân trọng,</p><p>Hệ thống</p>
                 </div>`,
        });
      }
    } catch (e) { console.error("Send email failed:", e?.message || e); }
  } catch (e) {
    console.error("notifyAddedToClass failed:", e?.message || e);
  }
}

module.exports = { createNotification, resolveUserContact, notifyTeacherAdded, notifyAddedToClass };
