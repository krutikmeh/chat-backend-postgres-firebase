# Chat Backend (Node.js, TypeScript, PostgreSQL & Firebase Firestore)

A RESTful chat backend built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL (Sequelize)**, and **Firebase Firestore**.

## Project Overview

- **PostgreSQL + Sequelize** manages users, chat rooms, and participant memberships. A unique sorted key (`userA_userB`) prevents duplicate 1:1 chats, and SQL joins fetch a user's active chats with member IDs.
- **Firebase Firestore** stores messages, read receipts, and last-seen pointers under `chats/{chatId}/messages` and `chats/{chatId}/lastSeen/{userId}` using server-generated timestamps.
- **Validation & Access Control:** Request payloads are validated with **Zod**, and every message or read-receipt operation verifies chat membership in PostgreSQL before touching Firestore.
- **Interactive Docs:** Swagger UI is served at `/api-docs` for testing all endpoints directly in the browser.

## API Endpoints

### Core Endpoints
- `POST /chat/create` — Create or fetch an existing 1:1 chat (`{ "userAId", "userBId" }`)
- `POST /chat/:chatId/message/send` — Send a message (`{ "senderId", "text" }`)
- `GET /chat/:chatId/messages?limit=50` — Get messages ordered chronologically
- `POST /chat/:chatId/message/:messageId/read` — Mark a message as read (`{ "userId" }`)
- `POST /chat/:chatId/lastseen` — Update a user's last-seen message (`{ "userId", "messageId" }`)
- `GET /user/:userId/chats` — List all chats and member IDs for a user