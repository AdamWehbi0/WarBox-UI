# WarBox - Social Media App for Wayne State University

## Project Overview
WarBox is a social media application exclusively for Wayne State University students. It consists of a Spring Boot backend with PostgreSQL database (Supabase) and a React Native mobile frontend.

## Architecture
- **Backend**: Spring Boot (Java 21) + Supabase PostgreSQL
- **Frontend**: React Native (TypeScript) + Expo
- **Authentication**: JWT tokens
- **Database**: PostgreSQL hosted on Supabase

---

## Backend (Spring Boot)

### Base URL
- Local development: `http://localhost:8080`
- Network access: `http://192.168.1.241:8080`

### Database Entities

#### AppUserEntity
```java
- UUID id (auto-generated)
- String email (unique, required)
- String handle (unique, 3-20 chars, alphanumeric + underscores)
- String displayName (optional)
- String passwordHash (BCrypt hashed)
- Instant createdAt (auto-set)
```

#### PostEntity
```java
- UUID id (auto-generated)
- String content (500 char limit, required)
- AppUserEntity author (foreign key, required)
- Instant createdAt (auto-set)
```

#### LikeEntity
```java
- UUID id (auto-generated)
- AppUserEntity user (foreign key, required)
- PostEntity post (foreign key, required)
- Instant createdAt (auto-set)
- Unique constraint: (user_id, post_id) - prevents duplicate likes
```

#### CommentEntity
```java
- UUID id (auto-generated)
- String content (300 char limit, required)
- AppUserEntity author (foreign key, required)
- PostEntity post (foreign key, required)
- Instant createdAt (auto-set)
```

### API Endpoints

#### Authentication Endpoints
**Base path: `/auth`**

##### POST `/auth/register`
- **Purpose**: Create new user account
- **Request Body**:
```json
{
  "email": "user@wayne.edu",
  "password": "Test123456",
  "handle": "username",
  "displayName": "Display Name"
}
```
- **Response**: `AuthResponse` with JWT token
- **Validations**:
    - Email: Valid format, unique
    - Password: 8+ chars, uppercase, lowercase, number
    - Handle: 3-20 chars, alphanumeric + underscores, unique
    - Display name: Optional

##### POST `/auth/login`
- **Purpose**: Authenticate user
- **Request Body**:
```json
{
  "email": "user@wayne.edu",
  "password": "Test123456"
}
```
- **Response**: `AuthResponse` with JWT token
- **Error**: "Invalid email or password"

##### GET `/auth/test-token`
- **Purpose**: Validate JWT token (development/testing)
- **Headers**: `Authorization: Bearer {token}`
- **Response**: User ID if valid

#### User Management Endpoints
**Base path: `/users`**

##### GET `/users`
- **Purpose**: Get all users (debug only)
- **Response**: Array of `AppUserEntity`

##### GET `/users/{id}`
- **Purpose**: Get user by ID
- **Response**: `AppUserEntity`

##### PATCH `/users/{id}`
- **Purpose**: Update user profile
- **Parameters**: `handle` (optional), `displayName` (optional)
- **Response**: Updated `AppUserEntity`

#### Posts Endpoints
**Base path: `/posts`**

##### POST `/posts`
- **Purpose**: Create new post
- **Headers**: `Authorization: Bearer {token}` (required)
- **Request Body**:
```json
{
  "content": "Post content here"
}
```
- **Response**: `PostResponse`
- **Validations**: Content required, 500 char max

##### GET `/posts`
- **Purpose**: Get all posts (main feed)
- **Response**: Array of `PostResponse` (newest first)
- **No authentication required**

##### GET `/posts/user/{handle}`
- **Purpose**: Get posts by specific user
- **Response**: Array of `PostResponse` for that user

#### Likes Endpoints

##### POST `/posts/{postId}/like`
- **Purpose**: Like a post
- **Headers**: `Authorization: Bearer {token}` (required)
- **Response**: Success message with like count
- **Error**: "Post already liked" if duplicate

##### DELETE `/posts/{postId}/like`
- **Purpose**: Unlike a post
- **Headers**: `Authorization: Bearer {token}` (required)
- **Response**: Success message with like count
- **Error**: "Post not liked yet" if not previously liked

#### Comments Endpoints

##### POST `/posts/{postId}/comments`
- **Purpose**: Create comment on post
- **Headers**: `Authorization: Bearer {token}` (required)
- **Request Body**:
```json
{
  "content": "Comment content here"
}
```
- **Response**: `CommentResponse`
- **Validations**: Content required, 300 char max

##### GET `/posts/{postId}/comments`
- **Purpose**: Get all comments for a post
- **Response**: Array of `CommentResponse` (oldest first)
- **No authentication required**

### Response DTOs

