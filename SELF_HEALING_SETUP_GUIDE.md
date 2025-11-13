# Self-Healing Backend - Complete Setup Guide

## ✅ What's Been Implemented

### Backend Files Created/Modified:

1. **Service**: `backend/src/services/selfHealing/selfHealing.service.ts` ✅
   - Enhanced with `getAllSuggestions(userId)` 
   - Added `createDemoSuggestions(userId)`
   - Added reason detection logic

2. **Controller**: `backend/src/controllers/selfHealing.controller.ts` ✅
   - GET `/api/self-healing/suggestions`
   - POST `/api/self-healing/suggestions/:id/approve`
   - POST `/api/self-healing/suggestions/:id/reject`
   - POST `/api/self-healing/suggestions/demo`
   - GET `/api/self-healing/strategies`
   - PUT `/api/self-healing/strategies`

3. **Routes**: `backend/src/routes/selfHealing.routes.ts` ✅
   - All 6 endpoints configured with auth middleware

4. **Migration**: `backend/migrations/add_reason_to_self_healing.sql` ✅
   - Adds `reason` column to SelfHealingLocator table

5. **Frontend**: `frontend/src/App.tsx` ✅
   - Complete Self-Healing tab with UI

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Database Migration

```powershell
# Option A: Using psql command
$env:PGPASSWORD="your_password"
psql -h localhost -U playwright_user -d playwright_crx -f backend/migrations/add_reason_to_self_healing.sql

# Option B: Using PowerShell
$query = Get-Content backend/migrations/add_reason_to_self_healing.sql -Raw
psql -h localhost -U playwright_user -d playwright_crx -c $query
```

### Step 2: Restart Backend

```bash
cd playwright-crx-enhanced/backend
npm run dev
```

### Step 3: Start Frontend

```bash
cd playwright-crx-enhanced/frontend
npm run dev
```

---

## 📊 Test the Integration

### 1. Login to Frontend
```
URL: http://localhost:5173
Email: demo@example.com
Password: demo123
```

### 2. Go to Self-Healing Tab
- Click "💊 Self-Healing" in navigation
- Click "✨ Create Demo Suggestions"

### 3. You Should See:
- 5 demo suggestions with different locator patterns
- Statistics dashboard (Total, Pending, Approved, Avg Confidence)
- Approve/Reject buttons
- Confidence scores color-coded

---

## 🔍 API Endpoints Reference

### GET /api/self-healing/suggestions
Get all suggestions for authenticated user

**Response:**
```json
{
  "suggestions": [
    {
      "id": "abc123",
      "brokenLocator": "#submit-btn-12345",
      "validLocator": "[data-testid=\"submit\"]",
      "confidence": 0.95,
      "status": "pending",
      "scriptId": "xyz789",
      "scriptName": "Login Test",
      "createdAt": "2024-01-15T10:30:00Z",
      "reason": "Dynamic ID with numbers detected"
    }
  ]
}
```

### POST /api/self-healing/suggestions/:id/approve
Approve a suggestion

**Response:**
```json
{
  "success": true,
  "suggestion": { /* updated suggestion */ }
}
```

### POST /api/self-healing/suggestions/:id/reject
Reject a suggestion

**Response:**
```json
{
  "success": true,
  "suggestion": { /* updated suggestion */ }
}
```

### POST /api/self-healing/suggestions/demo
Create demo suggestions for testing

**Response:**
```json
{
  "success": true,
  "suggestions": [ /* 5 demo suggestions */ ]
}
```

---

## 🗄️ Database Schema

The `SelfHealingLocator` table structure:

```sql
CREATE TABLE "SelfHealingLocator" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "scriptId" TEXT NOT NULL,
    "brokenLocator" TEXT NOT NULL,
    "brokenType" TEXT NOT NULL,
    "validLocator" TEXT NOT NULL,
    "validType" TEXT NOT NULL,
    "elementTag" TEXT,
    "elementText" TEXT,
    confidence FLOAT DEFAULT 1.0,
    status TEXT DEFAULT 'pending',
    reason TEXT,  -- ✨ NEWLY ADDED
    "approvedAt" TIMESTAMP,
    "timesUsed" INTEGER DEFAULT 0,
    "lastUsedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT now(),
    "updatedAt" TIMESTAMP DEFAULT now(),
    FOREIGN KEY ("scriptId") REFERENCES "Script"(id) ON DELETE CASCADE,
    UNIQUE ("scriptId", "brokenLocator", "validLocator")
);

CREATE INDEX idx_self_healing_script ON "SelfHealingLocator"("scriptId");
CREATE INDEX idx_self_healing_status ON "SelfHealingLocator"(status);
CREATE INDEX idx_self_healing_broken ON "SelfHealingLocator"("brokenLocator");
```

---

## 🧪 Testing Endpoints

