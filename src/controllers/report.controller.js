const { use } = require("../routers/user.exercise.result.routes");
const ReportService = require("../services/report.service");

const ReportPage = {
  COURSER: "course",
  WORK_SPACE: "workspace",
};
class ReportController {
  async getSelfReport(req, res, next) {
    try {
      const { id: userId } = req.user;
      const report = await ReportService.getSelfReport(userId);
      res.status(200).json({
        userId,
        generatedAt: new Date(),
        ...report,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getStdReport(req, res, next) {
    try {
      const { userId } = req.params;
      const report = await ReportService.getSelfReport(userId);
      res.status(200).json({
        userId,
        generatedAt: new Date(),
        ...report,
      });
    } catch (error) {
      next(error);
    }
  }
  async getExerciseResultReportByUser(req, res, next) {
    try {
      const { userId } = req.params;
      const report = await ReportService.getExerciseResultReportByUser(userId);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  async getExerciseResultReportByUserAndTopic(req, res, next) {
    try {
      const { userId, topicId } = req.params;
      const report = await ReportService.getExerciseResultReportByUserAndTopic(
        userId,
        topicId
      );
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  async getExerciseResultReportByTopic(req, res, next) {
    try {
      const { topicId } = req.params;
      const report = await ReportService.getExerciseResultReportByTopic(
        topicId
      );
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  async getCourseOverview(req, res, next) {
    try {
      const { id: userId, role: userRole } = req.user;
      const { page } = req.query;

      const overview = await ReportService.getCourseOverview(userId, userRole, page);
      res.status(200).json(overview);
    } catch (error) {
      next(error);
    }
  }

  async getClassReport(req, res, next) {
    try {
      const { classId } = req.params;
      const { id: teacherId } = req.user;

      const report = await ReportService.getClassReport(teacherId, classId);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  async getClassTopicReport(req, res, next) {
    try {
      const { classId, topicId } = req.params;
      const { id: teacherId } = req.user;

      const report = await ReportService.getClassTopicReport(teacherId, classId, topicId);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  async getStudentClassReport(req, res, next) {
    try {
      const { studentId, classId } = req.params;
      const { id: teacherId } = req.user;

      const report = await ReportService.getStudentClassReport(studentId, classId, teacherId);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