#### AuthResponse
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "email": "user@wayne.edu",
  "handle": "username",
  "displayName": "Display Name"
}
```

#### PostResponse
```json
{
  "id": "uuid-here",
  "content": "Post content",
  "authorHandle": "username",
  "authorDisplayName": "Display Name",
  "createdAt": "2025-08-31T00:31:23.491700Z",
  "likeCount": 0,
  "likedByCurrentUser": false
}
```

#### CommentResponse
```json
{
  "id": "uuid-here",
  "content": "Comment content",
  "authorHandle": "username",
  "authorDisplayName": "Display Name",
  "postId": "post-uuid-here",
  "createdAt": "2025-08-31T00:31:23.491700Z"
}
```

### JWT Token Details
- **Algorithm**: HS512
- **Expiration**: 24 hours
- **Contains**: User ID (subject), email, handle
- **Header format**: `Authorization: Bearer {token}`

---

## Frontend (React Native)

### Project Structure
```
WarBox-UI/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx ✅
│   │   ├── RegisterScreen.tsx ✅
│   │   └── FeedScreen.tsx ✅
│   ├── components/ (empty - future components)
│   ├── services/
│   │   └── api.ts ✅
│   └── types/ (empty - future type definitions)
├── App.tsx ✅
├── navigation.tsx ✅
└── package.json
```

### Current Functionality

#### Completed Features ✅
1. **Authentication Flow**
    - Login screen with email/password
    - Register screen with validation
    - JWT token handling
    - Navigation between auth screens

2. **API Integration**
    - Axios setup with base URL
    - Login API call with error handling
    - Register API call with success flow
    - Token storage in console (temporary)

3. **Feed Screen**
    - Display all posts
    - Pull-to-refresh functionality
    - Post cards with user info and timestamps
    - Like/comment buttons (UI only)

#### In Progress / TODO
1. **Create Post Screen** - Next priority
2. **Token Storage** - Secure storage with AsyncStorage
3. **Auto-login** - Check stored token on app start
4. **Like Functionality** - Connect like buttons to API
5. **Comment Functionality** - Comment screen and API calls
6. **User Profile Screen** - View user's own posts
7. **Navigation Improvements** - Bottom tabs, proper logout

### Current Navigation Flow
1. **App starts** → LoginScreen
2. **Login success** → FeedScreen
3. **Register success** → LoginScreen
4. **Feed screen** has back button labeled "Logout"

### API Service Setup
Located in `src/services/api.ts`:
- Base URL: `http://192.168.1.241:8080`
- Axios instance with JSON headers
- Login and register functions implemented
- TypeScript interfaces for requests/responses

### Dependencies Installed
```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/stack": "^6.x", 
  "react-native-screens": "latest",
  "react-native-safe-area-context": "latest",
  "react-native-gesture-handler": "latest",
  "axios": "latest"
}
```

---

## Development Setup

### Backend Requirements
- Java 21
- Spring Boot 3.x
- Supabase PostgreSQL database
- Run with: `./mvnw spring-boot:run`
- Access at: `http://localhost:8080`

### Frontend Requirements
- Node.js
- Expo CLI
- React Native development environment
- Run with: `npx expo start`
- Test on: Physical device with Expo Go app

### Network Configuration
- Backend accessible at: `192.168.1.241:8080` (local network)
- Frontend connects via IP address (not localhost)
- Both devices must be on same WiFi network

---

## Testing Accounts

### Existing Test Users
1. **Email**: `test@wayne.edu` / **Password**: `Test123456` / **Handle**: `testuser`
2. **Email**: `jane@wayne.edu` / **Password**: `Test123456` / **Handle**: `janedoe`

### Sample Posts
- Test posts exist in database from backend testing
- Posts visible in mobile feed
- Created by testuser account

---

## Next Development Priorities

### Immediate (Current Sprint)
1. **Create Post Screen**
    - Text input with character counter
    - Submit button with API call
    - Navigation from feed screen
    - Success feedback and refresh feed

2. **Token Storage & Auto-login**
    - Install AsyncStorage
    - Store JWT token securely
    - Check token on app start
    - Auto-navigate to feed if valid token

### Short Term
3. **Functional Like System**
    - Connect like buttons to API
    - Real-time like count updates
    - Proper error handling

4. **Comment System**
    - Comment screen/modal
    - Display comments for posts
    - Create new comments

### Medium Term
5. **User Profile Screen**
    - View own posts
    - Edit profile functionality
    - User statistics

6. **Navigation Improvements**
    - Bottom tab navigation
    - Proper logout functionality
    - Better user experience

### Future Features
7. **Real-time Updates**
    - WebSocket integration
    - Push notifications
    - Live feed updates

8. **Enhanced UI/UX**
    - Better styling and animations
    - Dark mode support
    - Image upload capabilities