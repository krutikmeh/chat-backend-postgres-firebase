import { sequelize } from '../config/database.js';
import { User } from './User.model.js';
import { Chat } from './Chat.model.js';
import { ChatParticipant } from './ChatParticipant.model.js';

Chat.hasMany(ChatParticipant, { foreignKey: 'chatId', as: 'participants' });
ChatParticipant.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

User.hasMany(ChatParticipant, { foreignKey: 'userId', as: 'chatMemberships' });
ChatParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export const initDatabase = async (): Promise<void> => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
};

export { sequelize, User, Chat, ChatParticipant };