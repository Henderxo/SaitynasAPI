# Game Forum API

## Overview

**Game Forum API** is a RESTful API built with **Node.js** and **Express** that allows users to manage games, developers, and comments. This API enables functionalities such as user management, developer management, game management, and comment management while ensuring proper user permissions and cascading deletions for maintaining data integrity.

## Features

- User management (create, read, update, delete).
- Developer management linked to users.
- Game management linked to developers.
- Comment management linked to games and users.
- Support for cascading deletions (removing related comments and games when a user or developer is deleted).
- Query expansion for related fields.

- ## Prerequisites

- **Node.js**: v14 or above
- **MongoDB**: A MongoDB database (local or cloud, e.g., MongoDB Atlas)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Henderxo/SaitynasAPI.git
cd your-project-directory
```
### 2. Install Dependencies

```npm install```

### 3. Environment Setup
Replace in **.env** with your mongodb connection string.
```
MONGODB_URI=<your-mongodb-connection-string>
PORT=3000
```

### 4. Run the program
```npm run dev ```

## API Endpoints

# User Routes

### User Routes

| Method | Endpoint               | Description                     |
|--------|------------------------|---------------------------------|
| GET    | `/users`               | Retrieve all users              |
| GET    | `/users/:id`           | Retrieve user by ID             |
| POST   | `/users`               | Create a new user               |
| PUT    | `/users/:id`           | Update an existing user         |
| DELETE | `/users/:id`           | Delete a user                   |

### Developer Routes

| Method | Endpoint                           | Description                     |
|--------|------------------------------------|---------------------------------|
| GET    | `/developers`                      | Retrieve all developers         |
| GET    | `/developers/:id`                  | Retrieve developer by ID        |
| POST   | `/developers`                      | Create a new developer          |
| PUT    | `/developers/:id`                  | Update an existing developer    |
| DELETE | `/developers/:id`                  | Delete a developer              |

### Game Routes

| Method | Endpoint               | Description                     |
|--------|------------------------|---------------------------------|
| GET    | `/games`               | Retrieve all games              |
| GET    | `/games/:id`           | Retrieve game by ID             |
| POST   | `/games`               | Create a new game               |
| PUT    | `/games/:id`           | Update an existing game         |
| DELETE | `/games/:id`           | Delete a game                   |

### Comment Routes

| Method | Endpoint                                        | Description                     |
|--------|-------------------------------------------------|---------------------------------|
| GET    | `/comments`                                     | Retrieve all comments           |
| GET    | `/comments/:id`                                 | Retrieve comment by id          |
| POST   | `/comments`                                     | Create a new comment            |
| PUT    | `/comments/:id`                                 | Update an existing comment      |
| DELETE | `/comments/:id`                                 | Delete a comment                |

### More Routes

| Method | Endpoint                                              | Description                         |
|--------|-------------------------------------------------------|-------------------------------------|
| GET    | `/developers/:developerId/games`                      | Retrieve games by developer ID      |
| GET    | `/games/:gameId/comments`                             | Retrieve comments by game ID        |
| GET    | `/developers/:developerId/comments`                   | Retrieve comments by developer ID   |
| GET    | `/users/:userId/developers`                           | Retrieve developers by user ID      |
