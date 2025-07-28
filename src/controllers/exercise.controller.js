const prisma = require('../../lib/prisma');

const createExercise = async (req, res) => {
  try {
    const { type, content, options, correctAnswer, hint, difficulty, topicId, userId } = req.body;
    const exercise = await prisma.exercise.create({
      data: {
        type,
        content,
        options,
        correctAnswer,
        hint,
        difficulty,
        topic: {
          connect: { id: topicId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });
    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getExercises = async (req, res) => {
  try {
    const exercises = await prisma.exercise.findMany({
      include: {
        topic: true,
        user: true,
      },
    });
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await prisma.exercise.findUnique({
      where: {
        id,
      },
      include: {
        topic: true,
        user: true,
      },
    });
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.status(200).json(exercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, content, options, correctAnswer, hint, difficulty, topicId, userId } = req.body;
    const exercise = await prisma.exercise.update({
      where: {
        id,
      },
      data: {
        type,
        content,
        options,
        correctAnswer,
        hint,
        difficulty,
        topic: {
          connect: { id: topicId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });
    res.status(200).json(exercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.exercise.delete({
      where: {
        id,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const { generateExercises } = require('../services/ai.assistant.service');

const generateExercisesController = async (req, res) => {
  try {
    const { vocabList } = req.body;
    if (!vocabList || !Array.isArray(vocabList) || vocabList.length === 0) {
      return res.status(400).json({ error: 'vocabList is required and must be a non-empty array.' });
    }
    const exercises = await generateExercises(vocabList);
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createExercise,
  getExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
  generateExercisesController,
};
