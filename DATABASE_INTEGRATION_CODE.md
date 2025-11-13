# Database Integration Code for Playwright CRX Testing Framework

This document provides a comprehensive overview of the database integration code for the Playwright CRX testing framework, including connection setup, models, services, and usage patterns.

## Table of Contents

1. [Database Connection Setup](#database-connection-setup)
2. [Database Schema & Models](#database-schema--models)
3. [Database Services](#database-services)
4. [Database Controllers](#database-controllers)
5. [Example Usage Patterns](#example-usage-patterns)
6. [Migration Scripts](#migration-scripts)

## Database Connection Setup

### 1. Database Configuration (db.ts)

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DB_USER = process.env.DB_USER || 'playwright_user';
const DB_PASSWORD = process.env.DB_PASSWORD || 'playwright123';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_NAME = process.env.DB_NAME || 'playwright_crx';

const rawEnvUrl = process.env.DATABASE_URL;
const envUrl = typeof rawEnvUrl === 'string' ? rawEnvUrl.trim() : '';

// Validate DATABASE_URL format before using
const isValidUrl = envUrl.length > 0 &&
  (envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://'));

const connectionString = isValidUrl
  ? envUrl
  : `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
const ssl =
  process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : undefined;

const pool = new Pool({
  connectionString,
  ssl,
});

export default pool;
```

### 2. Environment Configuration (.env.example)

```bash
# ============================================
# DATABASE CONFIGURATION
# ============================================

# PostgreSQL Host (usually 'localhost' for local development)
DB_HOST=localhost

# PostgreSQL Port (default is 5432)
DB_PORT=5432

# Database Name (the database you created for this project)
DB_NAME=playwright_crx

# PostgreSQL Username (default superuser is 'postgres')
DB_USER=postgres

# PostgreSQL Password (set during PostgreSQL installation)
DB_PASSWORD=your_postgres_password_here

# Database Schema (usually 'public')
DB_SCHEMA=public

# Full Database Connection URL
# This is auto-generated from the above parameters
# You can also set this manually if you prefer:
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}"

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_ACCESS_SECRET="your-super-secret-access-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS - Chrome Extension ID (update after extension installation)
ALLOWED_ORIGINS="chrome-extension://your-extension-id-here,http://localhost:3000"

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR="./uploads"

# WebSocket
WS_PORT=3001

# Logging
LOG_LEVEL=debug  # debug, info, warn, error

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Session
SESSION_TIMEOUT_MINUTES=15  # Access token expiry
REFRESH_TOKEN_DAYS=7        # Refresh token expiry
```

## Database Schema & Models

### Prisma Schema (schema.prisma)

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MANAGEMENT
// ============================================

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  password      String
  name          String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  // Relations
  projects           Project[]
  scripts            Script[]
  refreshTokens      RefreshToken[]
  testRuns           TestRun[]
  testDataFiles      TestDataFile[]
  extensionScripts   ExtensionScript[]
  locatorStrategies  LocatorStrategy[]
  
  @@index([email])
}

model RefreshToken {
  id         String    @id @default(cuid())
  token      String    @unique
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt  DateTime
  revokedAt  DateTime?
  createdAt  DateTime  @default(now())
  
  @@index([userId])
  @@index([token])
}

// ============================================
// PROJECT & SCRIPT MANAGEMENT
// ============================================

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  scripts     Script[]
  
  @@index([userId])
  @@index([createdAt])
}

model Script {
  id              String   @id @default(cuid())
  name            String
  description     String?  @db.Text
  language        String   @default("typescript") // 'typescript', 'javascript', 'python', 'java', 'csharp', 'robot'
  code            String   @db.Text
  projectId       String?
  project         Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Playwright-specific metadata
  browserType     String   @default("chromium") // 'chromium', 'firefox', 'webkit'
  viewport        Json?    // { width: 1280, height: 720 }
  testIdAttribute String   @default("data-testid")
  
  // Self-healing configuration
  selfHealingEnabled Boolean @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  testRuns           TestRun[]
  selfHealingLocators SelfHealingLocator[]
  testDataFiles      TestDataFile[]
  variables          Variable[]
  breakpoints        Breakpoint[]
  
  @@index([userId])
  @@index([projectId])
  @@index([createdAt])
}

// ============================================
// TEST EXECUTION
// ============================================

model TestRun {
  id          String   @id @default(cuid())
  scriptId    String
  script      Script   @relation(fields: [scriptId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  status      String   // 'running', 'passed', 'failed', 'timeout', 'cancelled'
  duration    Int?     // milliseconds
  errorMsg    String?  @db.Text
  
  // Artifacts
  traceUrl       String?
  screenshotUrls Json?  // array of URLs
  videoUrl       String?
  allureReportUrl String? // Allure report URL
  
  // Metadata
  environment    String?  // 'development', 'staging', 'production'
  browser        String   @default("chromium")
  viewport       Json?
  
  startedAt   DateTime @default(now())
  completedAt DateTime?
  
  // Relations
  steps       TestStep[]
  
  @@index([scriptId])
  @@index([userId])
  @@index([status])
  @@index([startedAt])
}

model TestStep {
  id          String   @id @default(cuid())
  testRunId   String
  testRun     TestRun  @relation(fields: [testRunId], references: [id], onDelete: Cascade)
  
  stepNumber  Int
  action      String   // 'goto', 'click', 'fill', 'press', etc.
  selector    String?  @db.Text
  value       String?  @db.Text
  status      String   // 'running', 'passed', 'failed', 'skipped'
  duration    Int?     // milliseconds
  errorMsg    String?  @db.Text
  
  // Self-healing metadata
  originalLocator String? @db.Text
  healedLocator   String? @db.Text
  wasHealed       Boolean @default(false)
  
  timestamp   DateTime @default(now())
  
  @@index([testRunId])
  @@index([stepNumber])
}

// ============================================
// SELF-HEALING MECHANISM
// ============================================

model SelfHealingLocator {
  id              String   @id @default(cuid())
  scriptId        String
  script          Script   @relation(fields: [scriptId], references: [id], onDelete: Cascade)
  
  // Original locator that failed
  brokenLocator   String   @db.Text
  brokenType      String   // 'id', 'css', 'xpath', 'testid', 'name'
  
  // Working alternative locator
  validLocator    String   @db.Text
  validType       String   // 'id', 'css', 'xpath', 'testid', 'name'
  
  // Metadata
  elementTag      String?  // 'button', 'input', etc.
  elementText     String?  @db.Text
  confidence      Float    @default(1.0) // 0.0 to 1.0
  
  // Approval workflow
  status          String   @default("pending") // 'pending', 'approved', 'rejected'
  approvedAt      DateTime?
  
  // Usage tracking
  timesUsed       Int      @default(0)
  lastUsedAt      DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([scriptId])
  @@index([status])
  @@index([brokenLocator])
  @@unique([scriptId, brokenLocator, validLocator])
}

model LocatorStrategy {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Priority order (lower number = higher priority)
  priority    Int
  strategy    String   // 'id', 'css', 'xpath', 'testid', 'name'
  enabled     Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([userId, strategy])
  @@index([userId, priority])
}

// ============================================
// DATA-DRIVEN TESTING (DDT)
// ============================================

model TestDataFile {
  id          String   @id @default(cuid())
  name        String
  fileName    String   // Original filename
  fileType    String   // 'csv', 'json'
  fileSize    Int      // bytes
  fileUrl     String?  // S3/storage URL
  
  scriptId    String?
  script      Script?  @relation(fields: [scriptId], references: [id], onDelete: SetNull)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Parsed data metadata
  rowCount    Int      @default(0)
  columnNames Json?    // array of column names
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  rows        TestDataRow[]
  
  @@index([scriptId])
  @@index([userId])
}

model TestDataRow {
  id          String       @id @default(cuid())
  fileId      String
  file        TestDataFile @relation(fields: [fileId], references: [id], onDelete: Cascade)
  
  rowNumber   Int
  data        Json         // Key-value pairs from CSV/JSON
  
  createdAt   DateTime     @default(now())
  
  @@index([fileId])
  @@index([rowNumber])
  @@unique([fileId, rowNumber])
}

// ============================================
// EXTENSION SCRIPTS (CUSTOM COMMANDS)
// ============================================

model ExtensionScript {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text
  code        String   @db.Text
  scriptType  String   // 'locator', 'action', 'assertion'
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  enabled     Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([scriptType])
}

// ============================================
// DEBUGGING FEATURES
// ============================================

model Variable {
  id          String   @id @default(cuid())
  scriptId    String
  script      Script   @relation(fields: [scriptId], references: [id], onDelete: Cascade)
  
  name        String
  value       String   @db.Text
  type        String   // 'string', 'number', 'boolean', 'object'
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([scriptId])
  @@unique([scriptId, name])
}

model Breakpoint {
  id          String   @id @default(cuid())
  scriptId    String
  script      Script   @relation(fields: [scriptId], references: [id], onDelete: Cascade)
  
  lineNumber  Int
  enabled     Boolean  @default(true)
  condition   String?  @db.Text // Optional conditional breakpoint
  
  createdAt   DateTime @default(now())
  
  @@index([scriptId])
  @@unique([scriptId, lineNumber])
}
```

## Database Services

### 1. Authentication Service (auth.service.ts)

```typescript
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { logger } from '../../utils/logger';
import { randomUUID } from 'crypto';
import pool from '../../db';

interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export class AuthService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
    this.accessTokenExpiry = '10h';
    this.refreshTokenExpiry = '15h';
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string) {
    const existing = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
    if (existing.rowCount && existing.rows[0]) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    const insertUser = await pool.query(
      'INSERT INTO "User"(id,email,password,name,createdAt,updatedAt) VALUES ($1,$2,$3,$4,now(),now()) RETURNING id,email,name',
      [userId, email, hashedPassword, name]
    );
    const user = insertUser.rows[0];

    logger.info(`New user registered: ${email}`);

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      accessToken,
      refreshToken,
      expiresIn: 36000
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string) {
    const userRes = await pool.query(
      'SELECT id,email,password,name FROM "User" WHERE email = $1',
      [email]
    );
    const user = userRes.rows[0];
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    logger.info(`User logged in: ${email}`);

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      accessToken,
      refreshToken,
      expiresIn: 36000
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as TokenPayload;
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const tokenRes = await pool.query(
        `SELECT id FROM "RefreshToken"
         WHERE token = $1 AND userId = $2 AND expiresAt > now() AND revokedAt IS NULL`,
        [refreshToken, decoded.userId]
      );
      if (!tokenRes.rowCount) {
        throw new Error('Invalid or expired refresh token');
      }

      const userRes = await pool.query(
        'SELECT id,email FROM "User" WHERE id = $1',
        [decoded.userId]
      );
      const user = userRes.rows[0];
      if (!user) {
        throw new Error('User not found');
      }

      const accessToken = this.generateAccessToken(user.id, user.email);
      return {
        accessToken,
        expiresIn: 36000
      };
    } catch (error) {
      logger.error('Refresh token error:', error as any);
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logout(refreshToken: string) {
    try {
      await pool.query(
        'UPDATE "RefreshToken" SET revokedAt = now() WHERE token = $1',
        [refreshToken]
      );
      logger.info('User logged out');
      return true;
    } catch (error) {
      logger.error('Logout error:', error as any);
      return false;
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(userId: string, email: string) {
    const accessToken = this.generateAccessToken(userId, email);
    const refreshToken = this.generateRefreshToken(userId);

    await pool.query(
      'INSERT INTO "RefreshToken"(id,token,userId,expiresAt,createdAt) VALUES ($1,$2,$3,$4,now())',
      [randomUUID(), refreshToken, userId, new Date(Date.now() + 15 * 60 * 60 * 1000)]
    );

    return { accessToken, refreshToken };
  }

  /**
   * Generate access token
   */
  private generateAccessToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, type: 'access' },
      this.accessTokenSecret,
      { expiresIn: this.accessTokenExpiry } as jwt.SignOptions
    );
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry, jwtid: randomUUID() } as jwt.SignOptions
    );
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as TokenPayload;
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (_error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Clean up expired refresh tokens
   */
  async cleanupExpiredTokens() {
    const result = await pool.query(
      'DELETE FROM "RefreshToken" WHERE expiresAt < now()'
    );
    logger.info(`Cleaned up ${result.rowCount} expired tokens`);
    return result.rowCount;
  }
}

export const authService = new AuthService();
```

### 2. Self-Healing Service (selfHealing.service.ts)

```typescript
import { logger } from '../../utils/logger';
import pool from '../../db';

export interface LocatorInfo {
  locator: string;
  type: 'id' | 'css' | 'xpath' | 'testid' | 'name';
  elementTag?: string;
  elementText?: string;
}

export class SelfHealingService {
  async recordFailure(
    scriptId: string,
    brokenLocator: LocatorInfo,
    validLocator?: LocatorInfo
  ) {
    try {
      if (validLocator) {
        const { rows: existingRows } = await pool.query(
          `SELECT id, "timesUsed" FROM "SelfHealingLocator"
           WHERE "scriptId" = $1 AND "brokenLocator" = $2 AND "validLocator" = $3`,
          [scriptId, brokenLocator.locator, validLocator.locator]
        );
        const existing = existingRows[0];

        if (existing) {
          await pool.query(
            `UPDATE "SelfHealingLocator"
             SET "timesUsed" = $2, "lastUsedAt" = now()
             WHERE id = $1`,
            [existing.id, (existing.timesUsed || 0) + 1]
          );
          return existing;
        }

        const { rows } = await pool.query(
          `INSERT INTO "SelfHealingLocator"
           (id, "scriptId", "brokenLocator", "brokenType", "validLocator", "validType",
            "elementTag", "elementText", status, "createdAt", "updatedAt")
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, 'pending', now(), now())
           RETURNING *`,
          [scriptId, brokenLocator.locator, brokenLocator.type, validLocator.locator, validLocator.type, validLocator.elementTag ?? null, validLocator.elementText ?? null]
        );
        logger.info(`Self-healing locator recorded for script ${scriptId}`);
        return rows[0];
      }
      return null;
    } catch (error) {
      logger.error('Error recording locator failure:', error);
      throw error;
    }
  }

  async recordSuccess(scriptId: string, locator: string, _type: string) {
    try {
      await pool.query(
        `UPDATE "SelfHealingLocator"
         SET "timesUsed" = COALESCE("timesUsed",0) + 1,
             "lastUsedAt" = now(),
             confidence = LEAST(COALESCE(confidence,0) + 0.1, 1.0)
         WHERE "scriptId" = $1 AND "validLocator" = $2 AND status = 'approved'`,
        [scriptId, locator]
      );
    } catch (error) {
      logger.error('Error recording success:', error);
    }
  }

  async getSuggestions(scriptId: string, status?: string) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM "SelfHealingLocator"
         WHERE "scriptId" = $1 ${status ? 'AND status = $2' : ''}
         ORDER BY confidence DESC, "createdAt" DESC`,
        status ? [scriptId, status] : [scriptId]
      );
      return rows;
    } catch (error) {
      logger.error('Error getting suggestions:', error);
      throw error;
    }
  }

  async approveSuggestion(id: string, userId: string) {
    try {
      const { rows } = await pool.query(
        `SELECT shl.id, s."userId" AS script_user
         FROM "SelfHealingLocator" shl
         JOIN "Script" s ON s.id = shl."scriptId"
         WHERE shl.id = $1`,
        [id]
      );
      const suggestion = rows[0];
      if (!suggestion) throw new Error('Suggestion not found');
      if (suggestion.script_user !== userId) throw new Error('Unauthorized');

      const { rows: updatedRows } = await pool.query(
        `UPDATE "SelfHealingLocator" SET status = 'approved', "approvedAt" = now() WHERE id = $1 RETURNING *`,
        [id]
      );
      logger.info(`Self-healing suggestion ${id} approved`);
      return updatedRows[0];
    } catch (error) {
      logger.error('Error approving suggestion:', error);
      throw error;
    }
  }

  async rejectSuggestion(id: string, userId: string) {
    try {
      const { rows } = await pool.query(
        `SELECT s."userId" AS script_user
         FROM "SelfHealingLocator" shl JOIN "Script" s ON s.id = shl."scriptId"
         WHERE shl.id = $1`,
        [id]
      );
      const suggestion = rows[0];
      if (!suggestion) throw new Error('Suggestion not found');
      if (suggestion.script_user !== userId) throw new Error('Unauthorized');

      const { rows: updatedRows } = await pool.query(
        `UPDATE "SelfHealingLocator" SET status = 'rejected' WHERE id = $1 RETURNING *`,
        [id]
      );
      logger.info(`Self-healing suggestion ${id} rejected`);
      return updatedRows[0];
    } catch (error) {
      logger.error('Error rejecting suggestion:', error);
      throw error;
    }
  }

  async getLocatorStrategies(userId: string) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM "LocatorStrategy" WHERE "userId" = $1 AND enabled = true ORDER BY priority ASC`,
        [userId]
      );

      if (rows.length === 0) {
        return await this.createDefaultStrategies(userId);
      }
      return rows;
    } catch (error) {
      logger.error('Error getting locator strategies:', error);
      throw error;
    }
  }

  async updateStrategyPriority(
    userId: string,
    strategies: Array<{ strategy: string; priority: number; enabled: boolean }>
  ) {
    try {
      await pool.query(`DELETE FROM "LocatorStrategy" WHERE "userId" = $1`, [userId]);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const s of strategies) {
          await client.query(
            `INSERT INTO "LocatorStrategy" (id, "userId", strategy, priority, enabled, "createdAt", "updatedAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, now(), now())`,
            [userId, s.strategy, s.priority, s.enabled]
          );
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }

      logger.info(`Locator strategies updated for user ${userId}`);
      const { rows } = await pool.query(
        `SELECT * FROM "LocatorStrategy" WHERE "userId" = $1 ORDER BY priority ASC`,
        [userId]
      );
      return rows;
    } catch (error) {
      logger.error('Error updating strategy priority:', error);
      throw error;
    }
  }

  private async createDefaultStrategies(userId: string) {
    const defaults = [
      { strategy: 'id', priority: 1, enabled: true },
      { strategy: 'testid', priority: 2, enabled: true },
      { strategy: 'css', priority: 3, enabled: true },
      { strategy: 'xpath', priority: 4, enabled: true },
      { strategy: 'name', priority: 5, enabled: true }
    ];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const s of defaults) {
        await client.query(
          `INSERT INTO "LocatorStrategy" (id, "userId", strategy, priority, enabled, "createdAt", "updatedAt")
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, now(), now())`,
          [userId, s.strategy, s.priority, s.enabled]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const { rows } = await pool.query(
      `SELECT * FROM "LocatorStrategy" WHERE "userId" = $1 ORDER BY priority ASC`,
      [userId]
    );
    return rows;
  }

  findAlternativeLocator(
    element: { tag: string; id?: string; className?: string; attributes: Record<string, string> },
    strategies: string[]
  ): LocatorInfo | null {
    for (const strategy of strategies) {
      switch (strategy) {
        case 'id':
          if (element.id) return { locator: `#${element.id}`, type: 'id' };
          break;
        case 'testid':
          const testId = element.attributes['data-testid'] || element.attributes['data-test'];
          if (testId) return { locator: `[data-testid="${testId}"]`, type: 'testid' };
          break;
        case 'css':
          if (element.className) return { locator: `.${element.className.split(' ')[0]}`, type: 'css' };
          break;
        case 'name':
          if (element.attributes.name) return { locator: `[name="${element.attributes.name}"]`, type: 'name' };
          break;
        case 'xpath':
          return { locator: `//${element.tag}`, type: 'xpath' };
      }
    }
    return null;
  }
}

export const selfHealingService = new SelfHealingService();
```

## Database Controllers

### 1. Script Controller (script.controller.ts)

```typescript
import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import pool from '../db';
import { randomUUID } from 'crypto';

/**
 * Get all scripts for a user
 */
export const getScripts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.description, s.language, s."browserType" as "browserType",
              s."createdAt" as "createdAt", s."updatedAt" as "updatedAt", s."projectId" as "projectId",
              p.name AS "projectName"
       FROM "Script" s
       LEFT JOIN "Project" p ON p.id = s."projectId"
       WHERE s."userId" = $1
       ORDER BY s."createdAt" DESC`,
      [userId]
    );

    const scripts = rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      language: r.language,
      browserType: r.browserType,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      projectId: r.projectId,
      project: r.projectName ? { name: r.projectName } : null
    }));

    res.status(200).json({
      success: true,
      data: scripts
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get scripts'
    });
  }
};

/**
 * Get a specific script
 */
export const getScript = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.description, s.language, s.code, s."browserType" as "browserType",
              s.viewport, s."testIdAttribute" as "testIdAttribute", s."selfHealingEnabled" as "selfHealingEnabled",
              s."createdAt" as "createdAt", s."updatedAt" as "updatedAt", s."projectId" as "projectId",
              p.name AS "projectName"
       FROM "Script" s
       LEFT JOIN "Project" p ON p.id = s."projectId"
       WHERE s.id = $1 AND s."userId" = $2`,
      [id, userId]
    );

    const script = rows[0];
    if (!script) {
      throw new AppError('Script not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: script.id,
        name: script.name,
        description: script.description,
        language: script.language,
        code: script.code,
        browserType: script.browserType,
        viewport: script.viewport,
        testIdAttribute: script.testIdAttribute,
        selfHealingEnabled: script.selfHealingEnabled,
        createdAt: script.createdAt,
        updatedAt: script.updatedAt,
        projectId: script.projectId,
        project: script.projectName ? { name: script.projectName } : null
      }
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get script'
      });
    }
  }
};

