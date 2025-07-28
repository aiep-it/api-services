const request = require('supertest');
const app = require('../../app'); // Adjust path as needed
const prisma = require('../../lib/prisma'); // Adjust path as needed

describe('Exercise API', () => {
  let topicId;
  let userId;

  beforeAll(async () => {
    // Create a dummy topic and user for testing
    const topic = await prisma.topic.create({
      data: {
        title: 'Test Topic',
        roadmap: {
          create: {
            name: 'Test Roadmap',
          },
        },
      },
    });
    topicId = topic.id;

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    // Clean up dummy data
    await prisma.exercise.deleteMany({});
    await prisma.topic.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it('should create a new exercise', async () => {
    const newExercise = {
      type: 'text',
      content: 'What is the capital of France?',
      options: ['Berlin', 'Paris', 'Rome', 'Madrid'],
      correctAnswer: 'Paris',
      hint: 'It starts with P',
      difficulty: 'beginner',
      topicId: topicId,
      userId: userId,
    };

    const res = await request(app)
      .post('/exercises')
      .send(newExercise);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.content).toEqual(newExercise.content);
  });

  it('should get all exercises', async () => {
    const res = await request(app).get('/exercises');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should get an exercise by ID', async () => {
    const newExercise = await prisma.exercise.create({
      data: {
        type: 'text',
        content: 'Another test question?',
        correctAnswer: 'Answer',
        topic: {
          connect: { id: topicId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });

    const res = await request(app).get(`/exercises/${newExercise.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(newExercise.id);
  });

  it('should update an exercise', async () => {
    const newExercise = await prisma.exercise.create({
      data: {
        type: 'text',
        content: 'Question to update?',
        correctAnswer: 'Old Answer',
        topic: {
          connect: { id: topicId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });

    const updatedContent = 'Updated question content';
    const res = await request(app)
      .put(`/exercises/${newExercise.id}`)
      .send({
        type: 'text',
        content: updatedContent,
        correctAnswer: 'New Answer',
        topicId: topicId,
        userId: userId,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.content).toEqual(updatedContent);
  });

  it('should delete an exercise', async () => {
    const newExercise = await prisma.exercise.create({
      data: {
        type: 'text',
        content: 'Question to delete?',
        correctAnswer: 'Delete Answer',
        topic: {
          connect: { id: topicId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });

    const res = await request(app).delete(`/exercises/${newExercise.id}`);
    expect(res.statusCode).toEqual(204);

    const deletedExercise = await prisma.exercise.findUnique({
      where: { id: newExercise.id },
    });
    expect(deletedExercise).toBeNull();
  });
});
