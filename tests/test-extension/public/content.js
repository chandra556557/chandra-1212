(function(){
  let recording = false;
  let events = [];
  let startUrl = '';

  function cssPath(el) {
    if (!(el instanceof Element)) return '';
    const path = [];
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += `#${el.id}`;
        path.unshift(selector);
        break;
      } else {
        // add classes if any
        if (el.className) {
          const classes = el.className.split(/\s+/).filter(Boolean);
          if (classes.length) selector += '.' + classes.join('.');
        }
        // position among siblings
        let sib = el;
        let nth = 1;
        while (sib = sib.previousElementSibling) {
          if (sib.nodeName.toLowerCase() === el.nodeName.toLowerCase()) nth++;
        }
        selector += `:nth-of-type(${nth})`;
      }
      path.unshift(selector);
      el = el.parentElement;
    }
    return path.join(' > ');
  }

  function buildCode() {
    const lines = [];
    lines.push("import { test, expect } from '@playwright/test';");
    lines.push("test('Recorded Script', async ({ page }) => {");
    if (startUrl) lines.push(`  await page.goto('${startUrl}');`);
    for (const ev of events) {
      if (ev.type === 'click') {
        lines.push(`  await page.click('${ev.selector}');`);
      } else if (ev.type === 'fill') {
        lines.push(`  await page.fill('${ev.selector}', '${ev.value.replace(/'/g, "\\'")}');`);
      } else if (ev.type === 'press') {
        lines.push(`  await page.press('${ev.selector}', '${ev.key}');`);
      }
    }
    lines.push('});');
    return lines.join('\n');
  }

  function startRecording(){
    if (recording) return;
    recording = true;
    events = [];
    startUrl = location.href;
    window.addEventListener('click', onClick, true);
    window.addEventListener('input', onInput, true);
    window.addEventListener('keydown', onKeyDown, true);
  }

  function stopRecording(){
    if (!recording) return;
    recording = false;
    window.removeEventListener('click', onClick, true);
    window.removeEventListener('input', onInput, true);
    window.removeEventListener('keydown', onKeyDown, true);
    const code = buildCode();
    chrome.runtime.sendMessage({ type: 'RECORD_RESULT', code, events });
  }

  function onClick(e){
    if (!recording) return;
    const target = e.target;
    const selector = cssPath(target);
    events.push({ type: 'click', selector });
  }

  function onInput(e){
    if (!recording) return;
    const target = e.target;
    if (!target || !('value' in target)) return;
    const selector = cssPath(target);
    events.push({ type: 'fill', selector, value: target.value });
  }

  function onKeyDown(e){
    if (!recording) return;
    const target = e.target;
    const selector = cssPath(target);
    events.push({ type: 'press', selector, key: e.key });
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === 'RECORD_START') {
      startRecording();
      sendResponse({ ok: true });
      return true;
    }
    if (msg?.type === 'RECORD_STOP') {
      stopRecording();
      sendResponse({ ok: true });
      return true;
    }
  });
})();