/**
 * Create a new script
 */
export const createScript = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, description, language, code, projectId } = req.body;

    // Validate required fields
    if (!name || !code) {
      throw new AppError('Name and code are required', 400);
    }

    const id = randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO "Script" (id, name, description, language, code, "userId", "projectId",
                              "browserType", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, COALESCE($4, 'typescript'), $5, $6, $7, 'chromium', now(), now())
       RETURNING id, name, description, language, code, "browserType", viewport, "testIdAttribute",
                 "selfHealingEnabled", "createdAt", "updatedAt", "projectId"`,
      [id, name, description ?? null, language, code, userId, projectId ?? null]
    );
    const script = rows[0];

    res.status(201).json({
      success: true,
      data: script
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create script'
      });
    }
  }
};

/**
 * Update a script
 */
export const updateScript = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { name, description, language, code, browserType, viewport, testIdAttribute, selfHealingEnabled } = req.body;

    // Check if script exists and belongs to user
    const existing = await pool.query(
      `SELECT id FROM "Script" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );

    if (!existing.rowCount) {
      throw new AppError('Script not found', 404);
    }

    const { rows } = await pool.query(
      `UPDATE "Script"
       SET name = COALESCE($2, name),
           description = $3,
           language = $4,
           code = $5,
           "browserType" = $6,
           viewport = $7,
           "testIdAttribute" = $8,
           "selfHealingEnabled" = $9,
           "updatedAt" = now()
       WHERE id = $1
       RETURNING id, name, description, language, code, "browserType", viewport, "testIdAttribute",
                 "selfHealingEnabled", "createdAt", "updatedAt", "projectId"`,
      [id, name ?? null, description ?? null, language ?? null, code ?? null, browserType ?? null, viewport ?? null, testIdAttribute ?? null, selfHealingEnabled ?? null]
    );
    const script = rows[0];

    res.status(200).json({
      success: true,
      data: script
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update script'
      });
    }
  }
};

