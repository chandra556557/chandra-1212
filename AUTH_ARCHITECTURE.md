# 🏗️ Unified Authentication Architecture

**Visual guide to the authentication system**

---

## 🎯 System Overview

```mermaid
graph TB
    subgraph Users["👥 Users"]
        WebUser[Web User]
        ExtUser[Extension User]
    end

    subgraph Frontend["🖥️ Frontend App (React)"]
        LoginPage[Login Page]
        Dashboard[Dashboard]
        FrontendStorage[localStorage]
    end

    subgraph Extension["🧩 Chrome Extension"]
        ExtensionUI[Extension UI]
        TestExecutor[Test Executor]
        ExtensionStorage[chrome.storage]
    end

    subgraph Backend["⚙️ Backend (Node.js/Express)"]
        AuthAPI[Auth API]
        JWT[JWT Service]
        Routes[Protected Routes]
    end

    subgraph Database["💾 Database (PostgreSQL)"]
        UserTable[User Table]
        TokenTable[RefreshToken Table]
    end

    WebUser --> LoginPage
    ExtUser --> ExtensionUI

    LoginPage -->|POST /auth/login| AuthAPI
    ExtensionUI -->|POST /auth/login| AuthAPI

    AuthAPI --> JWT
    JWT --> UserTable
    JWT --> TokenTable

    AuthAPI -->|Access Token| FrontendStorage
    AuthAPI -->|Access Token| ExtensionStorage

    FrontendStorage --> Dashboard
    ExtensionStorage --> TestExecutor

    Dashboard -->|Bearer Token| Routes
    TestExecutor -->|Bearer Token| Routes

    Routes --> UserTable
```

---

## 🔐 Authentication Flow

### Login Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend/Extension
    participant A as Auth API
    participant D as Database
    participant S as Storage

    U->>F: Enter credentials
    F->>A: POST /auth/login {email, password}
    A->>D: Find user by email
    D-->>A: User record
    A->>A: Verify password (bcrypt)

    alt Valid credentials
        A->>A: Generate JWT tokens
        A->>D: Store refresh token
        A-->>F: {user, accessToken, refreshToken}
        F->>S: Save tokens
        F-->>U: Login success
    else Invalid credentials
        A-->>F: 401 Unauthorized
        F-->>U: Login failed
    end
```

---

## 🎫 Token Management

### Token Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Login: User provides credentials

    Login --> TokenGeneration: Valid credentials
    TokenGeneration --> AccessToken: Generate (15 min)
    TokenGeneration --> RefreshToken: Generate (7 days)

    AccessToken --> ActiveSession: Store in Frontend/Extension
    RefreshToken --> Database: Store in DB

    ActiveSession --> APIRequest: Use for API calls

    APIRequest --> TokenValid: Check expiry
    TokenValid --> Success: Token valid
    TokenValid --> TokenExpired: Token expired

    TokenExpired --> RefreshFlow: Call /auth/refresh
    RefreshFlow --> NewTokens: Issue new tokens
    NewTokens --> ActiveSession

    RefreshFlow --> RefreshExpired: Refresh token invalid
    RefreshExpired --> Logout: Force logout

    Success --> [*]
    Logout --> [*]
```

---

## 🔄 Data Synchronization

### User Data Flow

```mermaid
graph LR
    subgraph Frontend["Frontend App"]
        F1[Login]
        F2[View Scripts]
        F3[View Test Runs]
    end

    subgraph Extension["Extension"]
        E1[Login]
        E2[Record Test]
        E3[Run Test]
    end

    subgraph Backend["Shared Backend"]
        B1[Auth Service]
        B2[Script Service]
        B3[Test Run Service]
    end

    subgraph Database["Shared Database"]
        D1[(User Table)]
        D2[(Script Table)]
        D3[(TestRun Table)]
    end

    F1 --> B1
    E1 --> B1
    B1 --> D1

    F2 --> B2
    E2 --> B2
    B2 --> D2

    F3 --> B3
    E3 --> B3
    B3 --> D3

    D2 -.->|Same Data| F2
    D2 -.->|Same Data| E2

    D3 -.->|Same Data| F3
    D3 -.->|Same Data| E3
```

---

## 🗄️ Database Schema

### User & Authentication Tables

```
┌─────────────────────────────────────────┐
│              User Table                 │
├─────────────────────────────────────────┤
│ id          String (UUID)      PK       │
│ email       String             UNIQUE   │
│ password    String (hashed)             │
│ name        String                      │
│ createdAt   DateTime                    │
│ updatedAt   DateTime                    │
│                                         │
│ Relations:                              │
│ - scripts[]      (one-to-many)          │
│ - testRuns[]     (one-to-many)          │
│ - refreshTokens[] (one-to-many)         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         RefreshToken Table              │
├─────────────────────────────────────────┤
│ id          String (UUID)      PK       │
│ token       String             UNIQUE   │
│ userId      String             FK       │
│ expiresAt   DateTime                    │
│ createdAt   DateTime                    │
│                                         │
│ Relations:                              │
│ - user (many-to-one)                    │
└─────────────────────────────────────────┘
```

---

## 🌐 API Endpoints

### Authentication Routes

