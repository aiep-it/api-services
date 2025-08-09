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
      const { id: userId } = req.user;

      const { page } = req.query; 

      const topicFilter = {
        roadmap: {
          is: {
            is_deleted: false,
            isWordSpace: false,
          }
        }
      };
      if (page === ReportPage.WORK_SPACE) {
        topicFilter.roadmap.is.isWordSpace = true;
        topicFilter.roadmap.is.userId = userId;
      } else if (page === ReportPage.COURSER) {
        topicFilter.roadmap.is.isWordSpace = false;
      }

      const exerciseFilter = {
        userId,
        exercise: {
          topic: topicFilter,
        },
      };
      const overview = await ReportService.getCourseOverview(userId ,topicFilter, exerciseFilter);
      res.status(200).json(overview);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