/**
 * Delete a script
 */
export const deleteScript = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const existing = await pool.query(
      `SELECT id FROM "Script" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );

    if (!existing.rowCount) {
      throw new AppError('Script not found', 404);
    }

    await pool.query(
      `DELETE FROM "Script" WHERE id = $1`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Script deleted successfully'
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete script'
      });
    }
  }
};
```

### 2. Test Run Controller (testRun.controller.ts)

```typescript
import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { allureService } from '../services/allure.service';
import pool from '../db';
import { randomUUID } from 'crypto';

/**
 * Get all test runs for a user
 */
export const getTestRuns = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const { rows } = await pool.query(
      `SELECT tr.*, s.name AS script_name
       FROM "TestRun" tr
       JOIN "Script" s ON s.id = tr."scriptId"
       WHERE tr."userId" = $1
       ORDER BY tr."startedAt" DESC`,
      [userId]
    );

    const testRuns = rows.map(r => ({
      ...r,
      script: { name: r.script_name }
    }));

    res.status(200).json({ success: true, data: testRuns });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get test runs' });
  }
};

/**
 * Get a specific test run
 */
export const getTestRun = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT tr.*, s.name AS script_name, s.language AS script_language
       FROM "TestRun" tr
       JOIN "Script" s ON s.id = tr."scriptId"
       WHERE tr.id = $1 AND tr."userId" = $2`,
      [id, userId]
    );

    const testRun = rows[0];
    if (!testRun) throw new AppError('Test run not found', 404);

    res.status(200).json({
      success: true,
      data: {
        ...testRun,
        script: { name: testRun.script_name, language: testRun.script_language }
      }
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to get test run' });
    }
  }
};

