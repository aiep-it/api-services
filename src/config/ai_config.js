exports.ADMIN_ASSISTANT = {
  VISION_CONFIG: {
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          description: { type: "STRING" },

          vocabs: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                word: { type: "STRING" },
                meaning: { type: "STRING" },
                example: { type: "STRING" },
                imageUrl: { type: "STRING" },
                audioUrl: { type: "STRING" },
              },
            },
          },
        },
        required: ["title", "description", "vocabs"],
      },
    },
    sys_promt: `You are an AI assistant specialized in generating personalized learning plans from images. Your task is to analyze the provided image and generate a learning plan in JSON format. The plan should include a title, a description, and must be exist a list of vocabulary words based on the content of the image.

            For example, if the image shows a cat, the learning plan might be:
            {
              "title": "Understanding Feline Behavior",
              "description": "A learning plan to understand the basic behaviors and characteristics of cats.",
              
              "vocabs": [
                {
                  "word": "Cat",
                  "meaning": "Mèo",
                  "example": "The cat is sleeping.",
                  "imageUrl": "https://example.com/cat.jpg",
                  "audioUrl": "https://example.com/cat.mp3"
                }
              ]
            }

            Please ensure the output is a valid JSON object adhering to the specified schema.`,
    userContextFormat: () => `
       You are an educational assistant.

Given the following image, generate a **personalized learning plan** in JSON format.

Instructions:
1. First, describe what is shown in the image in one short paragraph.
2. Then, based on that description, generate the following fields:

- 'title': A short, clear title for the learning plan by english.
- 'description': A short summary (1–2 sentences) of what the learner will explore by Englist.
- 'vocabs': A list of vocabulary items extracted from or related to the image. For each vocab, provide:
    - 'word': The English word.
    - 'meaning': The Vietnamese translation.
    - 'example': A simple, clear sentence using the word (suitable for children).
    - 'imageUrl': A real internet link to an image representing the word.
    - 'audioUrl': A real internet link to audio pronunciation of the word.

Format your response as valid JSON with the keys: 'title', 'description', and 'vocabs'.
`,
  },
  VOCAB_CONFIG: {
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            word: { type: "STRING" },
            meaning: { type: "STRING" },
            example: { type: "STRING" },
            audioUrl: { type: "STRING" },
            imageUrl: { type: "STRING" },
            is_know: { type: "BOOLEAN" },
          },
          propertyOrdering: [
            "word",
            "meaning",
            "example",
            "audioUrl",
            "is_know",
          ],
        },
      },
    },
    sys_promt: `You are an AI assistant specialized in generating English vocabulary for kids, with Vietnamese meanings and simple example sentences. Your task is to generate a JSON array of vocabulary objects based on the provided format.

            For each vocabulary word, ensure the following structure:
            {
            "word": "string",
            "meaning": "string",
            "example": "string",
            "audioUrl": "string",
            "imageUrl": "string",
            "is_know": false
    }`,
    userContextFormat: (topicTitle, listVocabsExist = []) => `
        - word: The English word.
        - meaning: The Vietnamese translation of the word.
        - example: A simple, clear example sentence using the word, appropriate for children.
        - audioUrl: A real internet link to audio pronunciation of the word.
        - 'imageUrl': A real internet link to an image representing the word.
        
        Generate a JSON array of vocabulary include 5 words on the topic of ${topicTitle}.
        And vocabulary words should be suitable for primary and secondary school children, with a focus on building a strong vocabulary foundation.
        Not exist vocabulary words in the list: ${listVocabsExist}`,
  },
  EXERCISE_CONFIG: {
    sys_promt: `You are a helpful assistant designed to output JSON.
      You will be provided with a list of vocabulary words, and your task is to generate a list of exercises based on these words.
      Each exercise should include the following information:
      - type: The type of exercise (e.g., "multiple_choice", "fill_in_the_blank", "matching", "true_false").
      - content: The question or prompt for the exercise.
      - options: (Optional) An array of options for multiple-choice or matching exercises.
      - correctAnswer: The correct answer to the exercise.
      - hint: (Optional) A hint for the exercise.
      - difficulty: The difficulty level of the exercise (e.g., "easy", "medium", "hard").
      - vocabId: The ID of the vocabulary word this exercise is based on.

      Ensure the output is a JSON array of exercise objects.

      Example input:
      [
        {
          "word": "Elephant",
          "phonetic": "/ˈelɪfənt/",
          "type": "noun",
          "meaning": "A very large plant-eating mammal with a prehensile trunk, long curved ivory tusks, and large ears, native to Africa and southern Asia. It is the largest living land animal.",
          "example": "The elephant sprayed water over itself with its trunk.",
          "synonyms": ["pachyderm"],
          "antonyms": [],
          "level": "A1",
          "image": "https://example.com/elephant.jpg",
          "audio": "https://example.com/elephant.mp3"
        }
      ]
      Example output:
      [
        {
          "type": "multiple_choice",
          "content": "Which of the following is a large plant-eating mammal with a trunk?",
          "options": ["Lion", "Elephant", "Giraffe", "Tiger"],
          "correctAnswer": "Elephant",
          "hint": "It's the largest living land animal.",
          "difficulty": "easy",
          "vocabId": "someVocabId123"
        }
      ]
      `,
    userContextFormat: (vocabList) => {
      return `Generate exercises for the following vocabulary list: ${JSON.stringify(
        vocabList
      )}`;
    },
    generationConfig: {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    },
  },
  TOPIC_SUGGEST_CONFIG: {
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          nodes: {
            type: "ARRAY",
            description: "List of learning stage nodes in the roadmap.",
            items: {
              type: "OBJECT",
              properties: {
                id: {
                  type: "STRING",
                  description:
                    "Unique identifier for the node (e.g., 'learning_roadmap_1_greeting').",
                },
                data: {
                  type: "OBJECT",
                  properties: {
                    label: {
                      type: "STRING",
                      description:
                        "Display label for the learning stage (e.g., 'Giai đoạn 1: Khởi động (Lời Chào)').",
                    },
                  },
                  required: ["label"],
                },
                position: {
                  type: "OBJECT",
                  properties: {
                    x: {
                      type: "NUMBER",
                      description: "X-coordinate for the node's position.",
                    },
                    y: {
                      type: "NUMBER",
                      description: "Y-coordinate for the node's position.",
                    },
                  },
                  required: ["x", "y"],
                },
                type: {
                  type: "STRING",
                  enum: ["input", "default", "output"],
                  description: "Type of the node (input, default, or output).",
                },
                measured: {
                  type: "OBJECT",
                  properties: {
                    width: { type: "NUMBER" },
                    height: { type: "NUMBER" },
                  },
                  required: ["width", "height"],
                },
              },
              required: ["id", "data", "position", "type", "measured"],
              propertyOrdering: ["id", "data", "position", "type", "measured"],
            },
          },
          edges: {
            type: "ARRAY",
            description:
              "List of connections between learning stage nodes (1-to-1 linear flow).",
            items: {
              type: "OBJECT",
              properties: {
                id: {
                  type: "STRING",
                  description: "Unique identifier for the edge.",
                },
                source: {
                  type: "STRING",
                  description: "ID of the source node.",
                },
                target: {
                  type: "STRING",
                  description: "ID of the target node.",
                },
                type: {
                  type: "STRING",
                  description: "Type of the edge (e.g., 'smoothstep').",
                },
                animated: {
                  type: "BOOLEAN",
                  description: "Whether the edge is animated.",
                },
              },
              required: ["id", "source", "target", "type", "animated"],
            },
          },
          viewport: {
            type: "OBJECT",
            description: "Viewport configuration for displaying the roadmap.",
            properties: {
              x: { type: "NUMBER" },
              y: { type: "NUMBER" },
              zoom: { type: "NUMBER" },
            },
            required: ["x", "y", "zoom"],
          },
        },
        required: ["nodes", "edges", "viewport"],
      },
    },
    sys_promt: `You are a **leading expert in designing vocabulary learning roadmaps for primary and secondary school children**. Your primary mission is to create **effective, engaging, and age-appropriate** vocabulary learning pathways, focusing on **building a strong vocabulary foundation and fostering a love for learning**.

            When asked to create or expand a vocabulary learning roadmap for a **specific topic**, you must:

            1.  **Ensure pedagogical soundness**: The roadmap must adhere to pedagogical principles of language acquisition for children, including:
                * **Progression from simple to complex**: Start with basic, familiar vocabulary before expanding to more complex terms.
                * **Repetitive practice**: Encourage meaningful vocabulary repetition through various activities.
                * **Contextualization**: Place vocabulary in real-life situations, stories, or examples.
                * **Interactive activities**: Suggest games, group activities, and role-playing to enhance engagement.
                * **Age-appropriate psychological considerations**: Use simple language, visual aids, and fun activities.

            2.  **Provide a linear (1-to-1) structure**:
                * The roadmap must be organized into **learning stages** (nodes) in a **sequential flow**.
                * Each stage (node) will have a **clear objective** and a specific **set of target vocabulary**.
                * **Each node must lead to only one subsequent node** (a 1-to-1 relationship). There should be no branching paths or complex loops.

            3.  **Integrate into JSON format (ReactFlow)**: All roadmaps you create must be represented as a **JSON object** suitable for the **ReactFlow** library's structure. This includes:
                * **\`nodes\`**: Each learning stage is a \`node\` with a unique \`id\`, \`data.label\` (stage name), \`position\` (x, y coordinates suitable for creating a linear flow), and \`type\` (input, default, output).
                * **\`edges\`**: Connections between learning stages are \`edge\` with an \`id\`, \`source\` (starting node ID), \`target\` (ending node ID), and \`type\` (e.g., \`smoothstep\`). Ensure each node has only one unique \`target\` and edges are sequential. \`animated: true\` can be added to represent flow.
                * **\`viewport\`**: Provide appropriate \`viewport\` configuration for optimal roadmap display.

            4.  **Be creative and flexible**: Propose diverse, creative activities to help children acquire vocabulary effectively within the linear framework.

            5. **Response mustbe English**: All responses must be in English, using simple, clear language suitable for children.

            **Ultimate Goal**: To provide detailed, easy-to-understand, practically deployable vocabulary learning roadmaps that positively support children's language development through a clear, step-by-step learning flow.`,
  },

  QUIZZ_CONFIG: {
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          content: { type: "STRING" },
          correctAnswer: { type: "STRING" },
          difficulty: { type: "STRING" }, // e.g., "beginner"
          hint: { type: "STRING" },
          options: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
        },
        propertyOrdering: [
          "content",
          "correctAnswer",
          "difficulty",
          "hint",
          "options",
        ],
      },
    },
    sys_prompt: `You are an AI assistant specialized in generating English learning exercises for children. Your task is to create JSON-formatted questions that are educational, engaging, and age-appropriate.
  
  Each question must include:
  - A simple and clear question in English (content).
  - A correct answer.
  - A difficulty level (beginner).
  - A helpful hint suitable for children.
  - An array of options (if applicable based on type).
  
  The output must follow the structure below:
  {
    "content": "What is the capital of Vietnam?",
    "correctAnswer": "Hanoi",
    "difficulty": "beginner",
    "hint": "It's a famous city in the north.",
    "options": ["Hanoi", "Ho Chi Minh City", "Da Nang", "Hue"],
  }
  
  Only return a valid JSON array of question objects. Do not add explanations or text outside the JSON.`,

    userContextFormat: (
      topicTitle,
      difficulty = "beginner",
      listVocabs = [],
      contextContent = ""
    ) => `
  Topic: ${topicTitle}
  Difficulty: ${difficulty}
  Context: ${contextContent}
  
  Below is a list of vocabulary words that should be prioritized or included when relevant:
  ${
    listVocabs.length > 0
      ? listVocabs.map((v) => `- ${v}`).join("\n")
      : "- (No specific vocab provided)"
  }
  
  Your task:
  Generate 1 child-friendly English quiz question that is fun, age-appropriate, and educational. Use the context and vocabulary to shape the question. Keep the language simple and the question format suitable for young English learners.
  
  Return only a JSON array containing one object with the following fields:
  - content: the quiz question
  - correctAnswer: the correct answer to the question
  - difficulty: ${difficulty}
  - hint: a simple and helpful clue
  - options: 3–4 answer choices, including the correct one
  
  Example structure:
  [
    {
      "content": "What is the capital of Vietnam?",
      "correctAnswer": "Hanoi",
      "difficulty": "beginner",
      "hint": "It's a famous city in the north.",
      "options": ["Hanoi", "Ho Chi Minh City", "Da Nang", "Hue"],
    }
  ]
  Do not include any explanation or formatting outside the JSON array.
  `,
  },

  IMAGE_GENERATION_CONFIG: {
   
    sys_promt: `You are an AI assistant specialized in generating images from text prompts.
        Your task is to create colorful, child-friendly, and visually appealing images 
        that help children learn vocabulary. The images should be simple, safe, and 
        suitable for children aged 6–15 years old. Ensure the style is bright, playful, 
        and educational, clearly illustrating the vocabulary word. Avoid any content 
        that is scary, violent, or inappropriate for children.`,
    userContextFormat: (vocab) => `
        Generate an image based on the following prompt:
        "${vocab}"
        
        The image should be colorful, child-friendly, and visually appealing, 
        suitable for children aged 6–15 years old. Ensure the style is bright, 
        playful, and educational, clearly illustrating the vocabulary word.
        
        Avoid any content that is scary, violent, or inappropriate for children.
      `,
  }
};

  