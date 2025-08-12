const prisma = require('../../../lib/prisma');

exports.listMyNotifications = async (req, res) => {
  try {
    // authMiddleware của bạn đang set req.user.id = User.id (UUID)
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const items = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    const noti = await prisma.notification.findUnique({ where: { id } });
    if (!noti) return res.status(404).json({ message: 'Not found' });
    if (noti.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};
