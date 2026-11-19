import { z } from 'zod';

export const createChatSchema = z.object({
  body: z
    .object({
      userAId: z.string().min(1, 'userAId is required'),
      userBId: z.string().min(1, 'userBId is required'),
    })
    .refine((data) => data.userAId !== data.userBId, {
      message: 'Cannot create a 1:1 chat with the same user',
    }),
});

export const createGroupChatSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Group name is required'),
    memberIds: z.array(z.string().min(1)).min(2, 'At least 2 members are required'),
  }),
});

export const sendMessageSchema = z.object({
  params: z.object({
    chatId: z.string().uuid('Invalid chatId format'),
  }),
  body: z.object({
    senderId: z.string().min(1, 'senderId is required'),
    text: z.string().min(1, 'Message text cannot be empty').max(4000),
  }),
});

export const getMessagesSchema = z.object({
  params: z.object({
    chatId: z.string().uuid('Invalid chatId format'),
  }),
  query: z.object({
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 50))
      .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
        message: 'limit must be between 1 and 100',
      }),
  }),
});

export const markMessageReadSchema = z.object({
  params: z.object({
    chatId: z.string().uuid('Invalid chatId format'),
    messageId: z.string().min(1),
  }),
  body: z.object({
    userId: z.string().min(1, 'userId is required'),
  }),
});

export const updateLastSeenSchema = z.object({
  params: z.object({
    chatId: z.string().uuid('Invalid chatId format'),
  }),
  body: z.object({
    userId: z.string().min(1, 'userId is required'),
    messageId: z.string().min(1, 'messageId is required'),
  }),
});

export const getUserChatsSchema = z.object({
  params: z.object({
    userId: z.string().min(1),
  }),
});

export interface MessageDTO {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string | null;
  isDeleted: Boolean;
  readBy: Record<string, string>;
}

export interface UserChatDTO {
  chatId: string;
  isGroup: boolean;
  name: string | null;
  memberIds: string[];
  updatedAt: Date;
}