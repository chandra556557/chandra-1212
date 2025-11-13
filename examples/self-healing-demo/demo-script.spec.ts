/**
 * Self-Healing Demo Script
 * 
 * This script demonstrates self-healing by using unstable locators
 * that will fail and trigger healing suggestions.
 * 
 * Usage:
 * 1. Save this script to the backend (use "Save DB" button)
 * 2. Run it through the Test Executor
 * 3. Check the "Heal" panel for suggestions
 */

import { test, expect } from '@playwright/test';

test.describe('Self-Healing Demo', () => {
  
  test('Example 1: Dynamic ID Pattern (Will Fail)', async ({ page }) => {
    // Navigate to a demo page
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // ❌ BAD: Using dynamic ID with numbers (will likely fail)
    // This simulates a locator that breaks when IDs change
    await page.click('#new-todo-123456789'); // Unstable locator
    
    // ✅ GOOD: Should be data-testid or stable attribute
    // Expected healing suggestion: [data-testid="new-todo"]
  });

  test('Example 2: CSS Module Class (Will Fail)', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // ❌ BAD: CSS module class (changes on every build)
    await page.fill('.css-1x2y3z4-input', 'Buy milk');
    
    // ✅ GOOD: Should use semantic selector
    // Expected healing suggestion: input[placeholder="What needs to be done?"]
  });

  test('Example 3: Fragile XPath (Will Fail)', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // ❌ BAD: XPath with array indices (very fragile)
    await page.click('/html/body/div[1]/section[1]/header[1]/input[1]');
    
    // ✅ GOOD: Should use data-testid or aria-label
    // Expected healing suggestion: [data-testid="new-todo"]
  });

  test('Example 4: Timestamp-based ID (Will Fail)', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // ❌ BAD: ID with timestamp (changes every second)
    await page.click('#button-timestamp-1234567890');
    
    // ✅ GOOD: Should use stable identifier
    // Expected healing suggestion: button[aria-label="Add"]
  });

  test('Example 5: UUID Pattern (Will Fail)', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // ❌ BAD: UUID-based ID (unique every time)
    await page.click('#uuid-abc-def-123-456-789');
    
    // ✅ GOOD: Should use semantic identifier
    // Expected healing suggestion: [data-testid="submit-button"]
  });

  test('Example 6: Working Locator (Will Pass)', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // ✅ GOOD: Using stable class selector
    await page.fill('.new-todo', 'Buy groceries');
    await page.press('.new-todo', 'Enter');
    
    // Verify the todo was added
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li')).toContainText('Buy groceries');
  });

  test('Example 7: Multiple Actions with Mixed Locators', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // ❌ BAD: Unstable locator
    await page.click('#input-random-12345'); // Will fail
    
    // ✅ GOOD: Stable locator
    await page.fill('.new-todo', 'Task 1');
    await page.press('.new-todo', 'Enter');
    
    // ❌ BAD: CSS module
    await page.click('.css-abc123-button'); // Will fail
    
    // ✅ GOOD: Using text
    await page.click('text=All');
  });

  test('Example 8: Nested Elements with Unstable Path', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // ❌ BAD: Long chain of divs with indices
    await page.click('div.app > div:nth-child(1) > section:nth-child(2) > input:nth-child(3)');
    
    // ✅ GOOD: Should use direct semantic selector
    // Expected healing: input.new-todo or [data-testid="new-todo"]
  });
});

test.describe('Self-Healing with Real Application', () => {
  
  test('Login Form - Unstable Locators', async ({ page }) => {
    // Using a real demo site
    await page.goto('https://the-internet.herokuapp.com/login');
    
    // ❌ BAD: ID with numeric suffix (unstable pattern)
    await page.fill('#username-field-987654', 'tomsmith');
    
    // Correct locator (for reference):
    // await page.fill('#username', 'tomsmith');
    
    // ❌ BAD: CSS module class
    await page.fill('.css-password-input-xyz', 'SuperSecretPassword!');
    
    // Correct locator:
    // await page.fill('#password', 'SuperSecretPassword!');
    
    // ❌ BAD: XPath with position
    await page.click('//*[@id="login"]/button[1]/i[1]');
    
    // Correct locator:
    // await page.click('button[type="submit"]');
  });

  test('Dynamic Content - Element Search', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/dynamic_content');
    
    // ❌ BAD: Using nth-child which changes
    await page.click('div.row:nth-child(1) > div:nth-child(2) > img:nth-child(1)');
    
    // ✅ GOOD: Using alt text or data attributes would be better
  });

  test('Checkboxes - Mixed Locators', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/checkboxes');
    
    // ❌ BAD: Generic input selector with index
    await page.check('input[type="checkbox"]:nth-child(1)');
    
    // ✅ GOOD: Works but could be better with data-testid
    await page.check('input[type="checkbox"]').first();
  });
});

test.describe('Self-Healing Confidence Levels', () => {
  
  test('High Confidence Healing - data-testid available', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // ❌ Broken: Random ID
    // await page.click('#submit-btn-random-123');
    
    // ✅ Expected healing (95% confidence): [data-testid="submit-btn"]
    // Self-healing should find this with high confidence
  });

  test('Medium Confidence Healing - aria-label available', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // ❌ Broken: Dynamic class
    // await page.click('.dynamic-class-abc123');
    
    // ✅ Expected healing (85% confidence): [aria-label="Submit"]
    // Self-healing should find this with medium confidence
  });

  test('Low Confidence Healing - only text available', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // ❌ Broken: Complex XPath
    // await page.click('/html/body/div[3]/section[2]/button[1]');
    
    // ✅ Expected healing (65% confidence): text=Submit
    // Self-healing should find this with lower confidence
  });
});

test.describe('Unstable Pattern Detection', () => {
  
  test('Pattern 1: Long Numeric IDs', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // These patterns should be flagged as unstable:
    const unstableSelectors = [
      '#element-1234567890',        // Long numeric ID
      '#user-id-9876543210',        // ID with numbers
      '#timestamp-1638457890123',   // Timestamp in ID
    ];
    
    // Self-healing should detect these as unstable
    // and suggest alternatives immediately
  });

  test('Pattern 2: CSS Modules', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // CSS module patterns (flagged as unstable):
    const cssModulePatterns = [
      '.css-1x2y3z4',
      '.sc-fznyAO',
      '.jss-button-123',
    ];
    
    // Expected: Immediate unstable warning
    // Confidence: <50% (very unstable)
  });

  test('Pattern 3: UUIDs and Random Strings', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // UUID patterns (flagged as unstable):
    const uuidPatterns = [
      '#uuid-550e8400-e29b-41d4-a716-446655440000',
      '#random-abc-def-123-456',
      '#guid-12345678-1234-1234-1234-123456789012',
    ];
    
    // Expected: Immediate detection and alternative suggestion
  });
});
