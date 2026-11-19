import { Timestamp } from 'firebase-admin/firestore';
import { Op } from 'sequelize';
import { sequelize, User, Chat, ChatParticipant } from '../models/index.js';
import { firestore, serverTimestamp } from '../config/firebase.js';
import { AppError } from '../middlewares/error.middleware.js';
import { MessageDTO, UserChatDTO } from '../types/chat.types.js';

export class ChatService {
  private async ensureUsersExist(userIds: string[]): Promise<void> {
    const uniqueIds = Array.from(new Set(userIds));
    const records = uniqueIds.map((id) => ({
      id,
      name: `User ${id}`,
      email: `${id}@example.com`,
    }));

    await User.bulkCreate(records, {
      ignoreDuplicates: true,
    });
  }

  private async verifyMembership(chatId: string, userId: string): Promise<void> {
    const participant = await ChatParticipant.findOne({
      where: { chatId, userId },
    });

    if (!participant) {
      const chat = await Chat.findByPk(chatId);
      if (!chat) {
        throw new AppError(`Chat with ID '${chatId}' not found`, 404);
      }
      throw new AppError(`User '${userId}' is not a member of chat '${chatId}'`, 403);
    }
  }

  // 1. Create or Get 1:1 Chat
  async createOrGetDirectChat(userAId: string, userBId: string): Promise<{ chatId: string }> {
    await this.ensureUsersExist([userAId, userBId]);

    const sortedIds = [userAId, userBId].sort();
    const directChatKey = `${sortedIds[0]}_${sortedIds[1]}`;

    const existingChat = await Chat.findOne({
      where: { directChatKey },
      attributes: ['id'],
    });

    if (existingChat) {
      return { chatId: existingChat.id };
    }

    const newChat = await sequelize.transaction(async (t) => {
      const chat = await Chat.create(
        {
          isGroup: false,
          directChatKey,
        },
        { transaction: t }
      );

      await ChatParticipant.bulkCreate(
        [
          { chatId: chat.id, userId: userAId },
          { chatId: chat.id, userId: userBId },
        ],
        { transaction: t }
      );

      return chat;
    });

    return { chatId: newChat.id };
  }

  // 2. Send Message
  async sendMessage(chatId: string, senderId: string, text: string): Promise<MessageDTO> {
    await this.verifyMembership(chatId, senderId);

    const messagesRef = firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages');

    const newDocRef = messagesRef.doc();
    const now = Timestamp.now();

    await newDocRef.set({
      senderId,
      text,
      createdAt: serverTimestamp(),
      isDeleted: false,
      readBy: {
        [senderId]: now,
      },
    });

    await Chat.update({ updatedAt: new Date() }, { where: { id: chatId } });

    return {
      id: newDocRef.id,
      chatId,
      senderId,
      text,
      createdAt: now.toDate().toISOString(),
      isDeleted: false,
      readBy: {
        [senderId]: now.toDate().toISOString(),
      },
    };
  }

  // 3. Get Messages ordered by timestamp
  async getMessages(chatId: string, limit: number): Promise<MessageDTO[]> {
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      throw new AppError(`Chat with ID '${chatId}' not found`, 404);
    }

    const snapshot = await firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const messages: MessageDTO[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAtTs = data.createdAt as Timestamp | undefined;
      const editedAtTs = data.editedAt as Timestamp | undefined;

      const formattedReadBy: Record<string, string> = {};
      if (data.readBy && typeof data.readBy === 'object') {
        for (const [uid, ts] of Object.entries(data.readBy)) {
          if (ts instanceof Timestamp) {
            formattedReadBy[uid] = ts.toDate().toISOString();
          }
        }
      }

      return {
        id: doc.id,
        chatId,
        senderId: data.senderId,
        text: data.text,
        createdAt: createdAtTs ? createdAtTs.toDate().toISOString() : null,
        ...(editedAtTs && { editedAt: editedAtTs.toDate().toISOString() }),
        isDeleted: Boolean(data.isDeleted),
        readBy: formattedReadBy,
      };
    });

    return messages.reverse();
  }

  // 4. Mark Message Read
  async markMessageRead(chatId: string, messageId: string, userId: string): Promise<void> {
    await this.verifyMembership(chatId, userId);

    const messageRef = firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId);

    const messageDoc = await messageRef.get();
    if (!messageDoc.exists) {
      throw new AppError(`Message '${messageId}' not found in chat '${chatId}'`, 404);
    }

    await messageRef.update({
      [`readBy.${userId}`]: serverTimestamp(),
    });
  }

  // 5. Update Last Seen Message
  async updateLastSeen(chatId: string, userId: string, messageId: string): Promise<void> {
    await this.verifyMembership(chatId, userId);

    const messageRef = firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId);

    const messageDoc = await messageRef.get();
    if (!messageDoc.exists) {
      throw new AppError(`Message '${messageId}' not found in chat '${chatId}'`, 404);
    }

    const lastSeenRef = firestore
      .collection('chats')
      .doc(chatId)
      .collection('lastSeen')
      .doc(userId);

    await lastSeenRef.set(
      {
        messageId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  // 6. List User Chats
  async getUserChats(userId: string): Promise<UserChatDTO[]> {
    const memberships = await ChatParticipant.findAll({
      where: { userId },
      attributes: ['chatId'],
    });

    const chatIds = memberships.map((m) => m.chatId);
    if (chatIds.length === 0) {
      return [];
    }

    const chats = await Chat.findAll({
      where: { id: { [Op.in]: chatIds } },
      include: [
        {
          model: ChatParticipant,
          as: 'participants',
          attributes: ['userId'],
        },
      ],
      order: [['updatedAt', 'DESC']],
    });

    return chats.map((chat) => ({
      chatId: chat.id,
      isGroup: chat.isGroup,
      name: chat.name ?? null,
      memberIds: chat.participants ? chat.participants.map((p) => p.userId) : [],
      updatedAt: chat.updatedAt,
    }));
  }

}