/**
 * Start a new test run
 */
export const startTestRun = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { scriptId, dataFileId: _dataFileId, environment, browser } = req.body;

    if (!scriptId) throw new AppError('Script ID is required', 400);

    const scriptRes = await pool.query(
      `SELECT id, name FROM "Script" WHERE id = $1 AND "userId" = $2`,
      [scriptId, userId]
    );
    const script = scriptRes.rows[0];
    if (!script) throw new AppError('Script not found', 404);

    const id = randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO "TestRun" (id, "scriptId", "userId", status, environment, browser, "startedAt")
       VALUES ($1, $2, $3, 'queued', COALESCE($4, 'development'), COALESCE($5, 'chromium'), now())
       RETURNING *`,
      [id, scriptId, userId, environment ?? null, browser ?? null]
    );
    const testRun = rows[0];

    try {
      await allureService.startTest(testRun.id, script.name);
    } catch (error) {
      console.error('Failed to start Allure test:', error);
    }

    setTimeout(async () => {
      try {
        const mockSteps = [
          { action: 'Navigate to page', status: 'passed' as const, duration: 500 },
          { action: 'Fill input field', status: 'passed' as const, duration: 300 },
          { action: 'Click submit button', status: 'passed' as const, duration: 200 },
          { action: 'Verify success message', status: 'passed' as const, duration: 150 }
        ];

        for (const step of mockSteps) {
          await allureService.recordStep(testRun.id, step.action, step.status, step.duration);
        }

        await allureService.endTest(testRun.id, 'passed');

        await pool.query(
          `UPDATE "TestRun"
           SET status = 'passed',
               "completedAt" = now(),
               duration = $2
           WHERE id = $1`,
          [testRun.id, mockSteps.reduce((sum, s) => sum + (s.duration || 0), 0)]
        );
      } catch (error) {
        console.error('Failed to complete mock test execution:', error);
      }
    }, 2000);

    res.status(201).json({ success: true, data: testRun });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to start test run' });
    }
  }
};

/**
 * Stop a test run
 */
export const stopTestRun = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const exists = await pool.query(
      `SELECT id FROM "TestRun" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );
    if (!exists.rowCount) throw new AppError('Test run not found', 404);

    const { rows } = await pool.query(
      `UPDATE "TestRun"
       SET status = 'cancelled', "completedAt" = now()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to stop test run' });
    }
  }
};

/**
 * Get active test runs
 */
export const getActiveTestRuns = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const { rows } = await pool.query(
      `SELECT tr.*, s.name AS script_name
       FROM "TestRun" tr
       JOIN "Script" s ON s.id = tr."scriptId"
       WHERE tr."userId" = $1 AND tr.status IN ('running','queued')
       ORDER BY tr."startedAt" DESC`,
      [userId]
    );

    const activeRuns = rows.map(r => ({ ...r, script: { name: r.script_name } }));

    res.status(200).json({ success: true, data: activeRuns });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get active test runs' });
  }
};

/**
 * Update test run status and complete
 */
export const updateTestRun = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { status, errorMsg, duration, steps } = req.body;

    const existsRes = await pool.query(
      `SELECT tr.id, s.name AS script_name
       FROM "TestRun" tr JOIN "Script" s ON s.id = tr."scriptId"
       WHERE tr.id = $1 AND tr."userId" = $2`,
      [id, userId]
    );
    const existing = existsRes.rows[0];
    if (!existing) throw new AppError('Test run not found', 404);

    if (steps && Array.isArray(steps)) {
      for (const step of steps) {
        try {
          await allureService.recordStep(
            id,
            step.action || step.name || 'Step',
            step.status || 'passed',
            step.duration
          );
        } catch (error) {
          console.error('Failed to record Allure step:', error);
        }
      }
    }

    if (status && ['passed', 'failed', 'error'].includes(status)) {
      try {
        await allureService.endTest(
          id,
          status === 'error' ? 'broken' : status,
          errorMsg
        );
      } catch (error) {
        console.error('Failed to end Allure test:', error);
      }
    }

    const { rows } = await pool.query(
      `UPDATE "TestRun"
       SET status = COALESCE($2, status),
           "errorMsg" = $3,
           duration = $4,
           "completedAt" = CASE WHEN $2 IN ('passed','failed','error','cancelled') THEN now() ELSE "completedAt" END
       WHERE id = $1
       RETURNING *`,
      [id, status ?? null, errorMsg ?? null, duration ?? null]
    );

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to update test run' });
    }
  }
};

/**
 * Report a test result (create completed TestRun)
 */
export const reportTestResult = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const {
      testName,
      status,
      duration,
      errorMsg,
      browser,
      environment,
      traceUrl,
      videoUrl,
      screenshotUrls
    } = req.body;

    if (!testName || !status) throw new AppError('testName and status are required', 400);

    let scriptRes = await pool.query(
      `SELECT id FROM "Script" WHERE "userId" = $1 AND name = $2`,
      [userId, testName]
    );
    let script = scriptRes.rows[0];

    if (!script) {
      const scriptId = randomUUID();
      const created = await pool.query(
        `INSERT INTO "Script" (id, name, description, language, code, "userId", "browserType", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, 'typescript', $4, $5, 'chromium', now(), now())
         RETURNING id`,
        [scriptId, testName, 'Auto-created from Playwright reporter', '// Recorded by Playwright reporter', userId]
      );
      script = created.rows[0];
    }

    const runId = randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO "TestRun" (id, "scriptId", "userId", status, duration, "errorMsg", browser, environment, "traceUrl", "videoUrl", "screenshotUrls", "completedAt", "startedAt")
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'msedge'), COALESCE($8, 'development'), $9, $10, $11, now(), now())
       RETURNING *`,
      [runId, script.id, userId, status, duration ?? null, errorMsg ?? null, browser ?? null, environment ?? null, traceUrl ?? null, videoUrl ?? null, screenshotUrls ?? null]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to report test result' });
    }
  }
};
```

## Example Usage Patterns

### 1. Database Connection Usage

```typescript
import pool from './db';

