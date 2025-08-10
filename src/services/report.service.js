const prisma = require("../../lib/prisma");
const { use } = require("../routers/user.exercise.result.routes");

class ReportService {
  async getExerciseResultReportByUser(userId) {
    return prisma.userExerciseResult.findMany({
      where: { userId },
      include: { exercise: true },
    });
  }

  async getExerciseResultReportByUserAndTopic(userId, topicId) {
    return prisma.userExerciseResult.findMany({
      where: {
        userId,
        exercise: {
          topicId,
        },
      },
      include: { exercise: true },
    });
  }

  async getExerciseResultReportByTopic(topicId) {
    return prisma.userExerciseResult.findMany({
      where: {
        exercise: {
          topicId,
        },
      },
      include: { user: true, exercise: true },
    });
  }

  async getSelfReport(userId) {
    const topics = await prisma.topic.findMany({
      where: {
        roadmap: {
          is_deleted: false,
        },
      },
      include: {
        Vocab: true,
        Exercise: true,
      },
    });

    const report = await Promise.all(
      topics.map(async (topic) => {
        const vocabProgress = await prisma.userVocabProgress.findMany({
          where: {
            userId,
            vocab: {
              topicId: topic.id,
            },
          },
          include: {
            vocab: true,
          },
        });

        const exerciseResults = await prisma.userExerciseResult.findMany({
          where: {
            userId,
            exercise: {
              topicId: topic.id,
            },
          },
          include: {
            exercise: true,
          },
        });

        const learnedVocab = vocabProgress.filter((p) => p.is_learned).length;
        const totalVocab = topic.Vocab.length;

        const totalExercises = topic.Exercise.length;
        const correctAnswers = exerciseResults.filter(
          (r) => r.isCorrect
        ).length;
        const avgScore =
          totalExercises > 0 ? (correctAnswers / totalExercises) * 100 : 0;
        const lastAttemptAt =
          exerciseResults.length > 0
            ? exerciseResults.sort(
                (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
              )[0].submittedAt
            : null;

        return {
          topicId: topic.id,
          topicName: topic.title,
          vocabProgress: {
            total: totalVocab,
            learned: learnedVocab,
            items: vocabProgress.map((p) => {
              return {
                vocabId: p.vocabId,
                word: p.vocab.word,
                isLearned: p.is_learned,
                meaning: p.vocab.meaning,
                score: p.score,
              };
            }),
          },
          exerciseResults: {
            totalExercises,
            avgScore,
            lastAttemptAt,
            items: exerciseResults.map((r) => ({
              exerciseId: r.exerciseId,
              score: r.isCorrect ? 100 : 0,
              total: r.total,
              attemptedAt: r.submittedAt,
              content: r.exercise.content,
            })),
          },
        };
      })
    );

    const totalTopics = topics.length;
    const totalTopicEnrolled = await prisma.userTopicProgress.count({
      where: {
        userId,
        topic: {
          roadmap: {
            is_deleted: false,
          },
        },
      },
    });
    const totalVocabLearned = report.reduce(
      (acc, curr) => acc + curr.vocabProgress.learned,
      0
    );
    const totalExercisesCompleted = report.reduce(
      (acc, curr) => acc + curr.exerciseResults.items.length,
      0
    );

    const totalVocabs = report.reduce(
      (acc, curr) => acc + curr.vocabProgress.total,
      0
    );
    const totalExercises = report.reduce(
      (acc, curr) => acc + curr.exerciseResults.totalExercises,
      0
    );
    const totalExercisesCorrect = report.reduce(
      (acc, curr) =>
        acc +
        curr.exerciseResults.items.filter((r) => {
          return r.score > 0;
        }).length,
      0
    );

    return {
      overview: {
        totalTopics,
        totalTopicEnrolled,
        totalVocabLearned,
        totalExercisesCompleted,
        totalVocabs,
        totalExercises,
        totalExercisesCorrect,
      },
      topics: report,
    };
  }

  async getCourseOverview(userId, userRole, page) {
    let topicFilter = {
      roadmap: {
        is_deleted: false,
      },
    };
    let exerciseFilter = {};

    if (page === 'workspace') {
      topicFilter.roadmap.isWordSpace = true;
      topicFilter.roadmap.userId = userId;
      exerciseFilter = {
        userId: userId,
        exercise: {
          topic: {
            roadmap: {
              isWordSpace: true,
              userId: userId,
            },
          },
        },
      };
    } else if (page === 'course') {
      topicFilter.roadmap.isWordSpace = false;

      if (userRole?.toLowerCase() === 'student') {
        const userClasses = await prisma.userClass.findMany({
          where: {
            userId: userId,
            role: 'STUDENT',
          },
          include: {
            class: {
              include: {
                roadmaps: {
                  include: {
                    roadmap: {
                      select: {
                        id: true,
                        isWordSpace: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        );

        const classRoadmapIds = new Set();
        userClasses.forEach(uc => {
          uc.class.roadmaps.forEach(cr => {
            if (!cr.roadmap.isWordSpace) { 
              classRoadmapIds.add(cr.roadmap.id);
            }
          });
        });

        topicFilter = {
          ...topicFilter,
          roadmapId: {
            in: Array.from(classRoadmapIds),
          },
        };

        exerciseFilter = {
          userId: userId,
          exercise: {
            topic: {
              roadmapId: {
                in: Array.from(classRoadmapIds),
              },
            },
          },
        };
      }
    }

    const totalTopics = await prisma.topic.count({
      where: topicFilter,
    });
    const totalVocabs = await prisma.vocab.count({
      where: {
        Topic: topicFilter,
      },
    });
    const totalExercises = await prisma.exercise.count({
      where: {
        topic: topicFilter,
      },
    });

    const totalTopicEnrolled = await prisma.userTopicProgress.count({
      where: {
        userId,
        topic: topicFilter,
      },
    });

    const totalVocabLearned = await prisma.userVocabProgress.count({
      where: {
        userId,
        is_learned: true,
        vocab: {
          Topic: topicFilter,
        },
      },
    });

    const totalExercisesCompleted = await prisma.userExerciseResult.count({
      where: exerciseFilter,
    });

    return {
      totalTopics,
      totalTopicEnrolled,
      totalVocabLearned,
      totalVocabs,
      totalExercisesCompleted,
      totalExercises,
    };
  }
}

module.exports = new ReportService();
