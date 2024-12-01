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

# Games API Documentation

## Table of Contents

- [Authentication Routes](#authentication-routes)
- [User Routes](#user-routes)
- [Game Routes](#game-routes)
- [Developer Routes](#developer-routes)
- [Comment Routes](#comment-routes)
- [Additional Routes](#additional-routes)

---

## Authentication Routes

| **Method** | **Route**   | **Description**     | **Request Body**                                         | **Response**                      |
|------------|-------------|---------------------|----------------------------------------------------------|-----------------------------------|
| `POST`     | `/login`    | Login to get a JWT  | `{ "username": "your_username", "password": "your_password" }` | `200 OK`: JWT token <br> `401 Unauthorized`: Invalid credentials |
| `POST`     | `/refresh`  | Refresh JWT token   | `{ "refreshToken": "your_refresh_token" }`               | `200 OK`: New JWT token <br> `401 Unauthorized`: Invalid refresh token |

---

## User Routes

| **Method** | **Route**        | **Description**             | **Request Body**                                         | **Response**                        |
|------------|------------------|-----------------------------|----------------------------------------------------------|-------------------------------------|
| `GET`      | `/users`         | Get all users               | No body required                                          | `200 OK`: List of users <br> `500 Internal Server Error`: Error fetching users |
| `GET`      | `/users/:id`     | Get a user by ID            | No body required. URL param: `id` (user ID)              | `200 OK`: User data <br> `404 Not Found`: User not found <br> `500 Internal Server Error`: Error fetching user |
| `POST`     | `/users`         | Create a new user           | `{ "username": "username", "password": "password", "email": "user@example.com" }` | `201 Created`: User created successfully <br> `422 Unprocessable Entity`: Validation error <br> `500 Internal Server Error`: Error creating user |
| `PUT`      | `/users/:id`     | Update a user by ID         | `{ "username": "new_username", "password": "new_password" }` | `200 OK`: User updated successfully <br> `404 Not Found`: User not found <br> `500 Internal Server Error`: Error updating user |
| `DELETE`   | `/users/:id`     | Delete a user by ID         | No body required. URL param: `id` (user ID)              | `200 OK`: User deleted successfully <br> `404 Not Found`: User not found <br> `500 Internal Server Error`: Error deleting user |

---

## Game Routes

| **Method** | **Route**        | **Description**             | **Request Body**                                         | **Response**                       |
|------------|------------------|-----------------------------|----------------------------------------------------------|------------------------------------|
| `GET`      | `/games`         | Get all games               | No body required                                          | `200 OK`: List of games <br> `500 Internal Server Error`: Error fetching games |
| `GET`      | `/games/:id`     | Get a game by ID            | No body required. URL param: `id` (game ID)              | `200 OK`: Game data <br> `404 Not Found`: Game not found <br> `500 Internal Server Error`: Error fetching game |
| `POST`     | `/games`         | Create a new game           | `{ "title": "Game Title", "genre": "Action", "platform": "PC", "controllerSupport": true, "language": "English", "playerType": "Single_player", "developerId": "developerId", "description": "Game Description" }` | `201 Created`: Game created successfully <br> `422 Unprocessable Entity`: Validation error <br> `500 Internal Server Error`: Error creating game |
| `PUT`      | `/games/:id`     | Update a game by ID         | `{ "title": "Updated Title", "genre": "Racing", "platform": "Switch", "controllerSupport": true, "language": "English", "playerType": "Multiplayer", "developerId": "developerId", "description": "Updated Description" }` | `200 OK`: Game updated successfully <br> `404 Not Found`: Game not found <br> `500 Internal Server Error`: Error updating game |
| `DELETE`   | `/games/:id`     | Delete a game by ID         | No body required. URL param: `id` (game ID)              | `200 OK`: Game deleted successfully <br> `404 Not Found`: Game not found <br> `500 Internal Server Error`: Error deleting game |

---

## Developer Routes

| **Method** | **Route**               | **Description**                               | **Request Body**                                         | **Response**                       |
|------------|-------------------------|-----------------------------------------------|----------------------------------------------------------|------------------------------------|
| `GET`      | `/developers`           | Get all developers                           | No body required                                          | `200 OK`: List of developers <br> `500 Internal Server Error`: Error fetching developers |
| `GET`      | `/developers/:id`       | Get a developer by ID                        | No body required. URL param: `id` (developer ID)         | `200 OK`: Developer data <br> `404 Not Found`: Developer not found <br> `500 Internal Server Error`: Error fetching developer |
| `POST`     | `/developers`           | Create a new developer                       | `{ "name": "Developer Name", "bio": "Developer Bio", "logo": "developer_logo_url" }` | `201 Created`: Developer created successfully <br> `422 Unprocessable Entity`: Validation error <br> `500 Internal Server Error`: Error creating developer |
| `PUT`      | `/developers/:id`       | Update a developer by ID                     | `{ "name": "Updated Name", "bio": "Updated Bio" }`        | `200 OK`: Developer updated successfully <br> `404 Not Found`: Developer not found <br> `500 Internal Server Error`: Error updating developer |
| `DELETE`   | `/developers/:id`       | Delete a developer by ID                     | No body required. URL param: `id` (developer ID)         | `200 OK`: Developer deleted successfully <br> `404 Not Found`: Developer not found <br> `500 Internal Server Error`: Error deleting developer |

---

## Comment Routes

| **Method** | **Route**               | **Description**                               | **Request Body**                                         | **Response**                       |
|------------|-------------------------|-----------------------------------------------|----------------------------------------------------------|------------------------------------|
| `GET`      | `/comments`             | Get all comments                             | No body required                                          | `200 OK`: List of comments <br> `500 Internal Server Error`: Error fetching comments |
| `GET`      | `/comments/:id`         | Get a comment by ID                          | No body required. URL param: `id` (comment ID)           | `200 OK`: Comment data <br> `404 Not Found`: Comment not found <br> `500 Internal Server Error`: Error fetching comment |
| `POST`     | `/comments`             | Create a new comment                         | `{ "gameId": "gameId", "userId": "userId", "content": "Comment Content" }` | `201 Created`: Comment created successfully <br> `422 Unprocessable Entity`: Validation error <br> `500 Internal Server Error`: Error creating comment |
| `PUT`      | `/comments/:id`         | Update a comment by ID                       | `{ "content": "Updated Comment Content" }`               | `200 OK`: Comment updated successfully <br> `404 Not Found`: Comment not found <br> `500 Internal Server Error`: Error updating comment |
| `DELETE`   | `/comments/:id`         | Delete a comment by ID                       | No body required. URL param: `id` (comment ID)           | `200 OK`: Comment deleted successfully <br> `404 Not Found`: Comment not found <br> `500 Internal Server Error`: Error deleting comment |

---

## Additional Routes

| **Method** | **Route**                                    | **Description**                              | **Response**                       |
|------------|----------------------------------------------|----------------------------------------------|------------------------------------|
| `GET`      | `/users/:userId/developers`                  | Get developers associated with a user        | `200 OK`: List of developers <br> `500 Internal Server Error`: Error fetching developers |
| `GET`      | `/developers/:developerId/comments`          | Get comments associated with a developer     | `200 OK`: List of comments <br> `500 Internal Server Error`: Error fetching comments |
| `GET`      | `/developers/:developerId/games`             | Get games associated with a developer        | `200 OK`: List of games <br> `500 Internal Server Error`: Error fetching games |
| `GET`      | `/games/:gameId/comments`                    | Get comments associated with a game          | `200 OK`: List of comments <br> `500 Internal Server Error`: Error fetching comments |
| `GET`      | `/developers/:developerId/games/:gameId/comments/:commentId` | Get a specific comment by its ID            | `200 OK`: Comment data <br> `404 Not Found`: Comment not found <br> `500 Internal Server Error`: Error fetching comment |

---

## Notes

- **Authentication**: Most of the routes require authentication via a Http secure Cookies. Use the `/login` route to obtain the Cookies and a token.
- **Authorization**: The `/users/:id`, `/games/:id`, `/developers/:id`, and `/comments/:id` routes are protected based on user roles (`admin`, `dev`, `guest`).
- **File Upload**: For routes that allow file uploads (e.g., `/users`, `/games`, `/developers`, `/comments`), the `photo` field must be included in the request.

