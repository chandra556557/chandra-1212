# Self-Healing Demo Scripts

This directory contains demo scripts to test the self-healing functionality of the Playwright extension.

## 📁 Files

### 1. `simple-demo.js` ⭐ **Recommended for Quick Testing**
- Copy-paste ready script
- Works directly in extension code panel
- 5 test cases with intentional failures
- Clear console output

### 2. `demo-script.spec.ts`
- Full Playwright test suite
- More comprehensive examples
- Can be run via backend API
- Multiple test scenarios

## 🚀 Quick Start Guide

### Method 1: Using Extension UI (Easiest)

**Step 1: Copy the Script**
```bash
# Open simple-demo.js and copy all contents
```

**Step 2: Paste in Extension**
```
1. Click Playwright extension icon
2. Login (demo@example.com / demo123)
3. Paste script in code panel
4. Click "Save DB" button
5. Give it a name: "Self-Healing Demo"
```

**Step 3: Run the Script**
```
1. Click "Execute" button
2. Click "Run" or select from "Script Library"
3. Wait for execution to complete
```

**Step 4: Check Healing Suggestions**
```
1. Click "Heal" button in toolbar
2. Click "Refresh" if needed
3. See suggestions for failed locators!
```

### Method 2: Run as Playwright Test

**Step 1: Copy to Tests Directory**
```bash
# Copy demo-script.spec.ts to your tests folder
cp examples/self-healing-demo/demo-script.spec.ts tests/
```

**Step 2: Run with Playwright**
```bash
npx playwright test demo-script.spec.ts
```

**Step 3: Check Extension**
```
- Open extension
- Click "Heal" button
- See captured failures
```

## 📊 What to Expect

### Console Output
```
❌ Test 1 failed (expected) - Self-healing should capture this
Expected healing: .new-todo or [data-testid="new-todo"]

❌ Test 2 failed (expected) - Self-healing should capture this
Expected healing: .new-todo or input.new-todo

❌ Test 3 failed (expected) - Self-healing should capture this
Expected healing: .new-todo

✅ Test 4 passed - This is the correct locator
Todo count: 1

❌ Test 5 failed (expected) - Self-healing should capture this
Expected healing: Look for button with stable attributes

=== Self-Healing Demo Complete ===
Check the "Heal" panel in the extension to see suggestions!
```

### Self-Healing UI
```
┌─────────────────────────────────────────┐
│ Self-Healing Suggestions (4 pending)   │
├─────────────────────────────────────────┤
│ Pending (4)                             │
│                                         │
│ 1. Broken: #new-todo-123456789          │
│    Valid:  .new-todo                    │
│    Confidence: 85%                      │
│    [Approve] [Reject]                   │
│                                         │
│ 2. Broken: .css-1x2y3z4-input           │
│    Valid:  input.new-todo               │
│    Confidence: 75%                      │
│    [Approve] [Reject]                   │
│                                         │
│ 3. Broken: /html/body/div[1]/section... │
│    Valid:  .new-todo                    │
│    Confidence: 65%                      │
│    [Approve] [Reject]                   │
│                                         │
│ 4. Broken: #button-timestamp-1234567... │
│    Valid:  button[type="submit"]        │
│    Confidence: 80%                      │
│    [Approve] [Reject]                   │
└─────────────────────────────────────────┘
```

## 🧪 Test Scenarios Included

### Scenario 1: Dynamic ID
```javascript
// ❌ BAD: Long numeric ID
await page.click('#new-todo-123456789');

// ✅ Expected Healing: .new-todo
// Confidence: ~85%
// Reason: ID contains long numbers (unstable pattern)
```

### Scenario 2: CSS Module
```javascript
// ❌ BAD: CSS module class
await page.fill('.css-1x2y3z4-input', 'text');

// ✅ Expected Healing: input.new-todo
// Confidence: ~75%
// Reason: CSS-in-JS class (changes on build)
```

### Scenario 3: Fragile XPath
```javascript
// ❌ BAD: XPath with indices
await page.click('/html/body/div[1]/section[1]/header[1]/input[1]');

// ✅ Expected Healing: .new-todo
// Confidence: ~65%
// Reason: XPath with array indices (very fragile)
```

### Scenario 4: Working Locator (Control)
```javascript
// ✅ GOOD: Stable class selector
await page.fill('.new-todo', 'Buy groceries');
await page.press('.new-todo', 'Enter');

// This should pass and not trigger healing
```

### Scenario 5: Timestamp ID
```javascript
// ❌ BAD: Timestamp in ID
await page.click('#button-timestamp-1234567890');

// ✅ Expected Healing: button[type="submit"]
// Confidence: ~80%
// Reason: Contains timestamp pattern
```

## 🔍 Unstable Patterns Detected

The self-healing service automatically detects these patterns:

| Pattern | Example | Detection | Confidence |
|---------|---------|-----------|------------|
| Long Numeric ID | `#element-1234567890` | ✅ Auto | Low (20-30%) |
| CSS Module | `.css-1x2y3z4` | ✅ Auto | Very Low (<20%) |
| Timestamp | `#timestamp-1638457890` | ✅ Auto | Low (20-30%) |
| UUID | `#uuid-abc-def-123` | ✅ Auto | Very Low (<20%) |
| Random String | `#random-abc123xyz` | ✅ Auto | Low (30-40%) |
| XPath Index | `/html/body/div[1]/section[2]` | ✅ Auto | Low (40%) |

