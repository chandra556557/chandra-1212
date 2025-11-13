# Self-Healing Quick Test (30 Seconds) ⚡

## Copy-Paste Script (Just 3 Steps!)

### Step 1: Copy This Script
```javascript
await page.goto('https://demo.playwright.dev/todomvc/');

try {
  await page.click('#new-todo-123456789');
} catch (error) {
  console.log('❌ Failed - Self-healing should capture this!');
}

try {
  await page.fill('.css-1x2y3z4', 'test');
} catch (error) {
  console.log('❌ Failed - Self-healing should capture this!');
}

await page.fill('.new-todo', 'Working locator');
await page.press('.new-todo', 'Enter');
console.log('✅ Passed - This one works!');
```

### Step 2: Run in Extension
```
1. Open Playwright extension
2. Login (demo@example.com / demo123)
3. Paste script in code panel
4. Click "Save DB" → Name: "Quick Test"
5. Click "Execute" → "Run"
```

### Step 3: Check Results
```
1. Click "Heal" button
2. Click "Refresh"
3. See 2 suggestions!
```

---

## Expected Output

### Console:
```
❌ Failed - Self-healing should capture this!
❌ Failed - Self-healing should capture this!
✅ Passed - This one works!
```

### Heal Panel:
```
Self-Healing Suggestions (2 pending)

1. Broken: #new-todo-123456789
   Valid:  .new-todo
   Confidence: 85%
   [Approve] [Reject]

2. Broken: .css-1x2y3z4
   Valid:  input.new-todo
   Confidence: 75%
   [Approve] [Reject]
```

---

## ✅ Success = You See 2 Suggestions!

**That's it!** Self-healing is working if you see suggestions in the Heal panel.

---

## 🔍 Verify in Console (Optional)

Press F12 and run:
```javascript
const stats = await selfHealingService.getStatistics();
console.log('Suggestions:', stats.total); // Should be 2
```

---

**Next:** Check `README.md` for more detailed examples and `VISUAL_TEST_GUIDE.md` for step-by-step screenshots!
