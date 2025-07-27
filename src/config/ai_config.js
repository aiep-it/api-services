export const ADMIN_ASSISTANT = {
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
            imageUrl: { type: "STRING" },
            audioUrl: { type: "STRING" },
            is_know: { type: "BOOLEAN" },
          },
          propertyOrdering: [
            "word",
            "meaning",
            "example",
            "imageUrl",
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
            "imageUrl": "string",
            "audioUrl": "string",
            "is_know": false
    }`,
    userContextFormat: (topicTitle) => `
        - word: The English word.
        - meaning: The Vietnamese translation of the word.
        - example: A simple, clear example sentence using the word, appropriate for children.
        - imageUrl: Provide a placeholder image URL. Use a format like "https://placehold.co/200x200/cccccc/000000?text=[Word]" where [Word] is the actual word.
        - audioUrl: Provide a placeholder audio URL. Use a format like "https://example.com/audio/[word].mp3" where [word] is the actual word in lowercase.
        - is_know: Always set this to false.
        
        Generate a JSON array of vocabulary words on the topic of ${topicTitle}.`,
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

            **Ultimate Goal**: To provide detailed, easy-to-understand, practically deployable vocabulary learning roadmaps that positively support children's language development through a clear, step-by-step learning flow.`,
  },
};
