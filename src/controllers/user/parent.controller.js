const userService = require('../../services/user.service');

exports.getMyChildren = async (req, res) => {
  try {
    const parentEmail = req.user?.email; // Assuming req.user is populated by auth middleware
    if (!parentEmail) {
      return res.status(401).json({ error: 'Unauthorized: Parent email not found.' });
    }

    const children = await userService.getMyChildrenByParentEmail(parentEmail);
    res.status(200).json(children);
  } catch (err) {
    console.error('Error fetching children for parent:', err);
    res.status(500).json({ error: 'Failed to fetch children.' });
  }
};

exports.getStudentFeedback = async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentEmail = req.user?.email; // Assuming req.user is populated by auth middleware

    if (!parentEmail) {
      return res.status(401).json({ error: 'Unauthorized: Parent email not found.' });
    }

    const feedbackList = await userService.getStudentFeedback(studentId, parentEmail);
    res.status(200).json(feedbackList);
  } catch (err) {
    console.error('Error fetching student feedback:', err);
    res.status(500).json({ error: 'Failed to fetch student feedback.' });
  }
};
