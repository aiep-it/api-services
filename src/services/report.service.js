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

  async getClassReport(teacherId, classId) {
    // 1. Verify teacher's role for the class
    // const teacherClassEntry = await prisma.userClass.findUnique({
    //   where: {
    //     userId_classId: {
    //       userId: teacherId,
    //       classId: classId,
    //     },
    //     role: "TEACHER",
    //   },
    // });

    // if (!teacherClassEntry) {
    //   throw new Error("Forbidden: User is not a teacher for this class.");
    // }

    // 2. Get class details
    const classDetails = await prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        level: true,
        roadmaps: {
          select: {
            roadmap: {
              select: {
                id: true,
                name: true,
                topics: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!classDetails) {
      throw new Error("Class not found.");
    }

    const classRoadmapIds = classDetails.roadmaps.map(cr => cr.roadmap.id);
    const classTopicIds = classDetails.roadmaps.flatMap(cr => cr.roadmap.topics.map(t => t.id));

    // 3. Get students in the class
    const studentsInClass = await prisma.userClass.findMany({
      where: {
        classId: classId,
        role: "STUDENT",
      },
      select: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // 4. For each student, get their progress
    const studentsReport = await Promise.all(
      studentsInClass.map(async (studentEntry) => {
        const studentId = studentEntry.user.id;

        // Get topic progress for topics relevant to this class
        const topicProgress = await prisma.userTopicProgress.findMany({
          where: {
            userId: studentId,
            topicId: {
              in: classTopicIds,
            },
          },
          select: {
            topic: {
              select: {
                id: true,
                title: true,
              },
            },
            isCompleted: true,
            completedAt: true,
          },
        });

        // Get exercise results for exercises relevant to this class
        const exerciseResults = await prisma.userExerciseResult.findMany({
          where: {
            userId: studentId,
            exercise: {
              topicId: {
                in: classTopicIds,
              },
            },
          },
          select: {
            id: true,
            isCorrect: true,
            submittedAt: true,
            exercise: {
              select: {
                id: true,
                content: true,
                topicId: true,
              },
            },
          },
        });

        const completedTopicsCount = topicProgress.filter(tp => tp.isCompleted).length;
        const totalTopicsInClass = classTopicIds.length;
        const topicCompletionPercentage = totalTopicsInClass > 0 ? (completedTopicsCount / totalTopicsInClass) * 100 : 0;

        const correctExercisesCount = exerciseResults.filter(er => er.isCorrect).length;
        const totalExercisesAttempted = exerciseResults.length;
        const exerciseSuccessRate = totalExercisesAttempted > 0 ? (correctExercisesCount / totalExercisesAttempted) * 100 : 0;


        return {
          student: studentEntry.user,
          progressSummary: {
            completedTopicsCount,
            totalTopicsInClass,
            topicCompletionPercentage,
            totalExercisesAttempted,
            correctExercisesCount,
            exerciseSuccessRate,
          },
          topicProgress,
          exerciseResults,
        };
      })
    );

    return {
      classDetails,
      studentsReport,
    };
  }

  async getClassTopicReport(teacherId, classId, topicId) {
    // // 1. Verify teacher's role for the class
    // const teacherClassEntry = await prisma.userClass.findUnique({
    //   where: {
    //     userId_classId: {
    //       userId: teacherId,
    //       classId: classId,
    //     },
    //     role: "TEACHER",
    //   },
    // });

    // if (!teacherClassEntry) {
    //   throw new Error("Forbidden: User is not a teacher for this class.");
    // }

    // 2. Get class details
    const classDetails = await prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
      },
    });

    if (!classDetails) {
      throw new Error("Class not found.");
    }

    // 3. Get topic details and verify it belongs to a roadmap associated with this class
    const topicDetails = await prisma.topic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        title: true,
        description: true,
        roadmapId: true,
        roadmap: {
          select: {
            classRoadmaps: {
              where: { classId: classId },
              select: { classId: true },
            },
          },
        },
      },
    });

    if (!topicDetails || !topicDetails.roadmap || topicDetails.roadmap.classRoadmaps.length === 0) {
      throw new Error("Topic not found or not associated with this class.");
    }

    // 4. Get students in the class
    const studentsInClass = await prisma.userClass.findMany({
      where: {
        classId: classId,
        role: "STUDENT",
      },
      select: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // 5. For each student, get their progress on this specific topic
    const studentsTopicReport = await Promise.all(
      studentsInClass.map(async (studentEntry) => {
        const studentId = studentEntry.user.id;

        // Get topic progress for this specific topic
        const topicProgress = await prisma.userTopicProgress.findUnique({
          where: {
            userId_topicId: {
              userId: studentId,
              topicId: topicId,
            },
          },
          select: {
            isCompleted: true,
            completedAt: true,
          },
        });

        // Get vocabulary progress for this specific topic
        const vocabProgress = await prisma.userVocabProgress.findMany({
          where: {
            userId: studentId,
            vocab: {
              topicId: topicId,
            },
          },
          select: {
            vocab: {
              select: {
                id: true,
                word: true,
                meaning: true,
              },
            },
            is_learned: true,
          },
        });

        // Get exercise results for exercises within this specific topic
        const exerciseResults = await prisma.userExerciseResult.findMany({
          where: {
            userId: studentId,
            exercise: {
              topicId: topicId,
            },
          },
          select: {
            id: true,
            isCorrect: true,
            submittedAt: true,
            answer: true,
            exercise: {
              select: {
                id: true,
                content: true,
                correctAnswer: true,
              },
            },
          },
        });

        const correctExercisesCount = exerciseResults.filter(er => er.isCorrect).length;
        const totalExercisesAttempted = exerciseResults.length;
        const exerciseSuccessRate = totalExercisesAttempted > 0 ? (correctExercisesCount / totalExercisesAttempted) * 100 : 0;

        const learnedVocabCount = vocabProgress.filter(vp => vp.is_learned).length;
        const totalVocabCount = await prisma.vocab.count({
          where: { topicId: topicId },
        });
        const vocabLearningProgress = totalVocabCount > 0 ? (learnedVocabCount / totalVocabCount) * 100 : 0;

        return {
          student: studentEntry.user,
          topicProgress: topicProgress || { isCompleted: false, completedAt: null },
          vocabSummary: {
            learnedVocabCount,
            totalVocabCount,
            vocabLearningProgress,
          },
          vocabDetails: vocabProgress,
          exerciseSummary: {
            totalExercisesAttempted,
            correctExercisesCount,
            exerciseSuccessRate,
          },
          exerciseResults,
        };
      })
    );

    return {
      classDetails,
      topicDetails: {
        id: topicDetails.id,
        title: topicDetails.title,
        description: topicDetails.description,
      },
      studentsTopicReport,
    };
  }

  async getStudentClassReport(studentId, classId, teacherId) {
    // 1. Verify teacher's role for the class
    // const teacherClassEntry = await prisma.userClass.findUnique({
    //   where: {
    //     userId_classId: {
    //       userId: teacherId,
    //       classId: classId,
    //     },
    //     role: "TEACHER",
    //   },
    // });

    // if (!teacherClassEntry) {
    //   throw new Error("Forbidden: User is not a teacher for this class.");
    // }

    // 2. Verify student is in the class
    const studentClassEntry = await prisma.userClass.findUnique({
      where: {
        userId_classId: {
          userId: studentId,
          classId: classId,
        },
        role: "STUDENT",
      },
    });

    if (!studentClassEntry) {
      throw new Error("Student not found in this class.");
    }

    // 3. Get class details and associated roadmaps/topics
    const classDetails = await prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        roadmaps: {
          select: {
            roadmap: {
              select: {
                id: true,
                name: true,
                topics: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!classDetails) {
      throw new Error("Class not found.");
    }

    const classRoadmapIds = classDetails.roadmaps.map(cr => cr.roadmap.id);
    const classTopicIds = classDetails.roadmaps.flatMap(cr => cr.roadmap.topics.map(t => t.id));

    // 4. Get all topics relevant to this class
    const topicsInClass = await prisma.topic.findMany({
      where: {
        id: {
          in: classTopicIds,
        },
      },
      include: {
        Vocab: true,
        Exercise: true,
      },
    });

    // 5. Generate report for the student based on topics in this class
    const report = await Promise.all(
      topicsInClass.map(async (topic) => {
        const vocabProgress = await prisma.userVocabProgress.findMany({
          where: {
            userId: studentId,
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
            userId: studentId,
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

    const totalTopics = topicsInClass.length;
    const totalTopicEnrolled = await prisma.userTopicProgress.count({
      where: {
        userId: studentId,
        topic: {
          id: {
            in: classTopicIds,
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
      classDetails: {
        id: classDetails.id,
        name: classDetails.name,
        code: classDetails.code,
        description: classDetails.description,
      },
      studentId,
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
}

module.exports = new ReportService();
