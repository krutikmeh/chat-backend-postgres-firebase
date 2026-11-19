import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { sequelize } from '../config/database.js';
import { Chat } from './Chat.model.js';
import { User } from './User.model.js';

export class ChatParticipant extends Model<
  InferAttributes<ChatParticipant>,
  InferCreationAttributes<ChatParticipant>
> {
  declare id: CreationOptional<string>;
  declare chatId: ForeignKey<Chat['id']>;
  declare userId: ForeignKey<User['id']>;
  declare joinedAt: CreationOptional<Date>;
}

ChatParticipant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'chats', key: 'id' },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'chat_participants',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['chatId', 'userId'],
      },
      {
        fields: ['userId'],
      },
    ],
  }
);