// Example: Query with parameters
const result = await pool.query(
  'SELECT * FROM "User" WHERE email = $1',
  [userEmail]
);

// Example: Transaction
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  await client.query(
    'INSERT INTO "Script" (id, name, code, "userId") VALUES ($1, $2, $3, $4)',
    [scriptId, scriptName, scriptCode, userId]
  );
  
  await client.query(
    'INSERT INTO "TestRun" (id, "scriptId", "userId", status) VALUES ($1, $2, $3, $4)',
    [testRunId, scriptId, userId, 'running']
  );
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### 2. Authentication Service Usage

```typescript
import { authService } from './services/auth/auth.service';

// Register a new user
const newUser = await authService.register(
  'user@example.com',
  'password123',
  'John Doe'
);

// Login user
const loginResult = await authService.login(
  'user@example.com',
  'password123'
);

// Refresh access token
const refreshedToken = await authService.refreshAccessToken(refreshToken);

// Verify token
const payload = authService.verifyAccessToken(accessToken);
```

### 3. Self-Healing Service Usage

```typescript
import { selfHealingService } from './services/selfHealing/selfHealing.service';

// Record a locator failure with a working alternative
await selfHealingService.recordFailure(
  scriptId,
  { locator: '#old-button', type: 'id' },
  { locator: '.new-button-class', type: 'css', elementTag: 'button' }
);

// Get suggestions for a script
const suggestions = await selfHealingService.getSuggestions(scriptId, 'pending');

// Approve a suggestion
await selfHealingService.approveSuggestion(suggestionId, userId);

// Get locator strategies for a user
const strategies = await selfHealingService.getLocatorStrategies(userId);

// Find alternative locator
const alternative = selfHealingService.findAlternativeLocator(
  { tag: 'button', id: 'submit-btn', className: 'btn-primary', attributes: { name: 'submit' } },
  ['id', 'css', 'xpath']
);
```

