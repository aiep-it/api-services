const UserExerciseResultService = require('../../services/user.exercise.result.service');

class UserExerciseResultController {
  async createUserExerciseResult(req, res, next) {
    try {
      const { id: userId } = req.user;
      const result = await UserExerciseResultService.createUserExerciseResult({ ...req.body, userId });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserExerciseResult(req, res, next) {
    try {
      const result = await UserExerciseResultService.getUserExerciseResult(req.params.id);
      if (!result) {
        return res.status(404).json({ message: 'User exercise result not found' });
      }
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateUserExerciseResult(req, res, next) {
    try {
      const result = await UserExerciseResultService.updateUserExerciseResult(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteUserExerciseResult(req, res, next) {
    try {
      await UserExerciseResultService.deleteUserExerciseResult(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserExerciseResultController();
