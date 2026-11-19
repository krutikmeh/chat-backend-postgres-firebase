import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createChatSchema,
//   manageGroupMembersSchema,
  sendMessageSchema,
  getMessagesSchema,
  markMessageReadSchema,
  updateLastSeenSchema,
  getUserChatsSchema,
} from '../types/chat.types.js';

const router = Router();
const controller = new ChatController();

// 1. Create or Get 1:1 Chat
router.post('/chat/create', validate(createChatSchema), controller.createChat);

// Bonus: Group Chat Creation & Management
// router.post('/chat/group', validate(createGroupChatSchema), controller.createGroupChat);
// router.post('/chat/:chatId/members', validate(manageGroupMembersSchema), controller.addGroupMember);
// router.delete('/chat/:chatId/members', validate(manageGroupMembersSchema), controller.removeGroupMember);

// 2. Send Message
router.post('/chat/:chatId/message/send', validate(sendMessageSchema), controller.sendMessage);

// 3. Get Messages
router.get('/chat/:chatId/messages', validate(getMessagesSchema), controller.getMessages);

// 4. Mark Message Read
router.post('/chat/:chatId/message/:messageId/read', validate(markMessageReadSchema), controller.markMessageRead);

// 5. Update Last Seen Message
router.post('/chat/:chatId/lastseen', validate(updateLastSeenSchema), controller.updateLastSeen);

// 6. List User Chats
router.get('/user/:userId/chats', validate(getUserChatsSchema), controller.getUserChats);

// Bonus: Message Edit & Soft-Delete
// router.patch('/chat/:chatId/message/:messageId', validate(editMessageSchema), controller.editMessage);
// router.delete('/chat/:chatId/message/:messageId', validate(deleteMessageSchema), controller.deleteMessage);

export default router;