### 4. Script Controller Usage

```typescript
// Get all scripts for a user
const scripts = await getScripts(req, res);

// Create a new script
const newScript = await createScript(req, res);

// Update a script
const updatedScript = await updateScript(req, res);

// Delete a script
await deleteScript(req, res);
```

### 5. Test Run Controller Usage

```typescript
// Start a new test run
const testRun = await startTestRun(req, res);

// Get test runs for a user
const testRuns = await getTestRuns(req, res);

// Update test run status
const updatedRun = await updateTestRun(req, res);

// Report test result
const result = await reportTestResult(req, res);
```

## Migration Scripts

### Initial Migration (20240101000000_initial_migration.sql)

The initial migration creates all the necessary tables for the Playwright CRX testing framework:

1. **User Management Tables**:
   - `User` - Stores user information
   - `RefreshToken` - Stores JWT refresh tokens

2. **Project & Script Management Tables**:
   - `Project` - Organizes scripts into projects
   - `Script` - Stores test scripts with metadata

3. **Test Execution Tables**:
   - `TestRun` - Tracks test execution instances
   - `TestStep` - Records individual test steps

4. **Self-Healing Tables**:
   - `SelfHealingLocator` - Stores locator healing suggestions
   - `LocatorStrategy` - Configures locator strategy priorities

