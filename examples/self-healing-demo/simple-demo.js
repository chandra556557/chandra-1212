/**
 * Simple Self-Healing Demo Script
 * 
 * This is a simplified version that can be copied and pasted
 * into the Playwright extension's code editor.
 * 
 * USAGE:
 * 1. Copy this entire script
 * 2. Open Playwright extension
 * 3. Paste into code panel
 * 4. Click "Save DB" to save to backend
 * 5. Run via "Execute" button
 * 6. Check "Heal" panel for suggestions
 */

// Navigate to demo page
await page.goto('https://demo.playwright.dev/todomvc/');

// Test 1: Unstable ID with numbers (WILL FAIL)
// This will trigger self-healing
try {
  await page.click('#new-todo-123456789');
  console.log('✅ Test 1 passed (unexpected)');
} catch (error) {
  console.log('❌ Test 1 failed (expected) - Self-healing should capture this');
  console.log('Expected healing: .new-todo or [data-testid="new-todo"]');
}

// Test 2: CSS module class (WILL FAIL)
try {
  await page.fill('.css-1x2y3z4-input', 'Buy milk');
  console.log('✅ Test 2 passed (unexpected)');
} catch (error) {
  console.log('❌ Test 2 failed (expected) - Self-healing should capture this');
  console.log('Expected healing: .new-todo or input.new-todo');
}

// Test 3: Fragile XPath (WILL FAIL)
try {
  await page.click('/html/body/div[1]/section[1]/header[1]/input[1]');
  console.log('✅ Test 3 passed (unexpected)');
} catch (error) {
  console.log('❌ Test 3 failed (expected) - Self-healing should capture this');
  console.log('Expected healing: .new-todo');
}

// Test 4: WORKING example (reference)
try {
  await page.fill('.new-todo', 'Buy groceries');
  await page.press('.new-todo', 'Enter');
  console.log('✅ Test 4 passed - This is the correct locator');
  
  // Verify todo was added
  const todoCount = await page.locator('.todo-list li').count();
  console.log(`Todo count: ${todoCount}`);
  
} catch (error) {
  console.log('❌ Test 4 failed (unexpected):', error.message);
}

// Test 5: Dynamic timestamp ID (WILL FAIL)
try {
  await page.click('#button-timestamp-1234567890');
  console.log('✅ Test 5 passed (unexpected)');
} catch (error) {
  console.log('❌ Test 5 failed (expected) - Self-healing should capture this');
  console.log('Expected healing: Look for button with stable attributes');
}

console.log('\n=== Self-Healing Demo Complete ===');
console.log('Check the "Heal" panel in the extension to see suggestions!');
console.log('You should see 4-5 failed locators with healing suggestions.');
