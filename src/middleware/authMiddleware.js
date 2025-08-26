const { clerkMiddleware, getAuth } = require('@clerk/express');
const prisma = require('../../lib/prisma');

const protect = async (req, res, next) => {
  try {
    // Use Clerk's getAuth to verify token
    const auth = getAuth(req);
    if (!auth.userId) {
      req.user = null;
      return next();
    }

    const clerkId = auth.userId;
    // Find user in local database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, clerkId: true, role: true, email: true, firstName: true, lastName: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found in local database. Please ensure webhook sync is working.' });
    }

    req.user = user;
    console.log('Auth middleware: User authenticated:', { clerkId, email: user.email });
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error.message);
    res.status(401).json({ message: `Not authorized: ${error.message}` });
  }
};

const authorizeRoles = (roles = []) => {
  return (req, res, next) => {
    // // TODO
    // const userRole = req.user?.role;
    // if (!userRole || !roles.includes(userRole.toLowerCase())) {
    //   return res.status(403).json({ 
    //     message: `Forbidden: Requires role ${roles.join(' or ')}, but your role is ${userRole || 'none'}.`
    //   });
    // }
    next();
  };
};


module.exports = { protect, authorizeRoles };