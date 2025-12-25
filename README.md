# 📚 Library Management API

## 📋 Prerequisites

- Node.js 18+ (for local development)
- MySQL 8.0+ (for local development)
- Docker & Docker Compose (for containerized deployment)

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/talhaaydn/library-api.git
cd library-api
```

### Install Dependencies

```bash
npm install
```

### Environment Setup

```bash
# Copy .env.example to .env
cp .env.example .env
```

## 🐳 Quick Start with Docker (Recommended)

```bash
# 1. Start MySQL service
docker-compose up -d

# 2. Run database migrations
npm run migration:run

# 3. Start the application
npm start
```

The API will be available at `http://localhost:3000`

## 🚀 Features

- **User Management**: Create and manage library users
- **Book Management**: CRUD operations for books
- **Borrowing System**: Borrow and return books with tracking
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Centralized error handling with custom error classes
- **Validation**: Request validation using class-validator
- **Database**: MySQL with TypeORM
- **Docker Support**: Containerized deployment with Docker Compose

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: MySQL 8.0
- **Validation**: class-validator, class-transformer
- **Testing**: Jest, Supertest
- **Security**: Helmet, CORS, Rate Limiting

## 📡 API Endpoints

### Users

```
GET    /api/users          # List all users
GET    /api/users/:id      # Get user details with borrowing history
POST   /api/users          # Create new user
```

### Books

```
GET    /api/books          # List all books
GET    /api/books/:id      # Get book details
POST   /api/books          # Create new book
```

### Borrowing

```
POST   /api/users/:userId/borrow/:bookId    # Borrow a book
POST   /api/users/:userId/return/:bookId    # Return a book
```

## 🏗️ Project Structure

```
library-api/
├── src/
│   ├── app.ts                      # Express app configuration
│   ├── server.ts                   # Server entry point
│   ├── config/                     # Configuration files
│   │   ├── app.config.ts
│   │   └── database.config.ts
│   ├── common/                     # Shared utilities
│   │   ├── errors/                 # Custom error classes
│   │   └── middlewares/            # Express middlewares
│   ├── modules/                    # Feature modules
│   │   ├── users/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   ├── mappers/
│   │   │   ├── __tests__/
│   │   │   └── user.routes.ts
│   │   ├── books/
│   │   └── borrowings/
│   └── test/                       # Test utilities
├── docker-compose.yml              # Docker Compose configuration
├── .dockerignore                   # Docker ignore patterns
├── .env.example                    # Environment variables template
├── jest.config.js                  # Jest configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json
```
## 📊 Database Schema

### Users Table
- `id`: Primary key
- `name`: User name
- `createdAt`: Registration date

### Books Table
- `id`: Primary key
- `name`: Book title
- `createdAt`: Creation date

### UserBooks Table (Borrowing Records)
- `id`: Primary key
- `userId`: Foreign key to Users
- `bookId`: Foreign key to Books
- `borrowedAt`: Borrow timestamp
- `returnedAt`: Return timestamp (nullable)
- `userScore`: User rating (1-10, nullable)