5. **Data-Driven Testing Tables**:
   - `TestDataFile` - Stores uploaded test data files
   - `TestDataRow` - Stores parsed test data rows

6. **Extension & Debugging Tables**:
   - `ExtensionScript` - Custom extension scripts
   - `Variable` - Script variables
   - `Breakpoint` - Debug breakpoints

The migration includes proper indexes, foreign keys, and constraints to ensure data integrity and optimal query performance.

## Database Architecture Diagram

```mermaid
erDiagram
    User ||--o{ Project : owns
    User ||--o{ Script : creates
    User ||--o{ TestRun : executes
    User ||--o{ RefreshToken : has
    User ||--o{ TestDataFile : uploads
    User ||--o{ ExtensionScript : owns
    User ||--o{ LocatorStrategy : configures
    
    Project ||--o{ Script : contains
    
    Script ||--o{ TestRun : generates
    Script ||--o{ SelfHealingLocator : uses
    Script ||--o{ TestDataFile : references
    Script ||--o{ Variable : has
    Script ||--o{ Breakpoint : contains
    
    TestRun ||--o{ TestStep : includes
    
    TestDataFile ||--o{ TestDataRow : contains
    
    User {
        string id PK
        string email UK
        string password
        string name
        datetime createdAt
        datetime updatedAt
    }
    
    Script {
        string id PK
        string name
        text description
        string language
        text code
        string projectId FK
        string userId FK
        string browserType
        json viewport
        string testIdAttribute
        boolean selfHealingEnabled
        datetime createdAt
        datetime updatedAt
    }
    
    TestRun {
        string id PK
        string scriptId FK
        string userId FK
        string status
        int duration
        text errorMsg
        string traceUrl
        json screenshotUrls
        string videoUrl
        string allureReportUrl
        string environment
        string browser
        json viewport
        datetime startedAt
        datetime completedAt
    }
    
    SelfHealingLocator {
        string id PK
        string scriptId FK
        text brokenLocator
        string brokenType
        text validLocator
        string validType
        string elementTag
        text elementText
        float confidence
        string status
        datetime approvedAt
        int timesUsed
        datetime lastUsedAt
        datetime createdAt
        datetime updatedAt
    }
```

This comprehensive database integration code provides a solid foundation for the Playwright CRX testing framework, supporting user management, script storage, test execution tracking, self-healing mechanisms, and data-driven testing capabilities.