```
┌────────────────────────────────────────────────────┐
│              Auth API Endpoints                    │
├────────────────────────────────────────────────────┤
│                                                    │
│ POST /api/auth/register                            │
│   Body: {email, password, name}                    │
│   Returns: {user, tokens}                          │
│   Status: 201 Created                              │
│                                                    │
│ POST /api/auth/login                               │
│   Body: {email, password}                          │
│   Returns: {user, tokens}                          │
│   Status: 200 OK                                   │
│                                                    │
│ POST /api/auth/refresh                             │
│   Body: {refreshToken}                             │
│   Returns: {tokens}                                │
│   Status: 200 OK                                   │
│                                                    │
│ POST /api/auth/logout                              │
│   Body: {refreshToken}                             │
│   Returns: {message}                               │
│   Status: 200 OK                                   │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 🔒 Security Layers

### Security Stack

```mermaid
graph TB
    subgraph Transport["1. Transport Security"]
        HTTPS[HTTPS/TLS]
        CORS[CORS Policy]
    end

    subgraph Auth["2. Authentication"]
        JWT[JWT Tokens]
        Bcrypt[Password Hashing]
    end

    subgraph Authorization["3. Authorization"]
        Middleware[Auth Middleware]
        Guards[Route Guards]
    end

    subgraph Storage["4. Storage Security"]
        LocalStorage[localStorage]
        ChromeStorage[chrome.storage]
        DBEncryption[DB Encryption]
    end

    subgraph RateLimit["5. Rate Limiting"]
        RequestLimit[Request Throttling]
        IPBlock[IP Blocking]
    end

    HTTPS --> JWT
    CORS --> JWT

    JWT --> Middleware
    Bcrypt --> Middleware

    Middleware --> Guards

    Guards --> LocalStorage
    Guards --> ChromeStorage
    Guards --> DBEncryption

    DBEncryption --> RequestLimit
    LocalStorage --> RequestLimit
    ChromeStorage --> RequestLimit

    RequestLimit --> IPBlock
```

---

## 📱 Client-Side Storage

### Storage Comparison

```
┌──────────────────────────────────────────────────────┐
│                  Frontend App                        │
├──────────────────────────────────────────────────────┤
│ Technology:   localStorage                           │
│ Scope:        Per domain/origin                      │
│ Persistence:  Until manually cleared                 │
│ Size Limit:   ~5-10 MB                               │
│ Access:       JavaScript only                        │
│                                                      │
│ Stored Data:                                         │
│   - accessToken: "eyJhbGciOiJIUzI1..."               │
│                                                      │
│ Security:                                            │
│   - XSS vulnerable                                   │
│   - Same-origin policy                               │
│   - HTTPS recommended                                │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│               Chrome Extension                       │
├──────────────────────────────────────────────────────┤
│ Technology:   chrome.storage.local                   │
│ Scope:        Per extension                          │
│ Persistence:  Until extension uninstall/clear        │
│ Size Limit:   ~5 MB (unlimited with permission)      │
│ Access:       Extension context only                 │
│                                                      │
│ Stored Data:                                         │
│   - auth_tokens: {                                   │
│       accessToken: "eyJhbGciOiJIUzI1...",            │
│       refreshToken: "eyJhbGciOiJIUzI1..."            │
│     }                                                │
│                                                      │
│ Security:                                            │
│   - Isolated from web pages                          │
│   - Extension permission required                    │
│   - More secure than localStorage                    │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 Session Management

### Session States

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated: App Load

    Unauthenticated --> Authenticating: Login attempt

    Authenticating --> Authenticated: Success
    Authenticating --> Unauthenticated: Failure

    Authenticated --> Active: Token valid
    Active --> Authenticated: API call success

    Active --> TokenExpiring: Token near expiry
    TokenExpiring --> Refreshing: Auto-refresh

    Refreshing --> Authenticated: Refresh success
    Refreshing --> Unauthenticated: Refresh failed

    Authenticated --> LoggingOut: User logout
    Active --> LoggingOut: User logout

    LoggingOut --> Unauthenticated: Clear tokens

    Unauthenticated --> [*]
```

---

## 🌍 Network Architecture

### Request Flow

```
┌─────────────┐                    ┌─────────────┐
│   Frontend  │                    │  Extension  │
│  (Port 5174)│                    │  (Chrome)   │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ HTTP/HTTPS                       │ HTTP/HTTPS
       │                                  │
       └──────────────┬───────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  Backend API  │
              │  (Port 3000)  │
              └───────┬───────┘
                      │
                      │ TCP/IP
                      │
                      ▼
              ┌───────────────┐
              │  PostgreSQL   │
              │  (Port 5433)  │
              └───────────────┘
```

---

## 🎛️ Configuration Map

### Environment Variables

```
┌─────────────────────────────────────────────────────┐
│               Backend .env                          │
├─────────────────────────────────────────────────────┤
│ DATABASE_URL=postgresql://...                       │
│ JWT_ACCESS_SECRET=...                               │
│ JWT_REFRESH_SECRET=...                              │
│ PORT=3000                                           │
│ ALLOWED_ORIGINS=                                    │
│   chrome-extension://*,                             │
│   http://localhost:5174,                            │
│   http://localhost:3000                             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│          Frontend Configuration                     │
├─────────────────────────────────────────────────────┤
│ API_URL=http://localhost:3000/api                   │
│ (in App.tsx)                                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│         Extension Configuration                     │
├─────────────────────────────────────────────────────┤
│ API_BASE_URL=http://localhost:3000/api              │
│ (in apiService.ts)                                  │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Summary

**Key Architectural Points:**

✅ **Single Backend** - One API serves both frontend and extension
✅ **Shared Database** - All users stored in one PostgreSQL database
✅ **JWT Tokens** - Industry-standard authentication
✅ **Bcrypt Hashing** - Secure password storage
✅ **Token Refresh** - Automatic session renewal
✅ **CORS Enabled** - Cross-origin resource sharing
✅ **Isolated Storage** - Frontend/Extension store tokens separately
✅ **Unified Experience** - Same credentials work everywhere

---

**Architecture Version**: 1.0.0
**Last Updated**: 2025-10-23
**Status**: Production Ready ✅
