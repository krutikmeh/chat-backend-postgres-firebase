import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';
import { sequelize } from '../config/database.js';
import type { ChatParticipant } from './ChatParticipant.model.ts';

export class Chat extends Model<InferAttributes<Chat>, InferCreationAttributes<Chat>> {
  declare id: CreationOptional<string>;
  declare isGroup: CreationOptional<boolean>;
  declare name: CreationOptional<string | null>;
  declare directChatKey: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare participants?: NonAttribute<ChatParticipant[]>;
}

Chat.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    isGroup: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    directChatKey: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'chats',
    timestamps: true,
  }
);