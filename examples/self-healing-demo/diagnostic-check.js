/**
 * DIAGNOSTIC SCRIPT - Run this in Extension Console
 * 
 * HOW TO USE:
 * 1. Open Playwright extension
 * 2. Press F12 (opens DevTools)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter
 * 6. Read the output
 */

(async function() {
  console.clear();
  console.log('═══════════════════════════════════════════');
  console.log('  🔍 SELF-HEALING DIAGNOSTIC CHECK');
  console.log('═══════════════════════════════════════════\n');

  let issues = [];
  let fixes = [];

  // Check 1: Integration Module
  console.log('1️⃣ Checking Integration Module...');
  if (typeof realDataIntegration !== 'undefined') {
    console.log('  ✅ realDataIntegration is loaded');
    
    if (realDataIntegration.isListening) {
      console.log('  ✅ Integration is LISTENING (Test Executor is open)');
    } else {
      console.log('  ⚠️  Integration NOT listening');
      issues.push('Integration not listening');
      fixes.push('OPEN Test Executor: Click "Execute" button (🧪)');
    }
    
    const execCount = realDataIntegration.activeExecutions?.size || 0;
    console.log(`  📊 Active executions: ${execCount}`);
  } else {
    console.log('  ❌ realDataIntegration NOT loaded');
    issues.push('Integration module not loaded');
    fixes.push('RELOAD extension: chrome://extensions/ → Reload button');
  }

  // Check 2: Self-Healing Service
  console.log('\n2️⃣ Checking Self-Healing Service...');
  if (typeof selfHealingService !== 'undefined') {
    console.log('  ✅ selfHealingService is loaded');
    
    const suggestions = await selfHealingService.getSuggestions();
    console.log(`  📊 Suggestions in storage: ${suggestions.length}`);
    
    if (suggestions.length === 0) {
      console.log('  ⚠️  No suggestions found');
      issues.push('No suggestions in storage');
      fixes.push('RUN a test that FAILS through Test Executor');
    } else {
      console.log('  ✅ Found suggestions:');
      suggestions.forEach((s, i) => {
        const conf = Math.round(s.confidence * 100);
        console.log(`     ${i+1}. ${s.brokenLocator} → ${s.validLocator} (${conf}%)`);
      });
    }
  } else {
    console.log('  ❌ selfHealingService NOT loaded');
    issues.push('Service not loaded');
    fixes.push('RELOAD extension completely');
  }

  // Check 3: Statistics
  console.log('\n3️⃣ Checking Statistics...');
  try {
    const stats = await selfHealingService.getStatistics();
    console.table({
      'Total Suggestions': stats.total,
      'Pending': stats.pending,
      'Approved': stats.approved,
      'Rejected': stats.rejected,
      'Avg Confidence': `${Math.round(stats.averageConfidence * 100)}%`
    });
    
    if (stats.total === 0) {
      console.log('  ⚠️  No suggestions have been created yet');
    }
  } catch (error) {
    console.log('  ❌ Error getting statistics:', error.message);
  }

  // Check 4: Storage
  console.log('\n4️⃣ Checking Chrome Storage...');
  chrome.storage.local.get(null, (data) => {
    const allKeys = Object.keys(data);
    const healingKeys = allKeys.filter(k => k.includes('healing') || k.includes('suggestion'));
    
    console.log(`  📦 Total storage keys: ${allKeys.length}`);
    console.log(`  📦 Healing-related keys: ${healingKeys.length}`);
    
    if (healingKeys.length > 0) {
      console.log('  ✅ Healing data found in storage:');
      healingKeys.forEach(key => console.log(`     - ${key}`));
    } else {
      console.log('  ⚠️  No healing data in storage');
    }
  });

  // Check 5: Event System Test
  console.log('\n5️⃣ Testing Event System...');
  let eventWorking = false;
  
  const testListener = (e) => {
    console.log('  ✅ Event system WORKING! Received:', e.detail);
    eventWorking = true;
  };
  
  window.addEventListener('locatorFailed', testListener, { once: true });
  
  // Dispatch test event
  window.dispatchEvent(new CustomEvent('locatorFailed', {
    detail: {
      testId: 'diagnostic-test-' + Date.now(),
      locator: '#diagnostic-locator',
      error: 'Diagnostic test error'
    }
  }));
  
  setTimeout(() => {
    if (eventWorking) {
      console.log('  ✅ Event system is functional');
    } else {
      console.log('  ❌ Event system not responding');
      issues.push('Event system not working');
      fixes.push('REBUILD extension: npm run build in examples/recorder-crx');
    }
  }, 500);

  // Summary
  setTimeout(() => {
    console.log('\n═══════════════════════════════════════════');
    console.log('  📋 DIAGNOSTIC SUMMARY');
    console.log('═══════════════════════════════════════════\n');
    
    if (issues.length === 0) {
      console.log('  ✅ ALL CHECKS PASSED!');
      console.log('\n  If you still don\'t see suggestions:');
      console.log('  1. Make sure Test Executor is OPEN');
      console.log('  2. Run a test that FAILS');
      console.log('  3. Click "Heal" button → "Refresh"');
    } else {
      console.log('  ⚠️  ISSUES FOUND:\n');
      issues.forEach((issue, i) => {
        console.log(`  ${i+1}. ${issue}`);
      });
      
      console.log('\n  🔧 RECOMMENDED FIXES:\n');
      fixes.forEach((fix, i) => {
        console.log(`  ${i+1}. ${fix}`);
      });
    }
    
    console.log('\n═══════════════════════════════════════════');
    console.log('  NEXT STEPS:');
    console.log('═══════════════════════════════════════════\n');
    console.log('  If Test Executor is NOT open:');
    console.log('  → Click "Execute" button (🧪) in toolbar\n');
    console.log('  If no suggestions appear:');
    console.log('  → Run the manual test below\n');
    console.log('═══════════════════════════════════════════\n');
    
  }, 1000);

})();

// MANUAL TEST - Run this separately to create a test suggestion
console.log('\n📝 MANUAL TEST AVAILABLE:');
console.log('If automatic capture isn\'t working, run this:\n');
console.log('await selfHealingService.recordFailure(');
console.log('  { locator: "#test-123", type: "id", confidence: 0.3 },');
console.log('  { locator: "[data-testid=\\"test\\"]", type: "testid", confidence: 0.95 }');
console.log(');');
console.log('console.log("✅ Manual suggestion created! Refresh Heal panel.");');
