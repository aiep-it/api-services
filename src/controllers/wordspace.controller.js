const prisma = require('../../lib/prisma');

/**
 * @swagger
 * tags:
 *   name: WordSpace
 *   description: WordSpace management
 */

/**
 * @swagger
 * /wordspace:
 *   get:
 *     summary: Get the user's word space
 *     tags: [WordSpace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's word space
 *       500:
 *         description: Failed to get word space
 */
exports.getWordSpace = async (req, res) => {
  try {
    const userId = req.user.id;
    const wordSpace = await prisma.roadmap.findFirst({
      where: {
        userId,
        isWordSpace: true,
      },
      include: {
        topics: {
          include: {
            Vocab: true,
          },
        },
      },
    });
    res.status(200).json(wordSpace);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get word space' });
  }
};

/**
 * @swagger
 * /wordspace/topics:
 *   post:
 *     summary: Add a new topic to the word space
 *     tags: [WordSpace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: The created topic
 *       404:
 *         description: Word space not found
 *       500:
 *         description: Failed to add topic
 */
exports.addTopic = async (req, res) => {
  const user = req.user;
  try {
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = user.id;
    const { title, description } = req.body;
    let wordSpace = await prisma.roadmap.findFirst({
      where: {
        userId: userId,
        isWordSpace: true,
      },
    });

    if (!wordSpace) {
      wordSpace = await prisma.roadmap.create({
        data: {
          name: 'My Wordspace',
          isWordSpace: true,
          userId,
        },
      });
    }

    const topic = await prisma.topic.create({
      data: {
        title,
        description,
        roadmapId: wordSpace.id,
      },
    });
    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add topic' });
  }
};

/**
 * @swagger
 * /wordspace/topics/{topicId}/vocabs:
 *   post:
 *     summary: Add a new vocabulary to a topic
 *     tags: [WordSpace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               word:
 *                 type: string
 *               meaning:
 *                 type: string
 *               example:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               audioUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: The created vocabulary
 *       500:
 *         description: Failed to add vocab
 */
exports.addVocab = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { word, meaning, example, imageUrl, audioUrl } = req.body;
    const vocab = await prisma.vocab.create({
      data: {
        topicId,
        word,
        meaning,
        example,
        imageUrl,
        audioUrl,
      },
    });
    res.status(201).json(vocab);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add vocab' });
  }
};

exports.addMultipleVocabs = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { vocabs } = req.body;

    const vocabData = vocabs.map((v) => ({
      ...v,
      topicId,
    }));

    const result = await prisma.vocab.createMany({
      data: vocabData,
      skipDuplicates: true,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add multiple vocabs' });
  }
};