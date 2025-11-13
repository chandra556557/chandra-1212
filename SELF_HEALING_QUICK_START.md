# Self-Healing Quick Start Guide

## 🚀 How to Use Self-Healing (Now Working!)

### Setup (One Time)

1. **Reload Extension**
   ```
   chrome://extensions/ → Find Playwright CRX → Click Reload
   ```

2. **Ensure Backend Running**
   ```bash
   cd playwright-crx-enhanced/backend
   npm run dev
   ```

---

## Using Self-Healing

### Method 1: Automatic (Recommended)

**Just run tests normally!**

```
1. Click Playwright extension icon
2. Login (if needed)
3. Click "Execute" button
4. Run any test
5. When test fails → Self-healing captures it
6. Click "Heal" button → See suggestions
7. Approve/Reject suggestions
```

### Method 2: Manual Testing

**Create suggestions manually in console:**

```javascript
// Open extension console (F12 on popup)
await selfHealingService.recordFailure(
  { locator: '#broken-id-12345', type: 'id', confidence: 0.3 },
  { locator: '[data-testid="submit"]', type: 'testid', confidence: 0.95 }
);

// Click "Heal" → Click "Refresh" → See suggestion!
```

---

## What You'll See

### When Test Fails:

**Console:**
```
Test execution started for script: abc123
Error: locator: "#button-12345" - Element not found
🔍 Attempting auto-healing...
✅ Healing suggestion created!
```

### In Self-Healing UI:

```
┌────────────────────────────────────┐
│ Self-Healing Suggestions (1)      │
├────────────────────────────────────┤
│ Pending (1)                        │
│                                    │
│ Broken: #button-12345              │
│ Valid:  [data-testid="btn"]        │
│ Confidence: 95%                    │
│                                    │
│ [Approve] [Reject]                 │
└────────────────────────────────────┘
```

---

## Quick Actions

### Approve Suggestion
```
1. Click "Approve" button
2. Confidence increases
3. Can be auto-applied in future
```

### Reject Suggestion
```
1. Click "Reject" button
2. Marked as rejected
3. Won't suggest again
```

### Refresh Suggestions
```
1. Click "Refresh" button
2. Loads latest from storage
3. Shows new suggestions
```

---

## Check Integration Status

### Console Check:
```javascript
// Extension console:
console.log('Listening:', realDataIntegration.isListening);
// Should show: true when Test Executor open

console.log('Stats:', await realDataIntegration.getRealHealingStatistics());
// Shows real statistics
```

### Visual Check:
```
✅ Test Executor panel opens
✅ Console shows: "✅ Self-healing integration started"
✅ Run test → Test fails
✅ Open "Heal" panel
✅ See suggestions appear
```

---

## Troubleshooting

### No Suggestions?

**Check these:**
```
□ Test actually failed (see error in logs)
□ Error contains word "locator" 
□ Test Executor panel was open
□ Clicked "Refresh" in Heal panel
```

**Force create suggestion:**
```javascript
await selfHealingService.recordFailure(
  { locator: '#test', type: 'id', confidence: 0.5 },
  { locator: '[data-testid="test"]', type: 'testid', confidence: 0.9 }
);
```

### Integration Not Working?

**Restart everything:**
```
1. Close Test Executor panel
2. Reload extension (chrome://extensions/)
3. Reopen Test Executor panel
4. Check console: "✅ Self-healing integration started"
```

---

## Examples

### Example 1: Dynamic ID Detected
```
Failed: #submit-button-1234567890
Suggested: [data-testid="submit-btn"]
Reason: Long numeric ID detected (unstable)
Confidence: 95%
```

### Example 2: CSS Module Class
```
Failed: .css-1x2y3z4
Suggested: button[aria-label="Submit"]
Reason: CSS module class (changes on build)
Confidence: 85%
```

### Example 3: Fragile XPath
```
Failed: /html/body/div[3]/div[1]/button
Suggested: button[role="button"][name="submit"]
Reason: XPath with array indices (fragile)
Confidence: 80%
```

---

## Statistics

### View in UI:
```
Open "Heal" panel → See at top:
- Total: X suggestions
- Pending: Y waiting review
- Approved: Z accepted
- Rejected: W declined
- Average Confidence: XX%
```

### View in Console:
```javascript
const stats = await selfHealingService.getStatistics();
console.table(stats);
```

---

## Advanced Usage

### Check Event Listeners:
```javascript
// See if events are firing
window.addEventListener('locatorFailed', (e) => {
  console.log('Locator failed event:', e.detail);
});
```

### View Healing History:
```javascript
const history = await realDataIntegration.getRealHealingHistory();
console.table(history);
```

### Force AI Enhancement:
```javascript
selfHealingService.setAIEnabled(true);
console.log('AI enabled:', selfHealingService.isAIEnabled());
```

---

## Best Practices

### ✅ Do:
- Let tests run naturally
- Review suggestions before approving
- Use high confidence (>90%) for auto-apply
- Track which suggestions work

### ❌ Don't:
- Auto-approve everything
- Ignore low confidence suggestions
- Delete suggestions without review
- Forget to test after healing

---

## Quick Commands Reference

```javascript
// Create suggestion
await selfHealingService.recordFailure(broken, valid);

// Get suggestions
await selfHealingService.getSuggestions();

// Approve suggestion
await selfHealingService.approveSuggestion(id);

// Reject suggestion
await selfHealingService.rejectSuggestion(id);

// Get statistics
await selfHealingService.getStatistics();

// Check if AI enabled
selfHealingService.isAIEnabled();

// Enable/disable AI
selfHealingService.setAIEnabled(true/false);

// Get history
await realDataIntegration.getRealHealingHistory();

// Get stats
await realDataIntegration.getRealHealingStatistics();
```

---

## Status Indicators

### 🟢 Working
- Real test integration
- Event dispatching
- Auto-suggestion creation
- UI display
- Approve/Reject
- Statistics

### 🟡 Partial
- AI enhancement (if configured)
- Visual similarity (if AI enabled)

### 🔴 Not Yet
- Auto-script updates (coming soon)
- Batch operations (coming soon)
- Visual diffs (coming soon)

---

## Support

### Check Logs:
```
1. F12 on extension popup
2. Console tab
3. Look for:
   - "✅ Self-healing integration started"
   - "Test execution started"
   - "Locator failed"
   - "Healing suggestion created"
```

### Check Storage:
```javascript
// See what's stored
chrome.storage.local.get(null, (data) => {
  console.log('Storage:', data);
});
```

---

## Success Checklist

Run through this to verify everything works:

- [ ] Extension reloaded
- [ ] Backend running
- [ ] Logged in to extension
- [ ] Test Executor opened
- [ ] Console shows "integration started"
- [ ] Run a test
- [ ] Test fails
- [ ] Open "Heal" panel
- [ ] See suggestion appear
- [ ] Can approve/reject
- [ ] Stats update

**All checked?** ✅ **Self-healing is working!** 🎉

---

**Need Help?** Check `SELF_HEALING_REAL_DATA_INTEGRATION.md` for detailed technical documentation.
