import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service.js';

const chatService = new ChatService();

export class ChatController {
  createChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userAId, userBId } = req.body;
      const result = await chatService.createOrGetDirectChat(userAId, userBId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chatId = req.params.chatId as string;
      const { senderId, text } = req.body;
      const message = await chatService.sendMessage(chatId, senderId, text);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chatId = req.params.chatId as string;
      const limit = Number(req.query.limit) || 50;
      const messages = await chatService.getMessages(chatId, limit);
      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  };

  markMessageRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chatId = req.params.chatId as string;
      const messageId = req.params.messageId as string;
      const { userId } = req.body;
      await chatService.markMessageRead(chatId, messageId, userId);
      res.status(200).json({ success: true, message: 'Message marked as read' });
    } catch (error) {
      next(error);
    }
  };

  updateLastSeen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chatId = req.params.chatId as string;
      const { userId, messageId } = req.body;
      await chatService.updateLastSeen(chatId, userId, messageId);
      res.status(200).json({ success: true, message: 'Last seen updated' });
    } catch (error) {
      next(error);
    }
  };

  getUserChats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const chats = await chatService.getUserChats(userId);
      res.status(200).json(chats);
    } catch (error) {
      next(error);
    }
  };
}