## 📈 Confidence Score Meaning

| Score | Meaning | Action |
|-------|---------|--------|
| 90-100% | Very High | Auto-apply recommended |
| 80-89% | High | Safe to approve |
| 70-79% | Good | Review before approval |
| 60-69% | Medium | Verify manually |
| 50-59% | Low | Test thoroughly |
| <50% | Very Low | Manual fix recommended |

## 🎯 Best Practices

### ✅ DO:
1. Review all suggestions before approving
2. Test approved healings in development
3. Track success rate of healings
4. Use high-confidence (>80%) for auto-apply
5. Keep healing history for reference

### ❌ DON'T:
1. Auto-approve everything
2. Ignore low-confidence suggestions
3. Delete suggestions without review
4. Skip testing after healing
5. Use in production without validation

## 🛠️ Customization

### Create Your Own Test Cases

```javascript
// Template for testing specific locator
try {
  await page.click('YOUR_UNSTABLE_LOCATOR_HERE');
  console.log('✅ Passed');
} catch (error) {
  console.log('❌ Failed - Healing triggered');
  console.log('Expected healing: YOUR_EXPECTED_ALTERNATIVE');
}
```

### Test Real Application

```javascript
// Use your actual application
await page.goto('https://your-app.com/login');

// Use intentionally unstable locators
await page.fill('#username-field-random-123', 'user');
await page.fill('.css-password-xyz', 'pass');
await page.click('//*[@id="login"]/button[1]');

// Check healing suggestions
```

## 📊 Monitoring Self-Healing

### Check Statistics
```javascript
// In extension console (F12):
const stats = await selfHealingService.getStatistics();
console.table(stats);
```

**Expected Output:**
```
┌─────────────────────┬────────┐
│ Metric              │ Value  │
├─────────────────────┼────────┤
│ total               │ 4      │
│ pending             │ 4      │
│ approved            │ 0      │
│ rejected            │ 0      │
│ averageConfidence   │ 0.76   │
│ aiEnhancedCount     │ 0      │
│ aiSuccessRate       │ 0      │
│ visualSimilarityAvg │ 0      │
└─────────────────────┴────────┘
```

### Check Healing History
```javascript
// In extension console:
const history = await realDataIntegration.getRealHealingHistory();
console.table(history);
```

## 🐛 Troubleshooting

### No Suggestions Appear?

**Check:**
1. ✅ Test actually failed (see console errors)
2. ✅ Error message contains "locator" or "selector"
3. ✅ Test Executor panel is open (starts listening)
4. ✅ Clicked "Refresh" in Heal panel

**Debug:**
```javascript
// Check if integration is running:
console.log('Listening:', realDataIntegration.isListening);
// Should be: true

// Check active executions:
console.log('Active:', realDataIntegration.activeExecutions.size);
```

### Low Confidence Scores?

**Reasons:**
- No stable attributes on element
- Page structure too simple
- Multiple similar elements
- Element doesn't exist in DOM

**Improve:**
- Add data-testid attributes
- Use aria-labels
- Add semantic HTML
- Ensure unique identifiers

### Suggestions Not Accurate?

**Try:**
```javascript
// Manually create better suggestion:
await selfHealingService.recordFailure(
  { locator: '#broken-id', type: 'id', confidence: 0.3 },
  { locator: '[data-testid="correct"]', type: 'testid', confidence: 0.95 }
);
```

## 📚 Additional Resources

### Documentation:
- `SELF_HEALING_COMPLETE.md` - Complete implementation guide
- `SELF_HEALING_QUICK_START.md` - Quick start guide
- `SELF_HEALING_ARCHITECTURE.md` - System architecture
- `SELF_HEALING_STATUS.md` - Feature status

### Console Commands:
```javascript
// Get suggestions
await selfHealingService.getSuggestions()

// Approve suggestion
await selfHealingService.approveSuggestion(id)

// Reject suggestion
await selfHealingService.rejectSuggestion(id)

// Get statistics
await selfHealingService.getStatistics()

// Check AI status
selfHealingService.isAIEnabled()
```

## ✅ Success Checklist

After running demo:

- [ ] Extension reloaded
- [ ] Backend running (optional)
- [ ] Script executed successfully
- [ ] Console shows failures
- [ ] "Heal" panel shows suggestions
- [ ] Can approve/reject suggestions
- [ ] Statistics update correctly

**All checked?** ✅ Self-healing is working! 🎉

## 🎓 Next Steps

1. **Test with Your App**: Replace demo URL with your application
2. **Add Real Locators**: Use actual failing locators from your tests
3. **Track Metrics**: Monitor healing success rates
4. **Refine Strategies**: Adjust locator priorities based on results
5. **Auto-Apply**: Enable auto-healing for high-confidence suggestions

---

**Need Help?** Check the main documentation in the root directory or run the diagnostic script in extension console.