### Using curl:

```bash
# 1. Login first
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}' \
  | jq -r '.accessToken')

# 2. Create demo suggestions
curl -X POST http://localhost:3000/api/self-healing/suggestions/demo \
  -H "Authorization: Bearer $TOKEN"

# 3. Get all suggestions
curl http://localhost:3000/api/self-healing/suggestions \
  -H "Authorization: Bearer $TOKEN"

# 4. Approve a suggestion (replace ID)
curl -X POST http://localhost:3000/api/self-healing/suggestions/abc123/approve \
  -H "Authorization: Bearer $TOKEN"
```

### Using frontend:
1. Open http://localhost:5173
2. Login with demo credentials
3. Click "💊 Self-Healing" tab
4. Click "✨ Create Demo Suggestions"
5. Use Approve/Reject buttons

---

## 💾 Manual Database Setup (If Needed)

If the table doesn't exist yet, create it:

```sql
CREATE TABLE IF NOT EXISTS "SelfHealingLocator" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "scriptId" TEXT NOT NULL,
    "brokenLocator" TEXT NOT NULL,
    "brokenType" TEXT NOT NULL,
    "validLocator" TEXT NOT NULL,
    "validType" TEXT NOT NULL,
    "elementTag" TEXT,
    "elementText" TEXT,
    confidence FLOAT DEFAULT 1.0,
    status TEXT DEFAULT 'pending',
    reason TEXT,
    "approvedAt" TIMESTAMP,
    "timesUsed" INTEGER DEFAULT 0,
    "lastUsedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT now(),
    "updatedAt" TIMESTAMP DEFAULT now(),
    FOREIGN KEY ("scriptId") REFERENCES "Script"(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_self_healing_unique 
    ON "SelfHealingLocator"("scriptId", "brokenLocator", "validLocator");
CREATE INDEX IF NOT EXISTS idx_self_healing_script ON "SelfHealingLocator"("scriptId");
CREATE INDEX IF NOT EXISTS idx_self_healing_status ON "SelfHealingLocator"(status);
CREATE INDEX IF NOT EXISTS idx_self_healing_broken ON "SelfHealingLocator"("brokenLocator");
```

---

## ⚠️ Troubleshooting

### Issue: "Column reason already exists"
**Solution:** Migration is idempotent - safe to run multiple times

### Issue: "Table SelfHealingLocator does not exist"
**Solution:** Run full database setup:
```powershell
.\setup-database.ps1
```

### Issue: "Unauthorized" error
**Solution:** Make sure you're logged in and token is valid

### Issue: "No suggestions returned"
**Solution:** 
1. Click "Create Demo Suggestions" first
2. Or run a test that fails
3. Check backend logs for errors

### Issue: Frontend can't connect
**Solution:** 
1. Verify backend is running on port 3000
2. Check CORS settings in backend
3. Verify `ALLOWED_ORIGINS` includes `http://localhost:5173`

---

## 📁 File Structure

```
playwright-crx-enhanced/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── selfHealing.controller.ts      ✅ NEW
│   │   ├── routes/
│   │   │   └── selfHealing.routes.ts          ✅ UPDATED
│   │   ├── services/
│   │   │   └── selfHealing/
│   │   │       └── selfHealing.service.ts     ✅ ENHANCED
│   │   └── index.ts                           ✅ (routes already registered)
│   └── migrations/
│       └── add_reason_to_self_healing.sql     ✅ NEW
└── frontend/
    └── src/
        └── App.tsx                             ✅ ENHANCED
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Database migration ran successfully
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login to frontend
- [ ] Self-Healing tab appears
- [ ] Can create demo suggestions
- [ ] Statistics show correct counts
- [ ] Can approve suggestions
- [ ] Can reject suggestions
- [ ] Refresh button works

---

## 🎯 Next Steps

### Integrate with Test Execution:

When tests fail in the backend, automatically create suggestions:

```typescript
// In testRun service when test fails:
import { selfHealingService } from '../services/selfHealing/selfHealing.service';

try {
  await page.click(locator);
} catch (error) {
  // Extract locator from error
  const brokenLocator = extractLocator(error.message);
  
  // Find alternative
  const element = await page.$('button[type="submit"]'); // smart detection
  const validLocator = await findBestLocator(element);
  
  // Create suggestion
  await selfHealingService.recordFailure(
    scriptId,
    { locator: brokenLocator, type: 'css' },
    { locator: validLocator, type: 'testid' }
  );
}
```

---

## 🎉 Success!

You now have a fully functional self-healing system with:

✅ Backend API endpoints
✅ Database schema (no Prisma needed!)
✅ Frontend UI
✅ Demo mode for testing
✅ Real-time statistics
✅ Approve/Reject workflow
✅ Multi-user support

**Test it now:** Run the migration, start both servers, and create demo suggestions!
