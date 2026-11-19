export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Hybrid Chat Backend API (PostgreSQL + Firebase Firestore)',
    version: '1.0.0',
    description:
      'Production chat backend storing users, chat rooms, and memberships in PostgreSQL (Sequelize) and real-time messages, read receipts, and last-seen pointers in Firebase Firestore.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server',
    },
  ],
  paths: {
    '/chat/create': {
      post: {
        summary: 'Create or Get 1:1 Chat',
        tags: ['Chats'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userAId', 'userBId'],
                properties: {
                  userAId: { type: 'string', example: 'alice' },
                  userBId: { type: 'string', example: 'bob' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Returns existing or newly created chatId' },
        },
      },
    },
    '/chat/{chatId}/message/send': {
      post: {
        summary: 'Send Message',
        tags: ['Messages'],
        parameters: [
          { name: 'chatId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['senderId', 'text'],
                properties: {
                  senderId: { type: 'string', example: 'alice' },
                  text: { type: 'string', example: 'Hello Bob!' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Message stored in Firestore' },
        },
      },
    },
    '/chat/{chatId}/messages': {
      get: {
        summary: 'Get Messages (Ordered by Timestamp)',
        tags: ['Messages'],
        parameters: [
          { name: 'chatId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', default: 50 } },
        ],
        responses: {
          200: { description: 'Chronological list of messages with read receipts' },
        },
      },
    },
    '/chat/{chatId}/message/{messageId}/read': {
      post: {
        summary: 'Mark Message Read',
        tags: ['Read Receipts & Last Seen'],
        parameters: [
          { name: 'chatId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'messageId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: { type: 'string', example: 'bob' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Read receipt updated in Firestore' },
        },
      },
    },
    '/chat/{chatId}/lastseen': {
      post: {
        summary: 'Update Last Seen Message',
        tags: ['Read Receipts & Last Seen'],
        parameters: [
          { name: 'chatId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'messageId'],
                properties: {
                  userId: { type: 'string', example: 'bob' },
                  messageId: { type: 'string', example: 'firestore_msg_id' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Last seen pointer updated in Firestore' },
        },
      },
    },
    '/user/{userId}/chats': {
      get: {
        summary: 'List User Chats',
        tags: ['Chats'],
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string', example: 'alice' } },
        ],
        responses: {
          200: { description: 'List of user chats with memberIds from PostgreSQL' },
        },
      },
    },
  },
};